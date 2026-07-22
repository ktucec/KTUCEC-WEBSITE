using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Authentication;
using ktucec.Infrastructure.Services.Media;
using ktucec.Shared.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ktucec.Features.Auth;

// 1. REQUEST & RESPONSE
public record UpdateManagerRequest(
    string OtpCode,
    string? NameSurname,
    string? Email,
    string? Password
);

public record UpdateManagerResponse(int Id);

// 2. HANDLER (değişiklik yok)
public class UpdateManagerHandler
{
    private readonly KtucecDbContext _context;
    private readonly ImageService _imageService;
    private readonly PasswordHasher _passwordHasher;

    public UpdateManagerHandler(
        KtucecDbContext context,
        ImageService imageService,
        PasswordHasher passwordHasher)
    {
        _context = context;
        _imageService = imageService;
        _passwordHasher = passwordHasher;
    }

    public async Task<ApiResult<UpdateManagerResponse>> HandleAsync(
        HttpContext httpContext,
        UpdateManagerRequest request,
        IFormFile? image)
    {
        var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            return new ApiResult<UpdateManagerResponse>(false, null!, "Oturum bilgisi bulunamadı.");
        }

        var userId = int.Parse(userIdClaim);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return new ApiResult<UpdateManagerResponse>(false, null!, "Kullanıcı bulunamadı.");
        }

        if (string.IsNullOrWhiteSpace(request.OtpCode) ||
            user.OtpCode == null ||
            user.OtpCode != request.OtpCode ||
            user.OtpCodeExpiresAt < DateTime.UtcNow)
        {
            return new ApiResult<UpdateManagerResponse>(false, null!, "Doğrulama kodu geçersiz veya süresi dolmuş.");
        }

        if (request.NameSurname is not null)
        {
            if (string.IsNullOrWhiteSpace(request.NameSurname))
            {
                return new ApiResult<UpdateManagerResponse>(false, null!, "Ad soyad boş bırakılamaz.");
            }

            user.NameSurname = request.NameSurname;
        }

        if (request.Email is not null)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return new ApiResult<UpdateManagerResponse>(false, null!, "Email boş bırakılamaz.");
            }

            var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != user.Id);

            if (emailExists)
            {
                return new ApiResult<UpdateManagerResponse>(false, null!, "Bu email başka bir kullanıcı tarafından kullanılıyor.");
            }

            user.Email = request.Email;
        }

        if (request.Password is not null)
        {
            if (request.Password.Length < 8 || request.Password.Length > 32)
            {
                return new ApiResult<UpdateManagerResponse>(false, null!, "Şifre 8 ile 32 karakter arasında olmalıdır.");
            }

            user.PasswordHash = _passwordHasher.HashPassword(request.Password);
        }

        if (image != null)
        {
            _imageService.DeleteImage(user.ProfileUrl);
            user.ProfileUrl = await _imageService.UploadImageAsync(image, "profile");
        }

        user.OtpCode = null;
        user.OtpCodeExpiresAt = null;

        await _context.SaveChangesAsync();

        return new ApiResult<UpdateManagerResponse>(true, new UpdateManagerResponse(user.Id), "Yönetici bilgileri başarıyla güncellendi.");
    }
}

// 3. ENDPOINT — form alanları artık tek tek, complex record binding yerine
public static class UpdateManagerEndpoint
{
    public static void MapUpdateManager(this IEndpointRouteBuilder app)
    {
        app.MapPatch("/api/auth/managers/update", async (
            [FromForm] string otpCode,
            [FromForm] string? nameSurname,
            [FromForm] string? email,
            [FromForm] string? password,
            IFormFile? image,
            UpdateManagerHandler handler,
            HttpContext httpContext) =>
        {
            if (string.IsNullOrWhiteSpace(otpCode))
            {
                return Results.BadRequest(new ApiResult(false, "Doğrulama kodu zorunludur."));
            }

            var request = new UpdateManagerRequest(otpCode, nameSurname, email, password);

            var result = await handler.HandleAsync(httpContext, request, image);

            if (!result.IsSuccess)
            {
                return Results.BadRequest(result);
            }

            return Results.Ok(result);
        })
        .RequireAuthorization("AdminAndManager")
        .RequireRateLimiting("StrictPolicy")
        .DisableAntiforgery();
    }
}