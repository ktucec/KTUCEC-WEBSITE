using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Forms;

// 1. QUERY & RESPONSE

public record GetFormApplicationsQuery(int FormId);

public record ApplicationRowDto(
    int ApplicationId,
    int? UserId,
    string? UserNameSurname,
    string? UserEmail,
    DateTime SubmittedAt,
    List<string> Values
);

public record GetFormApplicationsResponse(
    int FormId,
    string FormTitle,
    List<string> Headers,
    List<ApplicationRowDto> Rows
);

// 2. HANDLER

public class GetFormApplicationsHandler
{
    private readonly KtucecDbContext _context;

    public GetFormApplicationsHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<GetFormApplicationsResponse?> HandleAsync(GetFormApplicationsQuery query)
    {
        var form = await _context.Forms
            .Include(f => f.Questions)
            .FirstOrDefaultAsync(f => f.Id == query.FormId);

        if (form is null)
            return null;

        var orderedQuestions = form.Questions
            .OrderBy(q => q.Order)
            .ToList();

        var headers = orderedQuestions
            .Select(q => q.Label)
            .ToList();

        var applications = await _context.FormApplications
            .Include(a => a.Answers)
            .Include(a => a.User)
            .Where(a => a.FormId == query.FormId)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();

        var rows = new List<ApplicationRowDto>();

        foreach (var application in applications)
        {
            var values = orderedQuestions
                .Select(q =>
                    application.Answers.FirstOrDefault(ans => ans.FormQuestionId == q.Id)?.Value
                    ?? string.Empty)
                .ToList();

            rows.Add(new ApplicationRowDto(
                application.Id,
                application.UserId,
                application.User?.NameSurname,
                application.User?.Email,
                application.CreatedAt,
                values
            ));
        }

        return new GetFormApplicationsResponse(form.Id, form.Title, headers, rows);
    }
}

// 3. ENDPOINT

public static class GetFormApplicationsEndpoint
{
    public static void MapGetFormApplications(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/forms/{formId:int}/applications", async (
            int formId,
            GetFormApplicationsHandler handler) =>
        {
            var response = await handler.HandleAsync(new GetFormApplicationsQuery(formId));

            if (response is null)
                return Results.NotFound(new ApiResult(false, "Form bulunamadı."));

            var finalResult = new ApiResult<GetFormApplicationsResponse>(true, response, "Yanıtlar başarıyla getirildi.");
            return Results.Ok(finalResult);
        })
        .RequireAuthorization("AdminAndManager")
        .RequireRateLimiting("FlexPolicy");
    }
}