using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Codewave;
using ktucec.Shared.Common;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Codewave;


// 1. REQUEST & RESPONSE
public record VerifyTicketLookupRequest(string? Email, string? Code);
public record LookupTicketItem(string TicketCode, string FullName, string AttendeeType, string Reference);
public record VerifyTicketLookupResponse(string Email, List<LookupTicketItem> Tickets);


// 2. HANDLER
// Kod doğruysa adresin onaylı biletlerini (QR kodunu oluşturacak bilet kodlarıyla) döner. Kod tek kullanımlıktır
// ve 5 hatalı denemeden sonra geçersiz olur (öğrenci indirimi doğrulamasıyla aynı kurallar).
public class VerifyTicketLookupHandler
{
    private readonly KtucecDbContext _context;
    private readonly CodewaveSecurityService _security;

    public VerifyTicketLookupHandler(KtucecDbContext context, CodewaveSecurityService security)
    {
        _context = context;
        _security = security;
    }

    public async Task<IResult> HandleAsync(VerifyTicketLookupRequest request)
    {
        var email = CodewaveRules.NormalizeEmail(request.Email);
        var code = (request.Code ?? string.Empty).Trim();

        if (email.Length is < 6 or > CodewaveRules.EmailMaxLength || !CodewaveRules.IsValidOtp(code))
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "code_invalid", "Doğrulama kodu hatalı.");

        var entry = await _context.CodewaveTicketLookups.FirstOrDefaultAsync(l => l.Email == email);
        if (entry is null || string.IsNullOrEmpty(entry.OtpCodeHash) || entry.OtpCodeExpiresAt is null)
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "code_invalid", "Doğrulama kodu hatalı.");

        var now = DateTime.UtcNow;

        if (entry.OtpCodeExpiresAt < now)
        {
            entry.OtpCodeHash = null;
            entry.OtpCodeExpiresAt = null;
            await _context.SaveChangesAsync();
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "code_expired", "Kodun süresi doldu. Yeni kod isteyin.");
        }

        if (!_security.VerifyOtp(entry.OtpCodeHash, email, code))
        {
            entry.OtpFailedAttempts++;
            var left = CodewaveRules.OtpMaxFailedAttempts - entry.OtpFailedAttempts;

            if (left <= 0)
            {
                entry.OtpCodeHash = null;
                entry.OtpCodeExpiresAt = null;
                await _context.SaveChangesAsync();
                return CodewaveResults.Error(StatusCodes.Status429TooManyRequests, "too_many_attempts", "Çok fazla hatalı deneme. Yeni kod isteyin.");
            }

            await _context.SaveChangesAsync();
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "code_invalid", "Doğrulama kodu hatalı.", attemptsLeft: left);
        }

        entry.OtpCodeHash = null;
        entry.OtpCodeExpiresAt = null;
        entry.OtpFailedAttempts = 0;
        await _context.SaveChangesAsync();

        var rows = await _context.CodewaveApplications
            .Where(a => a.Email == email && a.Status == CodewaveApplicationStatus.Approved && a.TicketCode != null)
            .OrderBy(a => a.Id)
            .Select(a => new { a.Id, a.TicketCode, a.FirstName, a.LastName, a.AttendeeType })
            .ToListAsync();

        var tickets = rows
            .Select(a => new LookupTicketItem(a.TicketCode!, $"{a.FirstName} {a.LastName}".Trim(), a.AttendeeType.ToString(), $"CW26-{a.Id:D5}"))
            .ToList();

        return Results.Ok(new ApiResult<VerifyTicketLookupResponse>(true, new VerifyTicketLookupResponse(email, tickets), "Biletleriniz."));
    }
}


// 3. ENDPOINT
public static class VerifyTicketLookupEndpoint
{
    public static void MapVerifyTicketLookup(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/codewave/ticket-lookup/verify", (VerifyTicketLookupRequest request, VerifyTicketLookupHandler handler) =>
            handler.HandleAsync(request))
        .RequireRateLimiting("CodewaveVerifyPolicy");
    }
}
