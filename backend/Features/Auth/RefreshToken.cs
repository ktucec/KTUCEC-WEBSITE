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
        if (!httpContext.Request.Cookies.TryGetValue("refreshToken", out var currentRefreshToken) || string.IsNullOrEmpty(currentRefreshToken))
        {
            return new ApiResult<RefreshTokenResponse>(false, null!, "Oturum geçersiz, refresh token bulunamadı.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == currentRefreshToken);

        if (user == null || user.RefreshTokenExpiresAt < DateTime.UtcNow)
        {
            return new ApiResult<RefreshTokenResponse>(false, null!, "Oturum süresi dolmuş, tekrar giriş yapmalısınız.");
        }

        var newAccessToken = _jwtProvider.GenerateAccessToken(user);

        // Keep the existing refresh token by default to prevent race conditions during concurrent requests
        var activeRefreshToken = user.RefreshToken;
        var activeRtExpiresAt = user.RefreshTokenExpiresAt;
        var requiresDbSave = false;

        // Rotate the refresh token only if it expires in less than 1 day
        if ((user.RefreshTokenExpiresAt - DateTime.UtcNow).TotalDays < 1)
        {
            var (newRefreshToken, rtExpiresAt) = _jwtProvider.GenerateRefreshToken();
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiresAt = rtExpiresAt;

            activeRefreshToken = newRefreshToken;
            activeRtExpiresAt = rtExpiresAt;
            requiresDbSave = true;
        }

        if (requiresDbSave)
        {
            await _context.SaveChangesAsync();
        }

        _jwtProvider.SetTokensInCookies(httpContext, newAccessToken, activeRefreshToken, activeRtExpiresAt);

        var responseData = new RefreshTokenResponse(user.NameSurname, user.Role.ToString(), user.ManagerRole.ToString());
        return new ApiResult<RefreshTokenResponse>(true, responseData, "Oturumunuz başarıyla yenilendi!");
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
            .AllowAnonymous()
            .RequireRateLimiting("StrictPolicy");
        }
    }