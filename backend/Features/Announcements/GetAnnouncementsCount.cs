using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Announcements;

// 1. QUERY RESPONSE
public record GetAnnouncementsCountResponse(int Count);

// 2. HANDLER
public class GetAnnouncementsCountHandler
{
    private readonly KtucecDbContext _context;
    public GetAnnouncementsCountHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<GetAnnouncementsCountResponse> HandleAsync()
    {
        var count = await _context.Announcements.CountAsync();
        return new GetAnnouncementsCountResponse(count);
    }
}

// 3. ENDPOINT
public static class GetAnnouncementsCountEndpoint
{
    public static void MapGetAnnouncementsCount(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/announcements/count", async (GetAnnouncementsCountHandler handler) =>
        {
            var response = await handler.HandleAsync();
            var finalResult = new ApiResult<GetAnnouncementsCountResponse>(true, response, "Duyuru sayısı getirildi.");
            return Results.Ok(finalResult);
        })
        .RequireRateLimiting("FlexPolicy");
    }
}