using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Forms;

// 1. RESPONSE

public record FormListItemDto(
    int Id,
    string Title,
    string Description,
    bool IsActive,
    int QuestionCount,
    int ApplicationCount,
    DateTime CreatedAt
);

public record GetAllFormsResponse(List<FormListItemDto> Forms);

// 2. HANDLER

public class GetAllFormsHandler
{
    private readonly KtucecDbContext _context;

    public GetAllFormsHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<GetAllFormsResponse> HandleAsync()
    {
        var forms = await _context.Forms
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FormListItemDto(
                f.Id,
                f.Title,
                f.Description,
                f.IsActive,
                f.Questions.Count,
                f.Applications.Count,
                f.CreatedAt
            ))
            .ToListAsync();

        return new GetAllFormsResponse(forms);
    }
}

// 3. ENDPOINT

public static class GetAllFormsEndpoint
{
    public static void MapGetAllForms(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/forms", async (
            GetAllFormsHandler handler) =>
        {
            var response = await handler.HandleAsync();

            var finalResult = new ApiResult<GetAllFormsResponse>(true, response, "Formlar başarıyla getirildi.");
            return Results.Ok(finalResult);
        })
        .RequireAuthorization("AdminAndManager")
        .RequireRateLimiting("FlexPolicy");
    }
}