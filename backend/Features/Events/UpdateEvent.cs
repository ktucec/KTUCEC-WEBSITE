using ktucec.Domain.Entities;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Media;
using ktucec.Shared.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace ktucec.Features.Events;

// 1. REQUEST & RESPONSE
public record UpdateEventRequest(
    string? Title,
    string? Description,
    DateOnly? Date,
    string? Location,
    string? Summary,
    string? ApplicationUrl,
    int? ParticipantCount,
    int[]? DeletedGalleryImageIds // Frontend silinmesini istediği galeri resimlerinin ID'lerini buraya yollayacak
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

    public async Task<UpdateEventResponse?> HandleAsync(
        int id,
        UpdateEventRequest request,
        IFormFile? posterImage,
        IFormFileCollection? newGalleryImages)
    {
        // Galeri resimleriyle birlikte çekiyoruz
        var @event = await _context.Events
            .Include(e => e.GalleryImages)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (@event == null)
            return null;

        // 1. Sadece null gelmeyen (değişen) metin/tarih verilerini güncelle
        if (request.Title is not null) @event.Title = request.Title;
        if (request.Description is not null) @event.Description = request.Description;
        if (request.Date is not null) @event.Date = request.Date.Value;
        if (request.Location is not null) @event.Location = request.Location;
        if (request.Summary is not null) @event.Summary = request.Summary;
        if (request.ApplicationUrl is not null) @event.ApplicationUrl = request.ApplicationUrl;
        if (request.ParticipantCount is not null) @event.ParticipantCount = request.ParticipantCount.Value;

        // 2. Afiş (Poster) güncellendiyse
        if (posterImage != null)
        {
            _imageService.DeleteImage(@event.ImageUrl); // eskisini uçur
            @event.ImageUrl = await _imageService.UploadEventPosterAsync(posterImage, @event.Slug);
        }

        // 3. Silinmesi istenen galeri resimleri varsa
        if (request.DeletedGalleryImageIds != null && request.DeletedGalleryImageIds.Any())
        {
            var imagesToRemove = @event.GalleryImages
                .Where(g => request.DeletedGalleryImageIds.Contains(g.Id))
                .ToList();

            foreach (var img in imagesToRemove)
            {
                _imageService.DeleteImage(img.ImageUrl); // Fiziksel olarak sil
                _context.Remove(img); // DB'den sil
            }
        }

        // 4. Yeni eklenen galeri resimleri varsa
        if (newGalleryImages != null && newGalleryImages.Any())
        {
            // Mevcut fotoğraflar varsa en yüksek OrderIndex'i bul, yoksa 0'dan başla
            int currentMaxOrder = @event.GalleryImages.Any()
                ? @event.GalleryImages.Max(g => g.OrderIndex)
                : 0;

            foreach (var file in newGalleryImages)
            {
                currentMaxOrder++;
                var imgUrl = await _imageService.UploadEventGalleryImageAsync(file, @event.Slug);

                @event.GalleryImages.Add(new EventGalleryImage
                {
                    ImageUrl = imgUrl,
                    OrderIndex = currentMaxOrder
                });
            }
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
            [FromForm] string? summary,
            [FromForm] string? applicationUrl,
            [FromForm] int? participantCount,
            [FromForm] int[]? deletedGalleryImageIds, // Array olarak bind edilir
            IFormFile? posterImage,
            IFormFileCollection? newGalleryImages, // Çoklu dosya yükleme
            UpdateEventHandler handler) =>
        {
            // Validasyonlar (sadece gönderilmişse boş mu diye kontrol et)
            if (title is not null && string.IsNullOrWhiteSpace(title))
                return Results.BadRequest(new ApiResult(false, "Etkinlik başlığı boş olamaz."));
            if (description is not null && string.IsNullOrWhiteSpace(description))
                return Results.BadRequest(new ApiResult(false, "Etkinlik açıklaması boş olamaz."));
            if (location is not null && string.IsNullOrWhiteSpace(location))
                return Results.BadRequest(new ApiResult(false, "Etkinlik konumu boş olamaz."));

            var request = new UpdateEventRequest(
                title, description, date, location, summary, applicationUrl, participantCount, deletedGalleryImageIds);

            try
            {
                var response = await handler.HandleAsync(id, request, posterImage, newGalleryImages);
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
        .DisableAntiforgery();
    }
}