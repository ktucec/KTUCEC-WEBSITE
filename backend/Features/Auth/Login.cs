using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services;
using ktucec.Infrastructure.Services.Authentication;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Auth;


// 1. REQUEST & RESPONSE
public record LoginRequest(string Email, string Password);
public record LoginResponse(bool RequiresVerification, string Message, string? Email);


// 2. HANDLER 
public class LoginHandler
{
    private readonly KtucecDbContext _context;
    private readonly PasswordHasher _passwordHasher;
    private readonly EmailService _emailService;
    private readonly JwtProvider _jwtProvider;

    public LoginHandler(
        KtucecDbContext context,
        PasswordHasher passwordHasher,
        EmailService emailService,
        JwtProvider jwtProvider)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
        _jwtProvider = jwtProvider;
    }

    public async Task<ApiResult<LoginResponse>> HandleAsync(LoginRequest request, HttpContext httpContext)
    {
        // A. user check
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || !_passwordHasher.VerifyPassword(user.PasswordHash, request.Password))
        {
            return new ApiResult<LoginResponse>(false, null!, "E-posta veya şifre hatalı.");
        }

        // B. admin and manager roles
        if (user.Role == UserRole.Admin || user.Role == UserRole.Manager)
        {
            var otpCode = new Random().Next(100000, 999999).ToString();

            user.OtpCode = otpCode;
            user.OtpCodeExpiresAt = DateTime.UtcNow.AddMinutes(5);

            await _context.SaveChangesAsync();

            string mailBody = $"<h3>KTUCEC Yönetim Paneli Giriş Doğrulama</h3><p>Giriş yapabilmek için geçici kodunuz: <b>{otpCode}</b></p><p>Bu kod 5 dakika geçerlidir.</p>";
            await _emailService.SendEmailAsync(user.Email, "KTUCEC Giriş Doğrulama Kodu", mailBody);

            var data = new LoginResponse(true, "Yönetici doğrulaması gerekiyor. Kod mailinize gönderildi.", user.Email);
            return new ApiResult<LoginResponse>(true, data, "Doğrulama kodu gönderildi.");
        }

        // C. unconfirmed normal member
        if (!user.IsEmailConfirmed)
        {
            var activationToken = new Random().Next(100000, 999999).ToString();

            user.EmailConfirmationToken = activationToken;
            user.EmailConfirmationTokenExpiresAt = DateTime.UtcNow.AddMinutes(15);

            await _context.SaveChangesAsync();

            string mailBody = $"<h3>KTUCEC Üye Hesabı Aktivasyonu</h3><p>Hesabınızı onaylamak için aktivasyon kodunuz: <b>{activationToken}</b></p>";
            await _emailService.SendEmailAsync(user.Email, "KTUCEC Hesap Aktivasyonu", mailBody);

            var data = new LoginResponse(true, "Hesabınız henüz aktive edilmemiş. Aktivasyon kodu mailinize gönderildi.", user.Email);
            return new ApiResult<LoginResponse>(true, data, "Aktivasyon gerekiyor.");
        }

        // D. confirmed normal member
        var accessToken = _jwtProvider.GenerateAccessToken(user);
        var (refreshToken, rtExpiresAt) = _jwtProvider.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = rtExpiresAt;
        await _context.SaveChangesAsync();

        _jwtProvider.SetTokensInCookies(httpContext, accessToken, refreshToken, rtExpiresAt);

        var successData = new LoginResponse(false, "Giriş başarılı, hoş geldiniz!", null);
        return new ApiResult<LoginResponse>(true, successData, "Giriş başarılı!");
    }
}

// 3. ENDPOINT 
public static class LoginEndpoint
{
    public static void MapLogin(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/login", async (LoginRequest request, LoginHandler handler, HttpContext httpContext) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return Results.BadRequest(new ApiResult(false, "E-posta ve şifre alanları boş geçilemez."));

            var result = await handler.HandleAsync(request, httpContext);

            if (!result.IsSuccess)
                return Results.BadRequest(result);

            return Results.Ok(result);
        })
        .RequireRateLimiting("StrictPolicy");
    }
}
