using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Auth;

// 1. RESPONSE 
public record GetAllManagersResponse(int Id, string NameSurname, string Email, string ManagerRole, string? ProfileUrl);

// 2. HANDLER 
public class GetAllManagersHandler
{
    private readonly KtucecDbContext _context;

    public GetAllManagersHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<List<GetAllManagersResponse>> HandleAsync()
    {
        return await _context.Users
            .Where(u => u.Role == UserRole.Manager)
            .Select(u => new GetAllManagersResponse(
                u.Id,
                u.NameSurname,
                u.Email,
                u.ManagerRole.ToString(),
                u.ProfileUrl
            ))
            .ToListAsync();
    }
}

// 3. ENDPOINT 
public static class GetAllManagersEndpoint
{
    public static void MapGetAllManagers(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/auth/managers", async (GetAllManagersHandler handler) =>
        {
            var managers = await handler.HandleAsync();

            var finalResult = new ApiResult<List<GetAllManagersResponse>>(true, managers, "Tüm kulüp yöneticileri başarıyla listelendi.");
            return Results.Ok(finalResult);
        })
        .RequireRateLimiting("FlexPolicy");
    }
}