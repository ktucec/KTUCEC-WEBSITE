using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Auth;

// 1. RESPONSE
public record GetManagersCountResponse(int Count);

// 2. HANDLER
public class GetManagersCountHandler
{
    private readonly KtucecDbContext _context;
    public GetManagersCountHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<GetManagersCountResponse> HandleAsync()
    {
        var count = await _context.Users
            .Where(u => u.Role == UserRole.Manager)
            .CountAsync();
        return new GetManagersCountResponse(count);
    }
}

// 3. ENDPOINT
public static class GetManagersCountEndpoint
{
    public static void MapGetManagersCount(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/auth/managers/count", async (GetManagersCountHandler handler) =>
        {
            var response = await handler.HandleAsync();
            var finalResult = new ApiResult<GetManagersCountResponse>(true, response, "Kulüp yöneticisi sayısı getirildi.");
            return Results.Ok(finalResult);
        })
        .RequireAuthorization("AdminAndManager")
        .RequireRateLimiting("FlexPolicy");
    }
}