using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using System;

namespace ktucec.Features.Events;


// 1. REQUEST & RESPONSE
public record UpdateEventRequest(
    string? Title,
    string? Description,
    DateOnly? Date,
    string? Location,
    string? ImageUrl
);
public record UpdateEventResponse(int Id);


// 2. HANDLER
public class UpdateEventHandler
{
    private readonly KtucecDbContext _context;
    public UpdateEventHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateEventResponse?> HandleAsync(int id, UpdateEventRequest request)
    {
        var @event = await _context.Events.FindAsync(id);
        if (@event == null)
            return null;

        // update only not null items

        if (request.Title is not null)
            @event.Title = request.Title;

        if (request.Description is not null)
            @event.Description = request.Description;

        if (request.Date is not null)
            @event.Date = request.Date.Value;

        if (request.Location is not null)
            @event.Location = request.Location;

        if (request.ImageUrl is not null)
            @event.ImageUrl = request.ImageUrl;

        await _context.SaveChangesAsync();
        return new UpdateEventResponse(@event.Id);
    }
}


// 3. ENDPOINT
public static class UpdateEventEndpoint
{
    public static void MapUpdateEvent(this IEndpointRouteBuilder app)
    {
        app.MapPatch("/api/events/{id}", async (int id, UpdateEventRequest request, UpdateEventHandler handler) =>
        {
            if (request.Title is not null && string.IsNullOrWhiteSpace(request.Title))
                return Results.BadRequest(new ApiResult(false, "Etkinlik başlığı boş olamaz."));

            if (request.Description is not null && string.IsNullOrWhiteSpace(request.Description))
                return Results.BadRequest(new ApiResult(false, "Etkinlik açıklaması boş olamaz."));

            if (request.Location is not null && string.IsNullOrWhiteSpace(request.Location))
                return Results.BadRequest(new ApiResult(false, "Etkinlik konumu boş olamaz."));

            var response = await handler.HandleAsync(id, request);

            if (response == null)
                return Results.NotFound(new ApiResult(false, $"ID'si {id} olan etkinlik bulunamadı."));

            var finalResult = new ApiResult<UpdateEventResponse>(true, response, "Etkinlik başarıyla güncellendi!");
            return Results.Ok(finalResult);
        });
    }
}