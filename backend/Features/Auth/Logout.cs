using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services;
using ktucec.Infrastructure.Services.Authentication;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Auth;


// 1. RESPONSE
public record LogoutResponse(bool Success);


// 2. HANDLER
public class LogoutHandler
{
    private readonly KtucecDbContext _context;
    private readonly JwtProvider _jwtProvider;

    public LogoutHandler(KtucecDbContext context, JwtProvider jwtProvider)
    {
        _context = context;
        _jwtProvider = jwtProvider;
    }

    public async Task<ApiResult<LogoutResponse>> HandleAsync(HttpContext httpContext)
    {
        if (httpContext.Request.Cookies.TryGetValue("refreshToken", out var currentRefreshToken) && !string.IsNullOrEmpty(currentRefreshToken))
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == currentRefreshToken);

            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiresAt = null;
                await _context.SaveChangesAsync();
            }
        }

        _jwtProvider.ClearCookies(httpContext);

        return new ApiResult<LogoutResponse>(true, new LogoutResponse(true), "Başarıyla çıkış yapıldı.");
    }
}


// 3. ENDPOINT
public static class LogoutEndpoint
{
    public static void MapLogout(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/logout", async (LogoutHandler handler, HttpContext httpContext) =>
        {
            var result = await handler.HandleAsync(httpContext);
            return Results.Ok(result);
        });
    }
}