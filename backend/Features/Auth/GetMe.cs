using System.Security.Claims;
using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Auth;

// 1. REQUEST & RESPONSE
public record GetMeResponse(
    string NameSurname,
    string? ProfileUrl,
    UserRole Role,
    ManagerRole? AdminRole
);


// 2. HANDLER 
public class GetMeHandler
{
    private readonly KtucecDbContext _context;

    public GetMeHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResult<GetMeResponse>> HandleAsync(ClaimsPrincipal userClaims)
    {
        var userIdClaim = userClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return new ApiResult<GetMeResponse>(false, null!, "Kullanıcı kimliği okunamadı.");
        }

        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return new ApiResult<GetMeResponse>(false, null!, "Kullanıcı bulunamadı.");
        }

        var data = new GetMeResponse(
            NameSurname: user.NameSurname,
            ProfileUrl: user.ProfileUrl,
            Role: user.Role,
            AdminRole: user.ManagerRole
        );

        return new ApiResult<GetMeResponse>(true, data, "Kullanıcı bilgileri başarıyla getirildi.");
    }
}


// 3. ENDPOINT 
public static class GetMeEndpoint
{
    public static void MapGetMe(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/auth/me", async (HttpContext httpContext, GetMeHandler handler) =>
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