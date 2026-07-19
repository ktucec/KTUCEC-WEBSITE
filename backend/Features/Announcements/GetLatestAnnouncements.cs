using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace ktucec.Features.Announcements;


// 1. HANDLER
public class GetLatestAnnouncementsHandler
{
    private readonly KtucecDbContext _context;

    public GetLatestAnnouncementsHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<List<AnnouncementDto>> HandleAsync(int count)
    {
        return await _context.Announcements
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedAt) 
            .Take(count) 
            .Select(a => new AnnouncementDto(a.Id, a.Title, a.Content, a.CreatedAt))
            .ToListAsync();
    }
}


// 2. ENDPOINT
public static class GetLatestAnnouncementsEndpoint
{
    public static void MapGetLatestAnnouncements(this IEndpointRouteBuilder app)
    {
        // ex. usage: /api/announcements/latest?count=5
        app.MapGet("/api/announcements/latest", async (int? count, GetLatestAnnouncementsHandler handler) =>
        {
            // unless there is query number, use 3.
            int limit = count ?? 3;

            var latestAnnouncements = await handler.HandleAsync(limit);

            var finalResult = new ApiResult<List<AnnouncementDto>>(true, latestAnnouncements, $"Son {limit} duyuru getirildi.");
            return Results.Ok(finalResult);
        })
        .RequireRateLimiting("FlexPolicy");
    }
}