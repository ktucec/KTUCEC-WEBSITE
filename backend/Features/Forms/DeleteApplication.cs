using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Forms;

// 1. COMMAND

public record DeleteApplicationCommand(int ApplicationId);

// 2. HANDLER

public class DeleteApplicationHandler
{
    private readonly KtucecDbContext _context;

    public DeleteApplicationHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<bool> HandleAsync(DeleteApplicationCommand command)
    {
        var application = await _context.FormApplications
            .FirstOrDefaultAsync(a => a.Id == command.ApplicationId);

        if (application is null)
            return false;

        _context.FormApplications.Remove(application);
        await _context.SaveChangesAsync();

        return true;
    }
}

// 3. ENDPOINT

public static class DeleteApplicationEndpoint
{
    public static void MapDeleteApplication(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/forms/applications/{applicationId:int}", async (
            int applicationId,
            DeleteApplicationHandler handler) =>
        {
            var deleted = await handler.HandleAsync(new DeleteApplicationCommand(applicationId));

            if (!deleted)
                return Results.NotFound(new ApiResult(false, "Başvuru bulunamadı."));

            return Results.Ok(new ApiResult(true, "Başvuru başarıyla silindi."));
        })
        .RequireAuthorization("AdminAndManager")
        .RequireRateLimiting("StrictPolicy");
    }
}