using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace ktucec.Features.Announcements;


// 1. QUERY RESPONSE
public record AnnouncementDto(int Id, string Title, string Content, DateTime CreatedAt);


// 2. HANDLER
public class GetAllAnnouncementsHandler
{
    private readonly KtucecDbContext _context;

    public GetAllAnnouncementsHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<List<AnnouncementDto>> HandleAsync()
    {
        return await _context.Announcements
            .AsNoTracking() 
            .OrderByDescending(a => a.CreatedAt) 
            .Select(a => new AnnouncementDto(a.Id, a.Title, a.Content, a.CreatedAt))
            .ToListAsync();
    }
}


// 3. ENDPOINT
public static class GetAllAnnouncementsEndpoint
{
    public static void MapGetAllAnnouncements(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/announcements", async (GetAllAnnouncementsHandler handler) =>
        {
            var announcements = await handler.HandleAsync();

            var finalResult = new ApiResult<List<AnnouncementDto>>(true, announcements, "Duyurular listelendi.");
            return Results.Ok(finalResult);
        });
    }
}