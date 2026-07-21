using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Events;

// 1. REQUEST & RESPONSE
public record GetAllEventsResponse(
    int Id,
    string Title,
    string Description,
    DateOnly Date,
    string Location,
    string? ImageUrl
);


// 2. HANDLER
public class GetAllEventsHandler
{
    private readonly KtucecDbContext _context;

    public GetAllEventsHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<List<GetAllEventsResponse>> HandleAsync()
    {
        var allEvents = await _context.Events
            .AsNoTracking()
            .OrderByDescending(e => e.Date) 
            .Select(e => new GetAllEventsResponse(
                e.Id,
                e.Title,
                e.Description,
                e.Date,
                e.Location,
                e.ImageUrl
            ))
            .ToListAsync();

        return allEvents;
    }
}


// 3. ENDPOINT
public static class GetAllEventsEndpoint
{
    public static void MapGetAllEvents(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/events", async (GetAllEventsHandler handler) =>
        {
            var response = await handler.HandleAsync();

            var finalResult = new ApiResult<List<GetAllEventsResponse>>(true, response, "Tüm etkinlikler başarıyla getirildi!");
            return Results.Ok(finalResult);
        })
        .RequireRateLimiting("FlexPolicy");
    }
}