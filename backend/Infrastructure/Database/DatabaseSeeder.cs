using ktucec.Domain.Entities;
using ktucec.Domain.Enums;
using ktucec.Infrastructure.Services;
using ktucec.Infrastructure.Services.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ktucec.Infrastructure.Database;

public static class DatabaseSeeder
{
    public static async Task SeedAdminAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<KtucecDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        await context.Database.MigrateAsync();

        if (!await context.Users.AnyAsync(u => u.Role == UserRole.Admin))
        {
            var adminName = configuration["SeedData:AdminName"] ?? "Root Admin";
            var adminEmail = configuration["SeedData:AdminEmail"] ?? "admin@ktucec.org";
            var adminPassword = configuration["SeedData:AdminPassword"] ?? "KtucecAdmin2026!";

            var rootAdmin = new User
            {
                NameSurname = "Barış Demir",
                Email = "bimaildahaolsun@gmail.com",
                PasswordHash = passwordHasher.HashPassword("12345678"),
                Role = UserRole.Member,
                IsEmailConfirmed = false 
            };

            context.Users.Add(rootAdmin);
            await context.SaveChangesAsync();
        }
    }
}