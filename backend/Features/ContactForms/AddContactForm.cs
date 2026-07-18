using ktucec.Domain.Entities;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services;
using ktucec.Shared.Models;
using System;

namespace ktucec.Features.ContactForms;


// 1. COMMAND
public record AddContactFormCommand(string NameSurname, string Email, string Subject, string Message);
public record AddContactFormResponse(int Id);


// 2. HANDLER
public class AddContactFormHandler
{
    private readonly KtucecDbContext _context;
    private readonly TelegramService _telegramService;

    public AddContactFormHandler(KtucecDbContext context, TelegramService telegramService)
    {
        _context = context;
        _telegramService = telegramService;
    }

    public async Task<AddContactFormResponse> HandleAsync(AddContactFormCommand command)
    {
        var form = new ContactForm
        {
            NameSurname = command.NameSurname,
            Email = command.Email,
            Subject = command.Subject,
            Message = command.Message,
            CreatedAt = DateTime.UtcNow
        };

        _context.ContactForms.Add(form);
        await _context.SaveChangesAsync();

        string telegramMessage = $"📬 Yeni İletişim Formu!\n👤 Kapsam: {form.NameSurname}\n📌 Konu: {form.Subject}";
        await _telegramService.SendMessageAsync(telegramMessage);

        return new AddContactFormResponse(form.Id);
    }
}

// 3. ENDPOINT
public static class AddContactFormEndpoint
{
    public static void MapAddContactForm(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/contact", async (AddContactFormCommand command, AddContactFormHandler handler) =>
        {
            // A. MANUEL INPUT VALIDATION
            if (string.IsNullOrWhiteSpace(command.NameSurname) || string.IsNullOrWhiteSpace(command.Email) ||
                string.IsNullOrWhiteSpace(command.Subject) || string.IsNullOrWhiteSpace(command.Message))
            {
                return Results.BadRequest(new ApiResult(false, "Tüm alanları doldurmak zorunludur."));
            }

            // B. BUSINESS LOGIC
            var response = await handler.HandleAsync(command);
            var finalResult = new ApiResult<AddContactFormResponse>(true, response, "Mesajınız başarıyla iletildi!");

            return Results.Created($"/api/contact/{response.Id}", finalResult);
        })
        .RequireRateLimiting("ContactPolicy"); // Rate limit attaching
    }
}