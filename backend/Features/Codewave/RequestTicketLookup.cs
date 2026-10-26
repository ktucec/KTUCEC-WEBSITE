using ktucec.Domain.Entities;
using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Codewave;
using ktucec.Shared.Common;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Codewave;


// 1. REQUEST
public record RequestTicketLookupRequest(string? Email);


// 2. HANDLER
// "Biletimi bul": bilet alırken yazılan (kişisel) e-posta adresine doğrulama kodu yollar. Adreslerin kayıtlı olup
// olmadığı sızmasın diye adres geçerliyse yanıt her zaman aynıdır; kod yalnızca onaylı bileti olan adreslere gider.
public class RequestTicketLookupHandler
{
    private readonly KtucecDbContext _context;
    private readonly CodewaveOtpSender _otpSender;

    public RequestTicketLookupHandler(KtucecDbContext context, CodewaveOtpSender otpSender)
    {
        _context = context;
        _otpSender = otpSender;
    }

    public async Task<IResult> HandleAsync(RequestTicketLookupRequest request, HttpContext httpContext)
    {
        var email = CodewaveRules.NormalizeEmail(request.Email);
        if (email.Length is < 6 or > CodewaveRules.EmailMaxLength
            || !System.Net.Mail.MailAddress.TryCreate(email, out var parsed)
            || !string.Equals(parsed.Address, email, StringComparison.Ordinal))
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "email_invalid", "Geçerli bir e-posta adresi girin.");

        var data = new CodewaveOtpSentResponse(email, (int)CodewaveRules.OtpLifetime.TotalSeconds, (int)CodewaveRules.OtpResendCooldown.TotalSeconds);
        var ok = Results.Ok(new ApiResult<CodewaveOtpSentResponse>(true, data, "Adrese bağlı bir bilet varsa doğrulama kodu gönderildi."));

        var language = await _context.CodewaveApplications
            .Where(a => a.Email == email && a.Status == CodewaveApplicationStatus.Approved && a.TicketCode != null)
            .OrderByDescending(a => a.Id)
            .Select(a => a.Language)
            .FirstOrDefaultAsync();

        // Bileti olmayan adrese kod gitmez, kayıt da açılmaz (tablo şişmesin); yanıt yine aynıdır.
        if (language is null) return ok;

        var entry = await _context.CodewaveTicketLookups.FirstOrDefaultAsync(l => l.Email == email);
        if (entry is null)
        {
            entry = new CodewaveTicketLookup { Email = email };
            _context.CodewaveTicketLookups.Add(entry);
        }

        var now = DateTime.UtcNow;
        var limited = _otpSender.CheckLimits(entry, now);
        if (limited is not null) return CodewaveResults.FromSendResult(limited);

        entry.LastRequestIp = CodewaveResults.ClientIp(httpContext);
        var otp = _otpSender.Issue(entry, now);
        await _context.SaveChangesAsync();

        if (!await _otpSender.SendTicketLookupAsync(email, otp, english: language == "EN"))
        {
            entry.OtpCodeHash = null;
            entry.OtpCodeExpiresAt = null;
            entry.OtpLastSentAt = null;
            await _context.SaveChangesAsync();
            return CodewaveResults.FromSendResult(new OtpSendResult(OtpSendOutcome.MailFailed));
        }

        return ok;
    }
}


// 3. ENDPOINT
public static class RequestTicketLookupEndpoint
{
    public static void MapRequestTicketLookup(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/codewave/ticket-lookup/request", (RequestTicketLookupRequest request, RequestTicketLookupHandler handler, HttpContext httpContext) =>
            handler.HandleAsync(request, httpContext))
        .RequireRateLimiting("CodewaveOtpPolicy");
    }
}
