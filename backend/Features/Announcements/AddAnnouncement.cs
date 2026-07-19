using ktucec.Domain.Entities;
using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;

namespace ktucec.Features.Announcements;

// 1. COMMAND & RESPONSE
public record AddAnnouncementCommand(string Title, string Content);
public record AddAnnouncementResponse(int Id);


// 2. HANDLER
public class AddAnnouncementHandler
{
    private readonly KtucecDbContext _context;

    public AddAnnouncementHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<AddAnnouncementResponse> Handler(AddAnnouncementCommand command)
    {
        var announcement = new Announcement
        {
            Title = command.Title,
            Content = command.Content
        };

        _context.Announcements.Add(announcement);
        await _context.SaveChangesAsync();

        return new AddAnnouncementResponse(announcement.Id);
    }
}


// 3. ENDPOINT
public static class AddAnnouncementEndpoint
{
    public static void MapAddAnnouncement(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/announcements", async (AddAnnouncementCommand command, AddAnnouncementHandler handler) =>
        {
            if (string.IsNullOrWhiteSpace(command.Title)) 
                return Results.BadRequest(new ApiResult(false, "Duyuru başlığı boş olamaz!"));

            if (string.IsNullOrWhiteSpace(command.Content))
                return Results.BadRequest(new ApiResult(false, "Duyuru içeriği boş olamaz!"));

            var response = await handler.Handler(command);

            var finalResult = new ApiResult<AddAnnouncementResponse>(true, response, "Duyuru eklendi.");

            // standard http 201 return schema
            return Results.Created($"/api/announcements/{response.Id}", finalResult);
        })
        .RequireRateLimiting("FlexPolicy")
        .RequireAuthorization("AdminAndManager");
    }
}
