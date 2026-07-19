using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services;
using ktucec.Infrastructure.Services.Authentication;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Auth;

// 1. RESPONSE 
public record RefreshTokenResponse(string NameSurname, string Role, string ManagerRole);


// 2. HANDLER
public class RefreshTokenHandler
{
    private readonly KtucecDbContext _context;
    private readonly JwtProvider _jwtProvider;

    public RefreshTokenHandler(KtucecDbContext context, JwtProvider jwtProvider)
    {
        _context = context;
        _jwtProvider = jwtProvider;
    }

    public async Task<ApiResult<RefreshTokenResponse>> HandleAsync(HttpContext httpContext)
    {
        // A. reading cookie from browser
        if (!httpContext.Request.Cookies.TryGetValue("refreshToken", out var currentRefreshToken) || string.IsNullOrEmpty(currentRefreshToken))
        {
            return new ApiResult<RefreshTokenResponse>(false, null!, "Oturum geçersiz, refresh token bulunamadı.");
        }

        // B. search for user has token
        var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == currentRefreshToken);

        if (user == null || user.RefreshTokenExpiresAt < DateTime.UtcNow)
        {
            return new ApiResult<RefreshTokenResponse>(false, null!, "Oturum süresi dolmuş, tekrar giriş yapmalısınız.");
        }

        // C. generating new tokens
        var newAccessToken = _jwtProvider.GenerateAccessToken(user);
        var (newRefreshToken, rtExpiresAt) = _jwtProvider.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiresAt = rtExpiresAt;
        await _context.SaveChangesAsync();

        _jwtProvider.SetTokensInCookies(httpContext, newAccessToken, newRefreshToken, rtExpiresAt);

        var responseData = new RefreshTokenResponse(user.NameSurname, user.Role.ToString(), user.ManagerRole.ToString());
        return new ApiResult<RefreshTokenResponse>(true, responseData, "Oturumunuz başarıyla yenilendi!");
    }
}


// 3. ENDPOINT
public static class RefreshTokenEndpoint
{
    public static void MapRefreshToken(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/refresh", async (RefreshTokenHandler handler, HttpContext httpContext) =>
        {
            var result = await handler.HandleAsync(httpContext);

            if (!result.IsSuccess)
            {
                return Results.Json(result, statusCode: StatusCodes.Status401Unauthorized);
            }

            return Results.Ok(result);
        })
        .RequireAuthorization()
        .RequireRateLimiting("StrictPolicy");
    }
}