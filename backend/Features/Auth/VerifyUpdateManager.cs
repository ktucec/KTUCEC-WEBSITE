using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services;
using ktucec.Shared.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ktucec.Features.Auth;

// 1. RESPONSE
public record VerifyUpdateManagerResponse(
    bool RequiresVerification,
    string Message
);

// 2. HANDLER
public class VerifyUpdateManagerHandler
{
    private readonly KtucecDbContext _context;
    private readonly EmailService _emailService;

    public VerifyUpdateManagerHandler(
        KtucecDbContext context,
        EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<ApiResult<VerifyUpdateManagerResponse>> HandleAsync(
        HttpContext httpContext)
    {
        var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            return new ApiResult<VerifyUpdateManagerResponse>(
                false,
                null!,
                "Oturum bilgisi bulunamadı."
            );
        }

        var userId = int.Parse(userIdClaim);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return new ApiResult<VerifyUpdateManagerResponse>(
                false,
                null!,
                "Kullanıcı bulunamadı."
            );
        }

        // B. generate otp
        var otpCode = new Random().Next(100000, 999999).ToString();
        user.OtpCode = otpCode;
        user.OtpCodeExpiresAt = DateTime.UtcNow.AddMinutes(5);
        await _context.SaveChangesAsync();

        // C. send mail
        string mailBody =
            $"""
            <h3>KTUCEC Yönetici Güncelleme Doğrulama</h3>
            <p>
            Bilgilerinizi güncellemek için doğrulama kodunuz:
            </p>
            <h2>{otpCode}</h2>
            <p>
            Bu kod 5 dakika geçerlidir.
            </p>
            """;

        await _emailService.SendEmailAsync(
            user.Email,
            "KTUCEC Güncelleme Doğrulama Kodu",
            mailBody
        );

        var response = new VerifyUpdateManagerResponse(
            true,
            "Doğrulama kodu mail adresinize gönderildi."
        );

        return new ApiResult<VerifyUpdateManagerResponse>(
            true,
            response,
            "Kod gönderildi."
        );
    }
}

// 3. ENDPOINT
public static class VerifyUpdateManagerEndpoint
{
    public static void MapVerifyUpdateManager(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/managers/verify-update", async (
            VerifyUpdateManagerHandler handler,
            HttpContext httpContext) =>
        {
            var result = await handler.HandleAsync(httpContext);

            if (!result.IsSuccess)
            {
                return Results.BadRequest(result);
            }

            return Results.Ok(result);
        })
        .RequireAuthorization("AdminAndManager")
        .RequireRateLimiting("StrictPolicy");
    }
}