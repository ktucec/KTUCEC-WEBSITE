using ktucec.Application.Common.Helpers;
using ktucec.Domain.Entities;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Media;
using ktucec.Shared.Common;
using ktucec.Shared.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace ktucec.Features.Events;

// 1. COMMAND & RESPONSE
public record AddEventCommand(string Title, string Slug, string Description, DateOnly Date, string Location, string? ImageUrl, string? ApplicationUrl, int? ParticipantCount);
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
        var @event = new Event
        {
            Title = command.Title,
            Slug = command.Slug,
            Description = command.Description,
            Date = command.Date,
            Location = command.Location,
            ImageUrl = command.ImageUrl,
            ApplicationUrl = command.ApplicationUrl,
            ParticipantCount = command.ParticipantCount,
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
            [FromForm] string? applicationUrl,
            [FromForm] int? participantCount,
            IFormFile? image,
            AddEventHandler handler,
            ImageService imageService,
            KtucecDbContext dbContext) =>
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

            // Slug üretimi
            var slug = SlugHelper.GenerateSlug(title);

            // *** SLUG ÇAKIŞMA KONTROLÜ ***
            bool eventExists = await dbContext.Events.AnyAsync(e => e.Slug == slug);
            if (eventExists)
            {
                return Results.BadRequest(new ApiResult(false, "Bu isimde bir etkinlik zaten mevcut. Lütfen çakışmayı önlemek için farklı bir başlık girin."));
            }

            // image upload
            string? imageUrl = null;
            if (image != null)
            {
                try
                {
                    imageUrl = await imageService.UploadEventPosterAsync(image, slug);
                }
                catch (ArgumentException ex)
                {
                    return Results.BadRequest(new ApiResult(false, ex.Message));
                }
            }

            // business logic
            var command = new AddEventCommand(title, slug, description, date, location, imageUrl, applicationUrl, participantCount);
            var response = await handler.HandleAsync(command);

            // pack result and send
            var finalResult = new ApiResult<AddEventResponse>(true, response, "Etkinlik başarıyla oluşturuldu!");
            return Results.Created($"/api/events/{response.Id}", finalResult);
        })
        .RequireAuthorization("AdminAndManager")
        .RequireRateLimiting("StrictPolicy")
        .DisableAntiforgery();
    }
}