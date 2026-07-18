using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;

namespace ktucec.Features.Auth;


// 1. RESPONSE 
public record DeleteManagerResponse(int Id);


// 2. HANDLER 
public class DeleteManagerHandler
{
    private readonly KtucecDbContext _context;

    public DeleteManagerHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<DeleteManagerResponse?> HandleAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null || user.Role != UserRole.Manager)
            return null;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return new DeleteManagerResponse(user.Id);
    }
}

// 3. ENDPOINT 
public static class DeleteManagerEndpoint
{
    public static void MapDeleteManager(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/auth/managers/{id}", async (int id, DeleteManagerHandler handler) =>
        {
            var response = await handler.HandleAsync(id);

            if (response == null)
                return Results.NotFound(new ApiResult(false, $"ID'si {id} olan ve yönetici rolüne sahip bir kullanıcı bulunamadı."));

            var finalResult = new ApiResult<DeleteManagerResponse>(true, response, "Yönetici hesabı kulüp sisteminden başarıyla silindi!");
            return Results.Ok(finalResult);
        })
        .RequireAuthorization("AdminOnly");
    }
}