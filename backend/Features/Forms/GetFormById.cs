using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Text.Json;

namespace ktucec.Features.Forms;

// 1. QUERY & RESPONSE

public record GetFormByIdQuery(int FormId);

public record FormQuestionDto(
    int Id,
    string Label,
    string Placeholder,
    QuestionType Type,
    bool IsRequired,
    int Order,
    List<string> Options,
    string MappedUserField
);

public record GetFormByIdResponse(
    int Id,
    string Title,
    string Description,
    bool IsActive,
    List<FormQuestionDto> Questions
);

// 2. HANDLER

public class GetFormByIdHandler
{
    private readonly KtucecDbContext _context;

    public GetFormByIdHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<GetFormByIdResponse?> HandleAsync(GetFormByIdQuery query)
    {
        var form = await _context.Forms
            .Include(f => f.Questions)
            .FirstOrDefaultAsync(f => f.Id == query.FormId);

        if (form is null)
            return null;

        var questions = form.Questions
            .OrderBy(q => q.Order)
            .Select(q => new FormQuestionDto(
                q.Id,
                q.Label,
                q.Placeholder,
                q.Type,
                q.IsRequired,
                q.Order,
                string.IsNullOrWhiteSpace(q.OptionsJson)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(q.OptionsJson) ?? new List<string>(),
                q.MappedUserField
            ))
            .ToList();

        return new GetFormByIdResponse(
            form.Id,
            form.Title,
            form.Description,
            form.IsActive,
            questions
        );
    }
}

// 3. ENDPOINT

public static class GetFormByIdEndpoint
{
    public static void MapGetFormById(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/forms/{formId:int}", async (
            int formId,
            GetFormByIdHandler handler) =>
        {
            var response = await handler.HandleAsync(new GetFormByIdQuery(formId));

            if (response is null)
                return Results.NotFound(new ApiResult(false, "Form bulunamadı."));

            var finalResult = new ApiResult<GetFormByIdResponse>(true, response, "Form başarıyla getirildi.");
            return Results.Ok(finalResult);
        })
        .AllowAnonymous()
        .RequireRateLimiting("FlexPolicy");
    }
}