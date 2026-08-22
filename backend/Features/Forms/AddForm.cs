using ktucec.Domain.Entities;
using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ktucec.Features.Forms;

// 1. COMMAND & RESPONSE

public record AddFormQuestionDto(
    string Label,
    string? Placeholder,
    QuestionType Type,
    bool IsRequired,
    int Order,
    List<string>? Options,
    string? MappedUserField
);

public record AddFormCommand(
    string Title,
    string Description,
    List<AddFormQuestionDto> Questions
);

public record AddFormResponse(int Id);

// 2. HANDLER

public class AddFormHandler
{
    private readonly KtucecDbContext _context;

    public AddFormHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<AddFormResponse> HandleAsync(AddFormCommand command)
    {
        var form = new Form
        {
            Title = command.Title,
            Description = command.Description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var q in command.Questions)
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

        _context.Forms.Add(form);
        await _context.SaveChangesAsync();

        return new AddFormResponse(form.Id);
    }
}

// 3. ENDPOINT

public static class AddFormEndpoint
{
    public static void MapAddForm(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/forms", async (
            [FromBody] AddFormCommand command,
            AddFormHandler handler) =>
        {
            // validations
            if (string.IsNullOrWhiteSpace(command.Title))
                return Results.BadRequest(new ApiResult(false, "Form başlığı boş olamaz."));

            if (string.IsNullOrWhiteSpace(command.Description))
                return Results.BadRequest(new ApiResult(false, "Form açıklaması boş olamaz."));

            if (command.Questions is null || command.Questions.Count == 0)
                return Results.BadRequest(new ApiResult(false, "Form en az bir soru içermelidir."));

            foreach (var q in command.Questions)
            {
                if (string.IsNullOrWhiteSpace(q.Label))
                    return Results.BadRequest(new ApiResult(false, "Soru metni (label) boş olamaz."));

                if (!Enum.IsDefined(typeof(QuestionType), q.Type))
                    return Results.BadRequest(new ApiResult(false, "Geçersiz soru tipi."));

                var needsOptions = q.Type is QuestionType.SingleChoice or QuestionType.MultiChoice;
                if (needsOptions && (q.Options is null || q.Options.Count == 0))
                    return Results.BadRequest(new ApiResult(false, $"'{q.Label}' sorusu için seçenek listesi boş olamaz."));
            }

            // business logic
            var response = await handler.HandleAsync(command);

            var finalResult = new ApiResult<AddFormResponse>(true, response, "Form başarıyla oluşturuldu!");
            return Results.Created($"/api/forms/{response.Id}", finalResult);
        })
        .RequireAuthorization("AdminAndManager")
        .RequireRateLimiting("StrictPolicy");
    }
}