using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace ktucec.Features.Events;

// 1. REQUEST & RESPONSE
public record GetCurrentEventsResponse(
    int Id,
    string Title,
    string Slug, // Frontend'de detay sayfasına ( /etkinlikler/slug ) link vermek için eklendi
    string Description,
    DateOnly Date,
    string Location,
    string? ImageUrl,
    string? Summary,
    string? ApplicationUrl, // Yaklaşan etkinlikler için EN ÖNEMLİ alan (Hemen Başvur butonu için)
    int? ParticipantCount
);


// 2. HANDLER
public class GetCurrentEventsHandler
{
    private readonly KtucecDbContext _context;

    public GetCurrentEventsHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<List<GetCurrentEventsResponse>> HandleAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);

        var currentEvents = await _context.Events
            .AsNoTracking()
            .Where(e => e.Date >= today)
            .OrderBy(e => e.Date) // En yakın tarihli yaklaşan etkinlik en başta gelsin
            .Select(e => new GetCurrentEventsResponse(
                e.Id,
                e.Title,
                e.Slug,
                e.Description,
                e.Date,
                e.Location,
                e.ImageUrl,
                e.Summary,
                e.ApplicationUrl,
                e.ParticipantCount
            ))
            .ToListAsync();

        return currentEvents;
    }
}


// 3. ENDPOINT
public static class GetCurrentEventsEndpoint
{
    public static void MapGetCurrentEvents(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/currentevents", async (GetCurrentEventsHandler handler) =>
        {
            var response = await handler.HandleAsync();

            var finalResult = new ApiResult<List<GetCurrentEventsResponse>>(true, response, "Güncel etkinlikler başarıyla getirildi!");
            return Results.Ok(finalResult);
        })
        .RequireRateLimiting("FlexPolicy");
    }
}