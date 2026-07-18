using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.ContactForms;


// 1. RESPONSE 
public record DeleteContactFormResponse(int Id);


// 2. HANDLER
public class DeleteContactFormHandler
{
    private readonly KtucecDbContext _context;

    public DeleteContactFormHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<DeleteContactFormResponse?> HandleAsync(int id)
    {
        var form = await _context.ContactForms.FindAsync(id);

        if (form == null)
            return null;

        _context.ContactForms.Remove(form);
        await _context.SaveChangesAsync();

        return new DeleteContactFormResponse(form.Id);
    }
}


// 3. ENDPOINT
public static class DeleteContactFormEndpoint
{
    public static void MapDeleteContactForm(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/contact/{id}", async (int id, DeleteContactFormHandler handler) =>
        {
            var response = await handler.HandleAsync(id);

            if (response == null)
                return Results.NotFound(new ApiResult(false, $"ID'si {id} olan iletişim formu bulunamadı."));

            var finalResult = new ApiResult<DeleteContactFormResponse>(true, response, "İletişim formu başarıyla silindi!");
            return Results.Ok(finalResult);
        });
    }
}