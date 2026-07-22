using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Media;
using ktucec.Shared.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

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
    private readonly ImageService _imageService;

    public UpdateManagerHandler(KtucecDbContext context, ImageService imageService)
    {
        _context = context;
        _imageService = imageService;
    }

    public async Task<UpdateManagerResponse?> HandleAsync(int id, UpdateManagerRequest request, IFormFile? image)
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

        if (image != null)
        {
            _imageService.DeleteImage(user.ProfileUrl);
            user.ProfileUrl = await _imageService.UploadImageAsync(image, "profile");
        }

        await _context.SaveChangesAsync();
        return new UpdateManagerResponse(user.Id);
    }
}


// 3. ENDPOINT 
public static class UpdateManagerEndpoint
{
    public static void MapUpdateManager(this IEndpointRouteBuilder app)
    {
        app.MapPatch("/api/auth/managers/{id}", async (
            int id,
            [FromForm] string? nameSurname,
            [FromForm] string? email,
            [FromForm] ManagerRole? managerRole,
            IFormFile? image, 
            UpdateManagerHandler handler) =>
        {
            if (nameSurname is not null && string.IsNullOrWhiteSpace(nameSurname))
                return Results.BadRequest(new ApiResult(false, "Yönetici adı ve soyadı boş olamaz."));

            if (email is not null && string.IsNullOrWhiteSpace(email))
                return Results.BadRequest(new ApiResult(false, "Yönetici e-postası boş olamaz."));

            var request = new UpdateManagerRequest(nameSurname, email, managerRole);

            try
            {
                var response = await handler.HandleAsync(id, request, image);

                if (response == null)
                    return Results.NotFound(new ApiResult(false, $"ID'si {id} olan yönetici bulunamadı."));

                var finalResult = new ApiResult<UpdateManagerResponse>(true, response, "Yönetici bilgileri başarıyla güncellendi!");
                return Results.Ok(finalResult);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new ApiResult(false, ex.Message));
            }
            catch (ArgumentException ex) 
            {
                return Results.BadRequest(new ApiResult(false, ex.Message));
            }
            catch (Exception ex) 
            {
                return Results.BadRequest(new ApiResult(false, "Resim işlenirken bir hata oluştu: " + ex.Message));
            }
        })
        .RequireAuthorization("AdminAndManager")
        .RequireRateLimiting("StrictPolicy")
        .DisableAntiforgery(); 
    }
}