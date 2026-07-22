using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Media;
using ktucec.Shared.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;

namespace ktucec.Features.Events;

// 1. REQUEST & RESPONSE
// ImageUrl removed: the new image now arrives as an IFormFile via form-data, not as a URL string.
public record UpdateEventRequest(
    string? Title,
    string? Description,
    DateOnly? Date,
    string? Location
);
public record UpdateEventResponse(int Id);

// 2. HANDLER
public class UpdateEventHandler
{
    private readonly KtucecDbContext _context;
    private readonly ImageService _imageService;

    public UpdateEventHandler(KtucecDbContext context, ImageService imageService)
    {
        _context = context;
        _imageService = imageService;
    }

    public async Task<UpdateEventResponse?> HandleAsync(int id, UpdateEventRequest request, IFormFile? image)
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

        // only touch the image if a new file was actually sent
        if (image != null)
        {
            // delete the old file first to avoid leaving orphaned images on disk
            _imageService.DeleteImage(@event.ImageUrl);
            @event.ImageUrl = await _imageService.UploadImageAsync(image, "event");
        }

        await _context.SaveChangesAsync();
        return new UpdateEventResponse(@event.Id);
    }
}

// 3. ENDPOINT
public static class UpdateEventEndpoint
{
    public static void MapUpdateEvent(this IEndpointRouteBuilder app)
    {
        app.MapPatch("/api/events/{id}", async (
            int id,
            [FromForm] string? title,
            [FromForm] string? description,
            [FromForm] DateOnly? date,
            [FromForm] string? location,
            IFormFile? image,
            UpdateEventHandler handler) =>
        {
            if (title is not null && string.IsNullOrWhiteSpace(title))
                return Results.BadRequest(new ApiResult(false, "Etkinlik başlığı boş olamaz."));
            if (description is not null && string.IsNullOrWhiteSpace(description))
                return Results.BadRequest(new ApiResult(false, "Etkinlik açıklaması boş olamaz."));
            if (location is not null && string.IsNullOrWhiteSpace(location))
                return Results.BadRequest(new ApiResult(false, "Etkinlik konumu boş olamaz."));

            var request = new UpdateEventRequest(title, description, date, location);

            try
            {
                var response = await handler.HandleAsync(id, request, image);
                if (response == null)
                    return Results.NotFound(new ApiResult(false, $"ID'si {id} olan etkinlik bulunamadı."));

                var finalResult = new ApiResult<UpdateEventResponse>(true, response, "Etkinlik başarıyla güncellendi!");
                return Results.Ok(finalResult);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new ApiResult(false, ex.Message));
            }
        })
        .RequireAuthorization("AdminAndManager")
        .RequireRateLimiting("FlexPolicy")
        .DisableAntiforgery(); // form-data binding requires this in minimal APIs
    }
}