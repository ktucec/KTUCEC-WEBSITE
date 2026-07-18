using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace ktucec.Features.ContactForms;

// 1. DTO RESPONSE
public record ContactFormDto(int Id, string NameSurname, string Email, string Subject, string Message, DateTime CreatedAt);


// 2. HANDLER
public class InsertGetAllContactFormsHandler
{
    private readonly KtucecDbContext _context;

    public InsertGetAllContactFormsHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<List<ContactFormDto>> HandleAsync()
    {
        return await _context.ContactForms
            .AsNoTracking()
            .OrderByDescending(c => c.CreatedAt) 
            .Select(c => new ContactFormDto(c.Id, c.NameSurname, c.Email, c.Subject, c.Message, c.CreatedAt))
            .ToListAsync();
    }
}


// 3. ENDPOINT
public static class GetAllContactFormsEndpoint
{
    public static void MapGetAllContactForms(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/contact", async (InsertGetAllContactFormsHandler handler) =>
        {
            var forms = await handler.HandleAsync();
            var finalResult = new ApiResult<List<ContactFormDto>>(true, forms, "Tüm iletişim formları tersten listelendi.");
            return Results.Ok(finalResult);
        });
    }
}