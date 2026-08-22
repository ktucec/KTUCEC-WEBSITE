using System.Security.Claims;
using ktucec.Domain.Entities;
using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Forms;

// 1. REQUEST (client'tan gelen) / COMMAND (server tarafında doğrulanmış) / RESPONSE

public record AddApplicationAnswerDto(int FormQuestionId, string Value);

// Client SADECE bunu gönderir. Dikkat: UserId burada YOK.
// Ayrıca MappedUserField'e sahip sorular için de client'tan değer gelse bile backend bunu ignore eder.
public record AddApplicationRequest(int FormId, List<AddApplicationAnswerDto> Answers);

// Bu command endpoint içinde server tarafında kuruluyor, UserId asla client'tan gelmiyor.
public record AddApplicationCommand(int FormId, int? UserId, List<AddApplicationAnswerDto> Answers);

public record AddApplicationResponse(int Id);

// 2. HANDLER

public class AddApplicationHandler
{
    private readonly KtucecDbContext _context;

    public AddApplicationHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<AddApplicationResponse> HandleAsync(AddApplicationCommand command)
    {
        var application = new FormApplication
        {
            FormId = command.FormId,
            UserId = command.UserId,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var answer in command.Answers)
        {
            application.Answers.Add(new FormQuestionAnswer
            {
                FormQuestionId = answer.FormQuestionId,
                Value = answer.Value,
                CreatedAt = DateTime.UtcNow
            });
        }

        _context.FormApplications.Add(application);
        await _context.SaveChangesAsync();

        return new AddApplicationResponse(application.Id);
    }
}

// 3. ENDPOINT

public static class AddApplicationEndpoint
{
    public static void MapAddApplication(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/forms/{formId:int}/applications", async (
            int formId,
            [FromBody] AddApplicationRequest request,
            HttpContext httpContext,
            KtucecDbContext context,
            AddApplicationHandler handler) =>
        {
            Console.WriteLine($"IsAuthenticated: {httpContext.User.Identity?.IsAuthenticated}");
            Console.WriteLine($"Claims count: {httpContext.User.Claims.Count()}");
            foreach (var c in httpContext.User.Claims)
                Console.WriteLine($"{c.Type} = {c.Value}");

            if (formId != request.FormId)
                return Results.BadRequest(new ApiResult(false, "Form Id uyuşmuyor."));

            // form + soruları çekiliyor
            var form = await context.Forms
                .Include(f => f.Questions)
                .FirstOrDefaultAsync(f => f.Id == formId);

            if (form is null)
                return Results.NotFound(new ApiResult(false, "Form bulunamadı."));

            if (!form.IsActive)
                return Results.BadRequest(new ApiResult(false, "Bu form artık başvuruya kapalı."));

            // gönderilen her cevabın FormQuestionId'si gerçekten bu forma mı ait, kontrol ediliyor
            var formQuestionIds = form.Questions.Select(q => q.Id).ToHashSet();
            foreach (var answer in request.Answers ?? [])
            {
                if (!formQuestionIds.Contains(answer.FormQuestionId))
                    return Results.BadRequest(new ApiResult(false, "Geçersiz soru Id'si tespit edildi."));
            }

            // UserId SADECE token'dan okunuyor, client'tan gelen hiçbir değer kabul edilmiyor
            int? resolvedUserId = null;
            User? loggedInUser = null;

            if (httpContext.User.Identity?.IsAuthenticated == true)
            {
                var claim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);
                if (claim != null && int.TryParse(claim.Value, out var parsedUserId))
                {
                    resolvedUserId = parsedUserId;
                    loggedInUser = await context.Users.FirstOrDefaultAsync(u => u.Id == parsedUserId);
                }
            }

            // Her soru tek tek işleniyor: MappedUserField'e sahip + giriş yapılmışsa User'dan oku,
            // aksi halde client'ın gönderdiği değeri kullan. Client'tan bu alan için gelen değer
            // (varsa) tamamen görmezden gelinir.
            var finalAnswers = new List<AddApplicationAnswerDto>();
            var missingRequired = new List<string>();

            foreach (var question in form.Questions)
            {
                var clientAnswer = request.Answers?.FirstOrDefault(a => a.FormQuestionId == question.Id);

                string resolvedValue;

                if (!string.IsNullOrEmpty(question.MappedUserField) && loggedInUser != null)
                {
                    resolvedValue = GetUserFieldValue(loggedInUser, question.MappedUserField);
                }
                else
                {
                    resolvedValue = clientAnswer?.Value ?? string.Empty;
                }

                if (question.IsRequired && string.IsNullOrWhiteSpace(resolvedValue))
                {
                    missingRequired.Add(question.Label);
                    continue;
                }

                if (!string.IsNullOrWhiteSpace(resolvedValue) || clientAnswer != null)
                {
                    finalAnswers.Add(new AddApplicationAnswerDto(question.Id, resolvedValue));
                }
            }

            if (missingRequired.Count > 0)
                return Results.BadRequest(new ApiResult(false, $"Zorunlu sorular cevaplanmamış: {string.Join(", ", missingRequired)}"));

            if (finalAnswers.Count == 0)
                return Results.BadRequest(new ApiResult(false, "En az bir cevap gönderilmelidir."));

            var command = new AddApplicationCommand(formId, resolvedUserId, finalAnswers);
            var response = await handler.HandleAsync(command);

            var finalResult = new ApiResult<AddApplicationResponse>(true, response, "Başvurunuz başarıyla alındı!");
            return Results.Created($"/api/forms/{formId}/applications/{response.Id}", finalResult);
        })
        .AllowAnonymous()
        .RequireRateLimiting("StrictPolicy");
    }

    // User field'ini dinamik olarak okuyup döndüren helper method
    private static string GetUserFieldValue(User user, string fieldName)
    {
        return fieldName switch
        {
            "NameSurname" => user.NameSurname,
            "Email" => user.Email,
            "ProfileUrl" => user.ProfileUrl,
            _ => string.Empty
        };
    }
}