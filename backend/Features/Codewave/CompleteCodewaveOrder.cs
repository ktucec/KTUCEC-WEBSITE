using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Codewave;
using ktucec.Infrastructure.Services.Telegram;
using ktucec.Shared.Common;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Codewave;


// 1. REQUEST & RESPONSE
public record CompleteCodewaveOrderRequest(string? PaymentId, bool Success);
public record CompleteCodewaveOrderResponse(string OrderId, string Status);


// 2. HANDLER
// YALNIZCA codewave sunucusu, Shopier'in imzasını doğruladıktan sonra çağırır (X-Codewave-Key).
// Başarılı ödemede indirim kodu kalıcı olarak "kullanıldı" olur; başarısızlıkta ayrılan kod serbest kalır.
// Aynı sonuç birden fazla gelse de (sayfa yenileme vb.) sonuç değişmez.
public class CompleteCodewaveOrderHandler
{
    private readonly KtucecDbContext _context;
    private readonly TelegramService _telegramService;
    private readonly ILogger<CompleteCodewaveOrderHandler> _logger;

    public CompleteCodewaveOrderHandler(KtucecDbContext context, TelegramService telegramService, ILogger<CompleteCodewaveOrderHandler> logger)
    {
        _context = context;
        _telegramService = telegramService;
        _logger = logger;
    }

    public async Task<IResult> HandleAsync(string orderId, CompleteCodewaveOrderRequest request)
    {
        if (!CodewaveRules.IsValidOrderId(orderId))
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "invalid", "Sipariş numarası geçersiz.");

        var application = await _context.CodewaveApplications
            .Include(a => a.CodewaveStudentDiscount)
            .FirstOrDefaultAsync(a => a.OrderId == orderId);

        if (application is null)
            return CodewaveResults.Error(StatusCodes.Status404NotFound, "not_found", "Sipariş bulunamadı.");

        // Ödenmiş sipariş bir daha değişmez
        if (application.Status == CodewaveApplicationStatus.Paid)
            return Ok(application.OrderId, application.Status);

        var now = DateTime.UtcNow;
        var discount = application.CodewaveStudentDiscount;

        if (request.Success)
        {
            application.Status = CodewaveApplicationStatus.Paid;
            application.PaymentId = TrimTo(request.PaymentId, 64);
            application.PaidAt = now;

            if (discount is not null)
            {
                if (discount.RedeemedAt is null)
                {
                    discount.RedeemedAt = now;
                    discount.RedeemedOrderId = application.OrderId;
                }
                else if (discount.RedeemedOrderId != application.OrderId)
                {
                    // Ayırma süresi dolduktan sonra tamamlanan geç bir ödeme: ikisi de ödendi, incelenmek üzere kaydedilir.
                    _logger.LogWarning("CODEWAVE indirim kodu {DiscountId} ikinci kez ödendi: {OrderId} (ilk: {FirstOrderId})",
                        discount.Id, application.OrderId, discount.RedeemedOrderId);
                }

                if (discount.ReservedOrderId == application.OrderId)
                {
                    discount.ReservedOrderId = null;
                    discount.ReservedUntil = null;
                }
            }
        }
        else
        {
            application.Status = CodewaveApplicationStatus.Failed;

            if (discount is not null && discount.ReservedOrderId == application.OrderId)
            {
                discount.ReservedOrderId = null;
                discount.ReservedUntil = null;
            }
        }

        await _context.SaveChangesAsync();

        if (application.Status == CodewaveApplicationStatus.Paid)
            await NotifyAsync(application.FirstName, application.LastName, application.TotalPrice, application.DiscountCode is not null, application.OrderId);

        return Ok(application.OrderId, application.Status);
    }

    private static IResult Ok(string orderId, CodewaveApplicationStatus status) =>
        Results.Ok(new ApiResult<CompleteCodewaveOrderResponse>(true, new CompleteCodewaveOrderResponse(orderId, status.ToString()), "Sipariş güncellendi."));

    private static string? TrimTo(string? value, int max)
    {
        var v = value?.Trim();
        if (string.IsNullOrEmpty(v)) return null;
        return v.Length > max ? v[..max] : v;
    }

    // Bildirim gönderilemese de ödeme kaydı etkilenmez.
    private async Task NotifyAsync(string firstName, string lastName, decimal total, bool discounted, string orderId)
    {
        try
        {
            var message = $"🎟️ Yeni CODEWAVE 2026 bileti!\n👤 {firstName} {lastName}\n💳 {total:0.##} TL{(discounted ? " (öğrenci indirimi)" : "")}\n🧾 {orderId}";
            await _telegramService.SendMessageAsync(message);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CODEWAVE bilet bildirimi Telegram'a gönderilemedi.");
        }
    }
}


// 3. ENDPOINT
public static class CompleteCodewaveOrderEndpoint
{
    public static void MapCompleteCodewaveOrder(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/codewave/internal/orders/{orderId}/complete", (string orderId, CompleteCodewaveOrderRequest request, CompleteCodewaveOrderHandler handler) =>
            handler.HandleAsync(orderId, request))
        .AddEndpointFilter<CodewaveInternalKeyFilter>()
        .ExcludeFromDescription();
    }
}
