using ktucec.Domain.Entities;
using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services;
using ktucec.Infrastructure.Services.Authentication;
using ktucec.Shared.Common;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Auth;


// 1. REQUEST & RESPONSE
public record CreateManagerRequest(string NameSurname, string Email, ManagerRole ManagerRole);
public record CreateManagerResponse(int Id, string Email, string Role);


// 2. HANDLER
public class CreateManagerHandler
{
    private readonly KtucecDbContext _context;
    private readonly PasswordHasher _passwordHasher;
    private readonly EmailService _emailService;

    public CreateManagerHandler(KtucecDbContext context, PasswordHasher passwordHasher, EmailService emailService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
    }

    public async Task<ApiResult<CreateManagerResponse>> HandleAsync(CreateManagerRequest request)
    {
        // A. e-mail check
        var exists = await _context.Users.AnyAsync(u => u.Email == request.Email);
        if (exists)
        {
            return new ApiResult<CreateManagerResponse>(false, null!, "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.");
        }

        // B. Generate secure random password
        var generatedPassword = PasswordGenerator.Generate(16);

        // C. Create new manager
        var manager = new User
        {
            NameSurname = request.NameSurname,
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(generatedPassword),
            Role = UserRole.Manager,
            ManagerRole = request.ManagerRole,
            IsEmailConfirmed = true
        };

        _context.Users.Add(manager);
        await _context.SaveChangesAsync();

        // D. Welcome e-mail and sending temporary password
        string mailBody = $@"
            <h3>KTUCEC Yönetimine Hoş Geldiniz!</h3>
            <p>Sayın {manager.NameSurname}, hesabınız kulüp yönetimi tarafından başarıyla oluşturuldu.</p>
            <p><b>Giriş E-postanız:</b> {manager.Email}</p>
            <p><b>Geçici Şifreniz:</b> {generatedPassword}</p>
            <p>Güvenliğiniz gereği, panele giriş yaparak şifrenizi güncelleyiniz.</p>
            <p>Sisteme her giriş yaptığınızda e-postanıza tek kullanımlık bir doğrulama kodu (OTP) gönderilecektir.</p>";

        await _emailService.SendEmailAsync(manager.Email, "KTUCEC Yönetici Hesabınız Oluşturuldu", mailBody);

        var responseData = new CreateManagerResponse(manager.Id, manager.Email, manager.ManagerRole.ToString());
        return new ApiResult<CreateManagerResponse>(true, responseData, "Yönetici başarıyla oluşturuldu ve şifresi mailine iletildi!");
    }
}


// 3. ENDPOINT 
public static class CreateManagerEndpoint
{
    public static void MapCreateManager(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/managers", async (CreateManagerRequest request, CreateManagerHandler handler) =>
        {
            if (string.IsNullOrWhiteSpace(request.NameSurname) || string.IsNullOrWhiteSpace(request.Email))
                return Results.BadRequest(new ApiResult(false, "Lütfen tüm alanları doldurun."));

            var result = await handler.HandleAsync(request);

            if (!result.IsSuccess)
                return Results.BadRequest(result);

            return Results.Ok(result);
        })
        .RequireAuthorization("AdminOnly");
    }
}