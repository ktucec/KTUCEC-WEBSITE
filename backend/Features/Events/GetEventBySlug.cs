using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Events;

// 1. RESPONSE
// (GetEventByIdResponse ile aynı veriyi taşıdığı için Vertical Slice prensibi gereği buraya özel kendi kaydımızı açıyoruz)
public record GetEventBySlugResponse(
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
    List<EventGalleryImageDto> GalleryImages
);

// 2. HANDLER
public class GetEventBySlugHandler
{
    private readonly KtucecDbContext _context;
    public GetEventBySlugHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<GetEventBySlugResponse?> HandleAsync(string slug)
    {
        var @event = await _context.Events
            .AsNoTracking()
            .Where(e => e.Slug == slug) // Aramayı Id yerine Slug'a göre yapıyoruz
            .Select(e => new GetEventBySlugResponse(
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
                 .OrderBy(g => g.OrderIndex)
                 .Select(g => new EventGalleryImageDto(g.Id, g.ImageUrl, g.OrderIndex))
                 .ToList()
            ))
            .FirstOrDefaultAsync();

        return @event;
    }
}

// 3. ENDPOINT
public static class GetEventBySlugEndpoint
{
    public static void MapGetEventBySlug(this IEndpointRouteBuilder app)
    {
        // Çakışmayı önlemek için araya bir "/slug/" segmenti koyuyoruz 
        // Veya frontend'den çağırırken direkt /api/events/byslug/codewave-2026 atılır.
        app.MapGet("/api/events/slug/{slug}", async (string slug, GetEventBySlugHandler handler) =>
        {
            var response = await handler.HandleAsync(slug);
            if (response == null)
                return Results.NotFound(new ApiResult(false, $"'{slug}' uzantısına sahip etkinlik bulunamadı."));

            var finalResult = new ApiResult<GetEventBySlugResponse>(true, response, "Etkinlik detayları başarıyla getirildi!");
            return Results.Ok(finalResult);
        })
        .RequireRateLimiting("FlexPolicy");
    }
}