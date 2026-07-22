using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Events;

// 1. RESPONSE
public record GetEventsCountResponse(int Count);

// 2. HANDLER
public class GetEventsCountHandler
{
    private readonly KtucecDbContext _context;
    public GetEventsCountHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<GetEventsCountResponse> HandleAsync()
    {
        var count = await _context.Events.CountAsync();
        return new GetEventsCountResponse(count);
    }
}

// 3. ENDPOINT
public static class GetEventsCountEndpoint
{
    public static void MapGetEventsCount(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/events/count", async (GetEventsCountHandler handler) =>
        {
            var response = await handler.HandleAsync();
            var finalResult = new ApiResult<GetEventsCountResponse>(true, response, "Etkinlik sayısı getirildi.");
            return Results.Ok(finalResult);
        })
        .RequireRateLimiting("FlexPolicy");
    }
}