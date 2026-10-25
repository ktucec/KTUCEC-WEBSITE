using ktucec.Domain.Entities;
using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Codewave;
using ktucec.Shared.Common;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Codewave;


// 1. REQUEST & RESPONSE
public record CreateCodewaveOrderRequest(
    string? OrderId,
    string? FirstName,
    string? LastName,
    string? Email,
    string? Phone,
    string? City,
    string? AttendeeType,
    string? Language,
    decimal ListPrice,
    decimal DiscountAmount,
    decimal TotalPrice,
    string? Currency,
    string? DiscountCode);

public record CreateCodewaveOrderResponse(string OrderId, decimal TotalPrice);


// 2. HANDLER
// YALNIZCA codewave sunucusu çağırır (X-Codewave-Key). Shopier'e yönlendirmeden hemen önce başvuruyu
// "Pending" olarak kaydeder; indirim kodu varsa onu atomik olarak bu siparişe ayırır.
public class CreateCodewaveOrderHandler
{
    private readonly KtucecDbContext _context;

    public CreateCodewaveOrderHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<IResult> HandleAsync(CreateCodewaveOrderRequest request)
    {
        // A. INPUT VALIDATION (codewave tarafı da doğruluyor; burada güvenmeden tekrar kontrol edilir)
        var orderId = (request.OrderId ?? string.Empty).Trim();
        var firstName = (request.FirstName ?? string.Empty).Trim();
        var lastName = (request.LastName ?? string.Empty).Trim();
        var email = CodewaveRules.NormalizeEmail(request.Email);
        var phone = (request.Phone ?? string.Empty).Trim();
        var city = (request.City ?? string.Empty).Trim();
        var language = request.Language == "EN" ? "EN" : "TR";
        var currency = (request.Currency ?? string.Empty).Trim().ToUpperInvariant();
        var hasCode = !string.IsNullOrWhiteSpace(request.DiscountCode);
        var discountCode = hasCode ? CodewaveRules.NormalizeDiscountCode(request.DiscountCode) : null;

        if (!CodewaveRules.IsValidOrderId(orderId)
            || firstName.Length is 0 or > 50
            || lastName.Length is 0 or > 50
            || email.Length is 0 or > CodewaveRules.EmailMaxLength || !email.Contains('@')
            || phone.Length is < 8 or > 16
            || city.Length is 0 or > 60
            || currency.Length != 3
            || !Enum.TryParse<CodewaveAttendeeType>(request.AttendeeType, ignoreCase: true, out var attendeeType)
            || !Enum.IsDefined(attendeeType))
        {
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "invalid", "Sipariş bilgileri geçersiz.");
        }

        // Tutarlar: indirim yalnızca kodla birlikte ve toplam = liste - indirim olmalı
        if (request.ListPrice <= 0 || request.DiscountAmount < 0 || request.TotalPrice <= 0
            || request.DiscountAmount >= request.ListPrice
            || request.TotalPrice != request.ListPrice - request.DiscountAmount
            || hasCode != (request.DiscountAmount > 0))
        {
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "invalid_amount", "Sipariş tutarı geçersiz.");
        }

        if (hasCode && !CodewaveRules.IsValidDiscountCode(discountCode))
            return CodewaveResults.Error(StatusCodes.Status404NotFound, "discount_invalid", "İndirim kodu geçersiz.");

        if (await _context.CodewaveApplications.AnyAsync(a => a.OrderId == orderId))
            return CodewaveResults.Error(StatusCodes.Status409Conflict, "order_exists", "Bu sipariş zaten oluşturulmuş.");

        var now = DateTime.UtcNow;
        await using var transaction = await _context.Database.BeginTransactionAsync();

        // B. İNDİRİM KODUNU AYIR (tek UPDATE: aynı kodla eşzamanlı iki ödemeden yalnızca biri kazanır)
        int? discountId = null;
        if (hasCode)
        {
            DateTime? reservedUntil = now.Add(CodewaveRules.DiscountReservation);
            DateTime? updatedAt = now;

            var reserved = await _context.CodewaveStudentDiscounts
                .Where(d => d.DiscountCode == discountCode
                            && d.IsVerified
                            && d.RedeemedAt == null
                            && (d.ReservedUntil == null || d.ReservedUntil < now))
                .ExecuteUpdateAsync(s => s
                    .SetProperty(d => d.ReservedOrderId, orderId)
                    .SetProperty(d => d.ReservedUntil, reservedUntil)
                    .SetProperty(d => d.UpdatedAt, updatedAt));

            var entry = await _context.CodewaveStudentDiscounts
                .AsNoTracking()
                .Where(d => d.DiscountCode == discountCode)
                .Select(d => new { d.Id, d.RedeemedAt, d.IsVerified })
                .FirstOrDefaultAsync();

            if (reserved == 0)
            {
                if (entry is null || !entry.IsVerified)
                    return CodewaveResults.Error(StatusCodes.Status404NotFound, "discount_invalid", "İndirim kodu geçersiz.");
                if (entry.RedeemedAt is not null)
                    return CodewaveResults.Error(StatusCodes.Status409Conflict, "discount_used", "Bu indirim kodu daha önce kullanılmış.");
                return CodewaveResults.Error(StatusCodes.Status409Conflict, "discount_reserved", "Bu indirim kodu şu anda başka bir ödemede kullanılıyor. Biraz sonra tekrar deneyin.");
            }

            discountId = entry!.Id;
        }

        // C. BAŞVURUYU KAYDET
        var application = new CodewaveApplication
        {
            OrderId = orderId,
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            City = city,
            AttendeeType = attendeeType,
            Language = language,
            ListPrice = request.ListPrice,
            DiscountAmount = request.DiscountAmount,
            TotalPrice = request.TotalPrice,
            Currency = currency,
            CodewaveStudentDiscountId = discountId,
            DiscountCode = discountCode,
            Status = CodewaveApplicationStatus.Pending,
            CreatedAt = now
        };

        _context.CodewaveApplications.Add(application);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        var data = new CreateCodewaveOrderResponse(orderId, application.TotalPrice);
        return Results.Ok(new ApiResult<CreateCodewaveOrderResponse>(true, data, "Sipariş oluşturuldu."));
    }
}


// 3. ENDPOINT
public static class CreateCodewaveOrderEndpoint
{
    public static void MapCreateCodewaveOrder(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/codewave/internal/orders", (CreateCodewaveOrderRequest request, CreateCodewaveOrderHandler handler) =>
            handler.HandleAsync(request))
        .AddEndpointFilter<CodewaveInternalKeyFilter>()
        .ExcludeFromDescription();
    }
}
