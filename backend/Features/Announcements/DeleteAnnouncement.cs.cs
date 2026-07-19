using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using System;

namespace ktucec.Features.Announcements;

// 1. RESPONSE
public record DeleteAnnouncementResponse(int Id);


// 2. HANDLER
public class DeleteAnnouncementHandler
{
    private readonly KtucecDbContext _context;

    public DeleteAnnouncementHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<DeleteAnnouncementResponse?> HandleAsync(int id)
    {
        var announcement = await _context.Announcements.FindAsync(id);

        if (announcement == null)
            return null;

        _context.Announcements.Remove(announcement);
        await _context.SaveChangesAsync();

        return new DeleteAnnouncementResponse(announcement.Id);
    }
}


// 3. ENDPOINT
public static class DeleteAnnouncementEndpoint
{
    public static void MapDeleteAnnouncement(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/announcements/{id}", async (int id, DeleteAnnouncementHandler handler) =>
        {
            var response = await handler.HandleAsync(id);

            if (response == null)
                return Results.NotFound(new ApiResult(false, $"ID'si {id} olan duyuru zaten bulunamadı."));

            var finalResult = new ApiResult<DeleteAnnouncementResponse>(true, response, "Duyuru başarıyla silindi.");
            return Results.Ok(finalResult);
        })
        .RequireRateLimiting("FlexPolicy");
    }
}