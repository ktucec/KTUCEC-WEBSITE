using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Media;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace ktucec.Features.Events;

// 1. RESPONSE
public record DeleteEventResponse(int Id);

// 2. HANDLER
public class DeleteEventHandler
{
    private readonly KtucecDbContext _context;
    private readonly ImageService _imageService;

    public DeleteEventHandler(KtucecDbContext context, ImageService imageService)
    {
        _context = context;
        _imageService = imageService;
    }

    public async Task<DeleteEventResponse?> HandleAsync(int id)
    {
        // İlişkili galeri resimlerini de çekiyoruz
        var @event = await _context.Events
            .Include(e => e.GalleryImages)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (@event == null)
            return null;

        // 1. FİZİKSEL SİLME: Afişi ve tüm galeri resimlerini sunucudan (wwwroot) uçur
        _imageService.DeleteImage(@event.ImageUrl);

        foreach (var galleryImage in @event.GalleryImages)
        {
            _imageService.DeleteImage(galleryImage.ImageUrl);
        }

        // 2. VERİTABANI SİLME: 
        // Event silinince cascade kuralıyla bunlar da silinir ama açıkça belirtmek best-practice'dir.
        if (@event.GalleryImages.Any())
        {
            _context.RemoveRange(@event.GalleryImages);
        }

        _context.Events.Remove(@event);
        await _context.SaveChangesAsync();

        return new DeleteEventResponse(@event.Id);
    }
}

// 3. ENDPOINT
public static class DeleteEventEndpoint
{
    public static void MapDeleteEvent(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/events/{id}", async (int id, DeleteEventHandler handler) =>
        {
            var response = await handler.HandleAsync(id);
            if (response == null)
                return Results.NotFound(new ApiResult(false, $"ID'si {id} olan etkinlik bulunamadı."));

            var finalResult = new ApiResult<DeleteEventResponse>(true, response, "Etkinlik başarıyla silindi!");
            return Results.Ok(finalResult);
        })
        .RequireAuthorization("AdminAndManager")
        .RequireRateLimiting("FlexPolicy");
    }
}