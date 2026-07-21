using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Events;

// 1. REQUEST & RESPONSE
public record GetCurrentEventsResponse(
    int Id,
    string Title,
    string Description,
    DateOnly Date,
    string Location,
    string? ImageUrl
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
            .OrderBy(e => e.Date)
            .Select(e => new GetCurrentEventsResponse(
                e.Id,
                e.Title,
                e.Description,
                e.Date,
                e.Location,
                e.ImageUrl
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