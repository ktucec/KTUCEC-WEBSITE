using ktucec.Domain.Entities;
using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using System;

namespace ktucec.Features.Events;

// 1. COMMAND & RESPONSE
public record AddEventCommand(string Title, string Description, DateOnly Date, string Location, string? ImageUrl);
public record AddEventResponse(int Id);


// 2. HANDLER
public class AddEventHandler
{
    private readonly KtucecDbContext _context;

    public AddEventHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<AddEventResponse> HandleAsync(AddEventCommand command)
    {
        var @event = new Event  // event is a default keyword. to use this word as a variable name, we gotta use @ sign.
        {
            Title = command.Title,
            Description = command.Description,
            Date = command.Date,
            Location = command.Location,
            ImageUrl = command.ImageUrl, 
            CreatedAt = DateTime.UtcNow
        };

        _context.Events.Add(@event);
        await _context.SaveChangesAsync();

        return new AddEventResponse(@event.Id);
    }
}


// 3. ENDPOINT
public static class AddEventEndpoint
{
    public static void MapAddEvent(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/events", async (AddEventCommand command, AddEventHandler handler) =>
        {
            // validations
            if (string.IsNullOrWhiteSpace(command.Title))
                return Results.BadRequest(new ApiResult(false, "Etkinlik başlığı boş olamaz."));

            if (string.IsNullOrWhiteSpace(command.Description))
                return Results.BadRequest(new ApiResult(false, "Etkinlik açıklaması boş olamaz."));

            if (string.IsNullOrWhiteSpace(command.Location))
                return Results.BadRequest(new ApiResult(false, "Etkinlik konumu boş olamaz."));

            if (command.Date == default)
                return Results.BadRequest(new ApiResult(false, "Geçerli bir etkinlik tarihi girilmelidir."));

            // business logic
            var response = await handler.HandleAsync(command);

            // pack result and send with standard http 201 schema.
            var finalResult = new ApiResult<AddEventResponse>(true, response, "Etkinlik başarıyla oluşturuldu!");
            return Results.Created($"/api/events/{response.Id}", finalResult);
        })
        .RequireRateLimiting("StrictPolicy");
    }
}