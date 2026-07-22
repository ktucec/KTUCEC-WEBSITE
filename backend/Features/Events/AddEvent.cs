using ktucec.Domain.Entities;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Media;
using ktucec.Shared.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
        app.MapPost("/api/events", async (
            [FromForm] string title,
            [FromForm] string description,
            [FromForm] DateOnly date,
            [FromForm] string location,
            IFormFile? image,
            AddEventHandler handler,
            ImageService imageService) =>
        {
            // validations
            if (string.IsNullOrWhiteSpace(title))
                return Results.BadRequest(new ApiResult(false, "Etkinlik başlığı boş olamaz."));
            if (string.IsNullOrWhiteSpace(description))
                return Results.BadRequest(new ApiResult(false, "Etkinlik açıklaması boş olamaz."));
            if (string.IsNullOrWhiteSpace(location))
                return Results.BadRequest(new ApiResult(false, "Etkinlik konumu boş olamaz."));
            if (date == default)
                return Results.BadRequest(new ApiResult(false, "Geçerli bir etkinlik tarihi girilmelidir."));

            // image upload (optional: event may be created without an image)
            string? imageUrl = null;
            if (image != null)
            {
                try
                {
                    imageUrl = await imageService.UploadImageAsync(image, "event");
                }
                catch (ArgumentException ex)
                {
                    return Results.BadRequest(new ApiResult(false, ex.Message));
                }
            }

            // business logic
            var command = new AddEventCommand(title, description, date, location, imageUrl);
            var response = await handler.HandleAsync(command);

            // pack result and send with standard http 201 schema.
            var finalResult = new ApiResult<AddEventResponse>(true, response, "Etkinlik başarıyla oluşturuldu!");
            return Results.Created($"/api/events/{response.Id}", finalResult);
        })
        .RequireAuthorization("AdminAndManager")
        .RequireRateLimiting("StrictPolicy")
        .DisableAntiforgery(); // form-data binding requires this in minimal APIs
    }
}