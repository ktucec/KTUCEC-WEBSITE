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
// "Biletimi bul": bilet alırken yazılan (kişisel) e-posta adresine doğrulama kodu yollar.
//  - Adreste onaylı bilet varsa 6 haneli kod gider (kodu olmayan eski/elle onaylanmış başvurulara burada kod verilir).
//  - Yoksa kod yerine "bilet bulunamadı" bilgi e-postası gider. Böylece kod gelmeyince nedeni anlaşılır ve arayüzdeki
//    yanıt her adres için aynı kalır (adres kayıtlı mı sorgulanamaz; farkı yalnızca adresin sahibi görür).
// Adres başına gönderim sınırı (60 sn bekleme, saatte 5) her iki durumda da geçerlidir.
public class RequestTicketLookupHandler
{
    private readonly KtucecDbContext _context;
    private readonly CodewaveOtpSender _otpSender;
    private readonly CodewaveTicketCodes _ticketCodes;
    private readonly ILogger<RequestTicketLookupHandler> _logger;

    public RequestTicketLookupHandler(KtucecDbContext context, CodewaveOtpSender otpSender, CodewaveTicketCodes ticketCodes,
        ILogger<RequestTicketLookupHandler> logger)
    {
        _context = context;
        _otpSender = otpSender;
        _ticketCodes = ticketCodes;
        _logger = logger;
    }

    public async Task<IResult> HandleAsync(RequestTicketLookupRequest request, HttpContext httpContext)
    {
        var email = CodewaveRules.NormalizeEmail(request.Email);
        if (email.Length is < 6 or > CodewaveRules.EmailMaxLength
            || !System.Net.Mail.MailAddress.TryCreate(email, out var parsed)
            || !string.Equals(parsed.Address, email, StringComparison.Ordinal))
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "email_invalid", "Geçerli bir e-posta adresi girin.");

        var data = new CodewaveOtpSentResponse(email, (int)CodewaveRules.OtpLifetime.TotalSeconds, (int)CodewaveRules.OtpResendCooldown.TotalSeconds);
        var ok = Results.Ok(new ApiResult<CodewaveOtpSentResponse>(true, data, "Doğrulama e-postası gönderildi."));

        var approved = await _context.CodewaveApplications
            .Where(a => a.Email == email && a.Status == CodewaveApplicationStatus.Approved)
            .ToListAsync();

        // Onaylı ama kodu olmayan başvurulara kod ver (senkronizasyon bunu sonradan da yapar)
        if (await _ticketCodes.AssignMissingAsync(approved) > 0) await _context.SaveChangesAsync();

        var entry = await _context.CodewaveTicketLookups.FirstOrDefaultAsync(l => l.Email == email);
        if (entry is null)
        {
            entry = new CodewaveTicketLookup { Email = email };
            _context.CodewaveTicketLookups.Add(entry);
        }

        var now = DateTime.UtcNow;
        var limited = _otpSender.CheckLimits(entry, now);
        if (limited is not null)
        {
            _logger.LogInformation("CODEWAVE biletimi bul: gönderim sınırı ({Outcome}).", limited.Outcome);
            return ok;
        }

        entry.LastRequestIp = CodewaveResults.ClientIp(httpContext);
        var otp = _otpSender.Issue(entry, now);

        var hasTicket = approved.Count > 0;
        if (!hasTicket)
        {
            // Bilgi e-postasında kod yok; sayaçlar işlenir ama kod saklanmaz.
            entry.OtpCodeHash = null;
            entry.OtpCodeExpiresAt = null;
        }
        await _context.SaveChangesAsync();

        var sent = hasTicket
            ? await _otpSender.SendTicketLookupAsync(email, otp, english: approved.OrderByDescending(a => a.Id).First().Language == "EN")
            : await _otpSender.SendNoTicketAsync(email);

        if (!sent)
        {
            entry.OtpCodeHash = null;
            entry.OtpCodeExpiresAt = null;
            entry.OtpLastSentAt = null;
            await _context.SaveChangesAsync();
            return CodewaveResults.FromSendResult(new OtpSendResult(OtpSendOutcome.MailFailed));
        }

        _logger.LogInformation("CODEWAVE biletimi bul: e-posta gönderildi (bilet var: {HasTicket}).", hasTicket);
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
