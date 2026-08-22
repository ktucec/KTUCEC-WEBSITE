using ktucec.Domain.Entities;
using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ktucec.Features.Forms;

// 1. REQUEST & RESPONSE

public record UpdateFormQuestionDto(
    string Label,
    string? Placeholder,
    QuestionType Type,
    bool IsRequired,
    int Order,
    List<string>? Options,
    string? MappedUserField
);

public record UpdateFormRequest(
    string? Title,
    string? Description,
    bool? IsActive,
    List<UpdateFormQuestionDto>? Questions
);

public record UpdateFormResponse(int Id);

// 2. HANDLER

public class UpdateFormHandler
{
    private readonly KtucecDbContext _context;

    public UpdateFormHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateFormResponse?> HandleAsync(int id, UpdateFormRequest request)
    {
        var form = await _context.Forms
            .Include(f => f.Questions)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (form is null)
            return null;

        // update only not null items
        if (request.Title is not null)
            form.Title = request.Title;

        if (request.Description is not null)
            form.Description = request.Description;

        if (request.IsActive is not null)
            form.IsActive = request.IsActive.Value;

        // Questions were sent, so the whole question set is replaced
        if (request.Questions is not null)
        {
            _context.FormQuestions.RemoveRange(form.Questions);
            form.Questions.Clear();

            foreach (var q in request.Questions)
            {
                form.Questions.Add(new FormQuestion
                {
                    Label = q.Label,
                    Placeholder = q.Placeholder ?? string.Empty,
                    Type = q.Type,
                    IsRequired = q.IsRequired,
                    Order = q.Order,
                    OptionsJson = q.Options is { Count: > 0 }
                        ? JsonSerializer.Serialize(q.Options)
                        : string.Empty,
                    MappedUserField = q.MappedUserField ?? string.Empty,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        form.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return new UpdateFormResponse(form.Id);
    }
}

// 3. ENDPOINT

public static class UpdateFormEndpoint
{
    public static void MapUpdateForm(this IEndpointRouteBuilder app)
    {
        app.MapPatch("/api/forms/{id:int}", async (int id, UpdateFormRequest request, UpdateFormHandler handler) =>
        {
            if (request.Title is not null && string.IsNullOrWhiteSpace(request.Title))
                return Results.BadRequest(new ApiResult(false, "Form başlığı boş olamaz!"));

            if (request.Description is not null && string.IsNullOrWhiteSpace(request.Description))
                return Results.BadRequest(new ApiResult(false, "Form açıklaması boş olamaz!"));

            if (request.Questions is not null)
            {
                if (request.Questions.Count == 0)
                    return Results.BadRequest(new ApiResult(false, "Form en az bir soru içermelidir."));

                foreach (var q in request.Questions)
                {
                    if (string.IsNullOrWhiteSpace(q.Label))
                        return Results.BadRequest(new ApiResult(false, "Soru metni (label) boş olamaz."));

                    if (!Enum.IsDefined(typeof(QuestionType), q.Type))
                        return Results.BadRequest(new ApiResult(false, "Geçersiz soru tipi."));

                    var needsOptions = q.Type is QuestionType.SingleChoice or QuestionType.MultiChoice;
                    if (needsOptions && (q.Options is null || q.Options.Count == 0))
                        return Results.BadRequest(new ApiResult(false, $"'{q.Label}' sorusu için seçenek listesi boş olamaz."));
                }
            }

            var response = await handler.HandleAsync(id, request);

            if (response == null)
                return Results.NotFound(new ApiResult(false, $"ID'si {id} olan form bulunamadı."));

            var finalResult = new ApiResult<UpdateFormResponse>(true, response, "Form başarıyla güncellendi.");
            return Results.Ok(finalResult);
        })
        .RequireRateLimiting("FlexPolicy")
        .RequireAuthorization("AdminAndManager");
    }
}