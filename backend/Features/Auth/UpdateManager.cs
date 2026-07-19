using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Auth;


// 1. REQUEST & RESPONSE
public record UpdateManagerRequest(
    string? NameSurname,
    string? Email,
    ManagerRole? ManagerRole
);
public record UpdateManagerResponse(int Id);


// 2. HANDLER
public class UpdateManagerHandler
{
    private readonly KtucecDbContext _context;

    public UpdateManagerHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateManagerResponse?> HandleAsync(int id, UpdateManagerRequest request)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null || user.Role != UserRole.Manager)
            return null;

        if (request.NameSurname is not null)
            user.NameSurname = request.NameSurname;

        if (request.Email is not null)
        {
            var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != id);
            if (emailExists)
                throw new InvalidOperationException("Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.");

            user.Email = request.Email;
        }

        if (request.ManagerRole is not null)
            user.ManagerRole = request.ManagerRole.Value;

        await _context.SaveChangesAsync();
        return new UpdateManagerResponse(user.Id);
    }
}


// 3. ENDPOINT 
public static class UpdateManagerEndpoint
{
    public static void MapUpdateManager(this IEndpointRouteBuilder app)
    {
        app.MapPatch("/api/auth/managers/{id}", async (int id, UpdateManagerRequest request, UpdateManagerHandler handler) =>
        {
            if (request.NameSurname is not null && string.IsNullOrWhiteSpace(request.NameSurname))
                return Results.BadRequest(new ApiResult(false, "Yönetici adı ve soyadı boş olamaz."));

            if (request.Email is not null && string.IsNullOrWhiteSpace(request.Email))
                return Results.BadRequest(new ApiResult(false, "Yönetici e-postası boş olamaz."));

            try
            {
                var response = await handler.HandleAsync(id, request);

                if (response == null)
                    return Results.NotFound(new ApiResult(false, $"ID'si {id} olan yönetici bulunamadı."));

                var finalResult = new ApiResult<UpdateManagerResponse>(true, response, "Yönetici bilgileri başarıyla güncellendi!");
                return Results.Ok(finalResult);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new ApiResult(false, ex.Message));
            }
        })
        .RequireAuthorization("AdminOnly")
        .RequireRateLimiting("StrictPolicy");
    }
}