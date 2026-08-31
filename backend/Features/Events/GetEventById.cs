using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Events;

// 1. DTOs & RESPONSE
// Galeri resimlerini dönmek için ufak bir alt DTO oluşturuyoruz
public record EventGalleryImageDto(int Id, string ImageUrl, int OrderIndex);

public record GetEventByIdResponse(
    int Id,
    string Title,
    string Slug,
    string Description,
    DateOnly Date,
    string Location,
    string? ImageUrl,
    string? Summary,
    string? ApplicationUrl,
    int? ParticipantCount,
    List<EventGalleryImageDto> GalleryImages // Galeri dizisi eklendi
);

// 2. HANDLER
public class GetEventByIdHandler
{
    private readonly KtucecDbContext _context;
    public GetEventByIdHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<GetEventByIdResponse?> HandleAsync(int id)
    {
        var @event = await _context.Events
            .AsNoTracking()
            .Where(e => e.Id == id)
            .Select(e => new GetEventByIdResponse(
                e.Id,
                e.Title,
                e.Slug,
                e.Description,
                e.Date,
                e.Location,
                e.ImageUrl,
                e.Summary,
                e.ApplicationUrl,
                e.ParticipantCount,
                e.GalleryImages
                 .OrderBy(g => g.OrderIndex) // Resimleri sırasına göre diziyoruz
                 .Select(g => new EventGalleryImageDto(g.Id, g.ImageUrl, g.OrderIndex))
                 .ToList()
            ))
            .FirstOrDefaultAsync();

        return @event;
    }
}

// 3. ENDPOINT
public static class GetEventByIdEndpoint
{
    public static void MapGetEventById(this IEndpointRouteBuilder app)
    {
        // Route çakışmalarını önlemek için {id:int} şeklinde tip belirttik
        app.MapGet("/api/events/{id:int}", async (int id, GetEventByIdHandler handler) =>
        {
            var response = await handler.HandleAsync(id);
            if (response == null)
                return Results.NotFound(new ApiResult(false, $"ID'si {id} olan etkinlik bulunamadı."));

            var finalResult = new ApiResult<GetEventByIdResponse>(true, response, "Etkinlik detayları başarıyla getirildi!");
            return Results.Ok(finalResult);
        })
        .RequireRateLimiting("FlexPolicy");
    }
}