using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Codewave;
using ktucec.Infrastructure.Services.Shopier;
using ktucec.Shared.Common;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Codewave;


// 1. REQUEST & RESPONSE
public record VerifyStudentDiscountRequest(string? Email, string? Code);
public record VerifyStudentDiscountResponse(string Email, string DiscountCode, string Status);


// 2. HANDLER
// İki sekmenin ortak doğrulama adımı. İlk doğrulamada adres onaylanır ve indirim kodu üretilir;
// sonraki doğrulamalarda (sorgulama) mevcut kod ve durumu döner. İndirimli ürün Shopier'de açılmışsa
// stoğuna bakılır: stok bittiyse indirim kullanılmıştır.
public class VerifyStudentDiscountHandler
{
    private readonly KtucecDbContext _context;
    private readonly CodewaveSecurityService _security;
    private readonly ShopierApiClient _shopier;

    public VerifyStudentDiscountHandler(KtucecDbContext context, CodewaveSecurityService security, ShopierApiClient shopier)
    {
        _context = context;
        _security = security;
        _shopier = shopier;
    }

    public async Task<IResult> HandleAsync(VerifyStudentDiscountRequest request)
    {
        var email = CodewaveRules.NormalizeEmail(request.Email);
        var code = (request.Code ?? string.Empty).Trim();

        if (!CodewaveRules.IsEduTrEmail(email) || !CodewaveRules.IsValidOtp(code))
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "code_invalid", "Doğrulama kodu hatalı.");

        var entry = await _context.CodewaveStudentDiscounts.FirstOrDefaultAsync(d => d.Email == email);

        // Adres yok ya da bekleyen kod yok: ayrıntı verilmez
        if (entry is null || string.IsNullOrEmpty(entry.OtpCodeHash) || entry.OtpCodeExpiresAt is null)
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "code_invalid", "Doğrulama kodu hatalı.");

        var now = DateTime.UtcNow;

        if (entry.OtpCodeExpiresAt < now)
        {
            entry.OtpCodeHash = null;
            entry.OtpCodeExpiresAt = null;
            await _context.SaveChangesAsync();
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "code_expired", "Kodun süresi doldu. Yeni kod isteyin.");
        }

        if (!_security.VerifyOtp(entry.OtpCodeHash, email, code))
        {
            entry.OtpFailedAttempts++;
            var left = CodewaveRules.OtpMaxFailedAttempts - entry.OtpFailedAttempts;

            // Deneme hakkı bitince kod tamamen geçersiz olur; kaba kuvvetle tahmin edilemez.
            if (left <= 0)
            {
                entry.OtpCodeHash = null;
                entry.OtpCodeExpiresAt = null;
                await _context.SaveChangesAsync();
                return CodewaveResults.Error(StatusCodes.Status429TooManyRequests, "too_many_attempts", "Çok fazla hatalı deneme. Yeni kod isteyin.");
            }

            await _context.SaveChangesAsync();
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "code_invalid", "Doğrulama kodu hatalı.", attemptsLeft: left);
        }

        // Doğru kod: tek kullanımlık olduğu için hemen silinir
        entry.OtpCodeHash = null;
        entry.OtpCodeExpiresAt = null;
        entry.OtpFailedAttempts = 0;

        if (!entry.IsVerified)
        {
            entry.IsVerified = true;
            entry.VerifiedAt = now;
            entry.DiscountCode = await GenerateUniqueCodeAsync();
        }

        await _context.SaveChangesAsync();

        int? stock = null;
        if (!string.IsNullOrEmpty(entry.ShopierProductId))
            stock = (await _shopier.GetProductAsync(entry.ShopierProductId))?.StockQuantity;

        var data = new VerifyStudentDiscountResponse(email, entry.DiscountCode!, CodewaveResults.StatusFromStock(stock));
        return Results.Ok(new ApiResult<VerifyStudentDiscountResponse>(true, data, "E-posta adresiniz doğrulandı."));
    }

    private async Task<string> GenerateUniqueCodeAsync()
    {
        // Çakışma olasılığı yok denecek kadar düşük; yine de veritabanında kontrol edilir.
        for (var i = 0; i < 5; i++)
        {
            var candidate = _security.GenerateDiscountCode();
            if (!await _context.CodewaveStudentDiscounts.AnyAsync(d => d.DiscountCode == candidate))
                return candidate;
        }
        throw new InvalidOperationException("Benzersiz indirim kodu üretilemedi.");
    }
}


// 3. ENDPOINT
public static class VerifyStudentDiscountEndpoint
{
    public static void MapVerifyStudentDiscount(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/codewave/discount/verify", (VerifyStudentDiscountRequest request, VerifyStudentDiscountHandler handler) =>
            handler.HandleAsync(request))
        .RequireRateLimiting("CodewaveVerifyPolicy");
    }
}
