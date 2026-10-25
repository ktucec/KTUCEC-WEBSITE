using ktucec.Domain.Entities;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Codewave;
using ktucec.Shared.Common;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Codewave;


// 1. REQUEST
public record ClaimStudentDiscountRequest(string? Email, string? StudentNumber);


// 2. HANDLER
// "İndirim kazan" sekmesi: edu.tr adresi + öğrenci no alır, adrese tek kullanımlık doğrulama kodu yollar.
// Adres daha önce onaylanmışsa yeni indirim verilmez; arayüz "indirim sorgula" sekmesine geçer.
public class ClaimStudentDiscountHandler
{
    private readonly KtucecDbContext _context;
    private readonly CodewaveOtpSender _otpSender;

    public ClaimStudentDiscountHandler(KtucecDbContext context, CodewaveOtpSender otpSender)
    {
        _context = context;
        _otpSender = otpSender;
    }

    public async Task<IResult> HandleAsync(ClaimStudentDiscountRequest request, HttpContext httpContext)
    {
        var email = CodewaveRules.NormalizeEmail(request.Email);
        var studentNumber = (request.StudentNumber ?? string.Empty).Trim();

        if (!CodewaveRules.IsEduTrEmail(email))
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "email_invalid", "Geçerli bir edu.tr e-posta adresi girin.");

        if (!CodewaveRules.IsValidStudentNumber(studentNumber))
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "student_number_invalid", "Öğrenci numarası 2-15 haneli olmalı ve yalnızca rakamlardan oluşmalı.");

        var now = DateTime.UtcNow;
        var entry = await _context.CodewaveStudentDiscounts.FirstOrDefaultAsync(d => d.Email == email);

        // A. bu adresle indirim zaten alınmış
        if (entry is { IsVerified: true })
            return CodewaveResults.Error(StatusCodes.Status409Conflict, "already_claimed", "Bu e-posta adresiyle indirim zaten alınmış.");

        // B. ilk istek ya da onaylanmamış önceki istek
        if (entry is null)
        {
            entry = new CodewaveStudentDiscount { Email = email };
            _context.CodewaveStudentDiscounts.Add(entry);
        }
        else
        {
            var limited = _otpSender.CheckLimits(entry, now);
            if (limited is not null) return CodewaveResults.FromSendResult(limited);
        }

        entry.StudentNumber = studentNumber;
        entry.LastRequestIp = CodewaveResults.ClientIp(httpContext);
        var otp = _otpSender.Issue(entry, now);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Aynı adres için eşzamanlı iki istek: benzersiz indeks ikincisini durdurur.
            return CodewaveResults.Error(StatusCodes.Status409Conflict, "try_again", "İşlem sürüyor, birkaç saniye sonra tekrar deneyin.");
        }

        if (!await _otpSender.SendAsync(email, otp, isLookup: false))
        {
            // Gönderilemeyen kod geçersiz kılınır ve bekleme süresi uygulanmaz.
            entry.OtpCodeHash = null;
            entry.OtpCodeExpiresAt = null;
            entry.OtpLastSentAt = null;
            await _context.SaveChangesAsync();
            return CodewaveResults.FromSendResult(new OtpSendResult(OtpSendOutcome.MailFailed));
        }

        var data = new CodewaveOtpSentResponse(email, (int)CodewaveRules.OtpLifetime.TotalSeconds, (int)CodewaveRules.OtpResendCooldown.TotalSeconds);
        return Results.Ok(new ApiResult<CodewaveOtpSentResponse>(true, data, "Doğrulama kodu e-posta adresinize gönderildi."));
    }
}


// 3. ENDPOINT
public static class ClaimStudentDiscountEndpoint
{
    public static void MapClaimStudentDiscount(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/codewave/discount/claim", (ClaimStudentDiscountRequest request, ClaimStudentDiscountHandler handler, HttpContext httpContext) =>
            handler.HandleAsync(request, httpContext))
        .RequireRateLimiting("CodewaveOtpPolicy");
    }
}
