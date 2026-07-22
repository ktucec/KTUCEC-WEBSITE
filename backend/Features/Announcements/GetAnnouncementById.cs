using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ktucec.Features.Announcements;

// 1. QUERY RESPONSE
public record GetAnnouncementByIdDto(int Id, string Title, string Content, DateTime CreatedAt);

// 2. HANDLER
public class GetAnnouncementByIdHandler
{
    private readonly KtucecDbContext _context;

    public GetAnnouncementByIdHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<GetAnnouncementByIdDto?> HandleAsync(int id)
    {
        return await _context.Announcements
            .AsNoTracking()
            .Where(a => a.Id == id)
            .Select(a => new GetAnnouncementByIdDto(a.Id, a.Title, a.Content, a.CreatedAt))
            .FirstOrDefaultAsync();
    }
}

// 3. ENDPOINT
public static class GetAnnouncementByIdEndpoint
{
    public static void MapGetAnnouncementById(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/announcements/{id}", async (int id, GetAnnouncementByIdHandler handler) =>
        {
            var announcement = await handler.HandleAsync(id);

            if (announcement == null)
            {
                return Results.NotFound(new ApiResult(false, $"ID'si {id} olan duyuru bulunamadı."));
            }

            var finalResult = new ApiResult<GetAnnouncementByIdDto>(true, announcement, "Duyuru başarıyla getirildi.");
            return Results.Ok(finalResult);
        })
        .RequireRateLimiting("FlexPolicy");
    }
}