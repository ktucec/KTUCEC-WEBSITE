using System.Security.Claims;
using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Auth;

// 1. REQUEST & RESPONSE
public record SystemRoleResponse(
    UserRole Role,
    string RoleName,
    string Email,
    string FullName
);


// 2. HANDLER 
public class SystemRoleHandler
{
    private readonly KtucecDbContext _context;

    public SystemRoleHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResult<SystemRoleResponse>> HandleAsync(ClaimsPrincipal userClaims)
    {
        var userIdClaim = userClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return new ApiResult<SystemRoleResponse>(false, null!, "Kullanıcı kimliği okunamadı.");
        }

        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return new ApiResult<SystemRoleResponse>(false, null!, "Kullanıcı bulunamadı.");
        }

        var data = new SystemRoleResponse(
            Role: user.Role,
            RoleName: user.Role.ToString(),
            Email: user.Email,
            FullName: user.NameSurname
        );

        return new ApiResult<SystemRoleResponse>(true, data, "Sistem rolü başarıyla getirildi.");
    }
}


// 3. ENDPOINT 
public static class SystemRoleEndpoint
{
    public static void MapSystemRole(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/auth/system-role", async (HttpContext httpContext, SystemRoleHandler handler) =>
        {
            var result = await handler.HandleAsync(httpContext.User);

            if (!result.IsSuccess)
                return Results.Unauthorized();

            return Results.Ok(result);
        })
        .RequireAuthorization()
        .RequireRateLimiting("FlexPolicy");
    }
}