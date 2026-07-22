using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services;
using ktucec.Infrastructure.Services.Authentication;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Auth;


// 1. REQUEST & RESPONSE
public record VerifyCodeRequest(string Email, string Code);
public record VerifyCodeResponse(string NameSurname, string Role, string ManagerRole);


// 2. HANDLER
public class VerifyCodeHandler
{
    private readonly KtucecDbContext _context;
    private readonly JwtProvider _jwtProvider;

    public VerifyCodeHandler(KtucecDbContext context, JwtProvider jwtProvider)
    {
        _context = context;
        _jwtProvider = jwtProvider;
    }

    public async Task<ApiResult<VerifyCodeResponse>> HandleAsync(VerifyCodeRequest request, HttpContext httpContext)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            return new ApiResult<VerifyCodeResponse>(false, null!, "Kullanıcı bulunamadı.");
        }

        var now = DateTime.UtcNow;

        // A. admin or manager
        if (user.Role == UserRole.Admin || user.Role == UserRole.Manager)
        {
            if (string.IsNullOrEmpty(user.OtpCode) || user.OtpCode != request.Code || user.OtpCodeExpiresAt < now)
            {
                return new ApiResult<VerifyCodeResponse>(false, null!, "Doğrulama kodu hatalı veya süresi dolmuş.");
            }

            user.OtpCode = null;
            user.OtpCodeExpiresAt = null;
        }

        // B. normal member
        else
        {
            if (string.IsNullOrEmpty(user.EmailConfirmationToken) || user.EmailConfirmationToken != request.Code || user.EmailConfirmationTokenExpiresAt < now)
            {
                return new ApiResult<VerifyCodeResponse>(false, null!, "Aktivasyon kodu hatalı veya süresi dolmuş.");
            }

            user.IsEmailConfirmed = true;
            user.EmailConfirmationToken = null;
            user.EmailConfirmationTokenExpiresAt = null;
        }

        // C. generate token and set into cookie
        var accessToken = _jwtProvider.GenerateAccessToken(user);
        var (refreshToken, rtExpiresAt) = _jwtProvider.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = rtExpiresAt;

        await _context.SaveChangesAsync();

        _jwtProvider.SetTokensInCookies(httpContext, accessToken, refreshToken, rtExpiresAt);

        var responseData = new VerifyCodeResponse(user.NameSurname, user.Role.ToString(), user.ManagerRole.ToString());
        return new ApiResult<VerifyCodeResponse>(true, responseData, "Doğrulama başarılı, giriş sağlanıyor...");
    }
}


// 3. ENDPOINT
public static class VerifyCodeEndpoint
{
    public static void MapVerifyCode(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/verify-code", async (VerifyCodeRequest request, VerifyCodeHandler handler, HttpContext httpContext) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Code))
                return Results.BadRequest(new ApiResult(false, "E-posta ve kod alanları boş bırakılamaz."));

            var result = await handler.HandleAsync(request, httpContext);

            if (!result.IsSuccess)
                return Results.BadRequest(result);

            return Results.Ok(result);
        })
        .RequireRateLimiting("StrictPolicy");
    }
}
