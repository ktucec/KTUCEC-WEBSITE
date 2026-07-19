using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using System;

namespace ktucec.Features.Announcements;

// 1. REQUEST & RESPONSE 
public record UpdateAnnouncementRequest(string? Title, string? Content);
public record UpdateAnnouncementResponse(int Id);

// 2. HANDLER
public class UpdateAnnouncementHandler
{
    private readonly KtucecDbContext _context;
    public UpdateAnnouncementHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateAnnouncementResponse?> HandleAsync(int id, UpdateAnnouncementRequest request)
    {
        var announcement = await _context.Announcements.FindAsync(id);
        if (announcement == null)
            return null;

        // update only not null items
        if (request.Title is not null)
            announcement.Title = request.Title;

        if (request.Content is not null)
            announcement.Content = request.Content;

        await _context.SaveChangesAsync();
        return new UpdateAnnouncementResponse(announcement.Id);
    }
}

// 3. ENDPOINT
public static class UpdateAnnouncementEndpoint
{
    public static void MapUpdateAnnouncement(this IEndpointRouteBuilder app)
    {
        app.MapPatch("/api/announcements/{id}", async (int id, UpdateAnnouncementRequest request, UpdateAnnouncementHandler handler) =>
        {
            if (request.Title is not null && string.IsNullOrWhiteSpace(request.Title))
                return Results.BadRequest(new ApiResult(false, "Duyuru başlığı boş olamaz!"));

            if (request.Content is not null && string.IsNullOrWhiteSpace(request.Content))
                return Results.BadRequest(new ApiResult(false, "Duyuru içeriği boş olamaz!"));

            var response = await handler.HandleAsync(id, request);

            if (response == null)
                return Results.NotFound(new ApiResult(false, $"ID'si {id} olan duyuru bulunamadı."));

            var finalResult = new ApiResult<UpdateAnnouncementResponse>(true, response, "Duyuru başarıyla güncellendi.");
            return Results.Ok(finalResult);
        })
        .RequireRateLimiting("FlexPolicy")
        .RequireAuthorization("AdminAndManager");
    }
}