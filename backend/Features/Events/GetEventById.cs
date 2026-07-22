using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Events;

// 1. REQUEST & RESPONSE
public record GetEventByIdResponse(
    int Id,
    string Title,
    string Description,
    DateOnly Date,
    string Location,
    string? ImageUrl
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
                e.Description,
                e.Date,
                e.Location,
                e.ImageUrl
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
        app.MapGet("/api/events/{id}", async (int id, GetEventByIdHandler handler) =>
        {
            var response = await handler.HandleAsync(id);
            if (response == null)
                return Results.NotFound(new ApiResult(false, $"ID'si {id} olan etkinlik bulunamadı."));

            var finalResult = new ApiResult<GetEventByIdResponse>(true, response, "Etkinlik başarıyla getirildi!");
            return Results.Ok(finalResult);
        })
        .RequireRateLimiting("FlexPolicy");
    }
}