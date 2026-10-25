using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Codewave;
using ktucec.Shared.Common;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Codewave;


// 1. REQUEST
public record LookupStudentDiscountRequest(string? Email);


// 2. HANDLER
// "İndirim sorgula" sekmesi: daha önce onaylanmış adrese yeni bir doğrulama kodu yollar.
// Kod doğrulanınca indirim kodu ve durumu gösterilir (VerifyStudentDiscount).
public class LookupStudentDiscountHandler
{
    private readonly KtucecDbContext _context;
    private readonly CodewaveOtpSender _otpSender;

    public LookupStudentDiscountHandler(KtucecDbContext context, CodewaveOtpSender otpSender)
    {
        _context = context;
        _otpSender = otpSender;
    }

    public async Task<IResult> HandleAsync(LookupStudentDiscountRequest request, HttpContext httpContext)
    {
        var email = CodewaveRules.NormalizeEmail(request.Email);
        if (!CodewaveRules.IsEduTrEmail(email))
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "email_invalid", "Geçerli bir edu.tr e-posta adresi girin.");

        var entry = await _context.CodewaveStudentDiscounts.FirstOrDefaultAsync(d => d.Email == email);
        if (entry is not { IsVerified: true })
            return CodewaveResults.Error(StatusCodes.Status404NotFound, "not_found", "Bu adresle alınmış bir indirim bulunamadı.");

        var now = DateTime.UtcNow;
        var limited = _otpSender.CheckLimits(entry, now);
        if (limited is not null) return CodewaveResults.FromSendResult(limited);

        entry.LastRequestIp = CodewaveResults.ClientIp(httpContext);
        var otp = _otpSender.Issue(entry, now);
        await _context.SaveChangesAsync();

        if (!await _otpSender.SendAsync(email, otp, isLookup: true))
        {
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
public static class LookupStudentDiscountEndpoint
{
    public static void MapLookupStudentDiscount(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/codewave/discount/lookup", (LookupStudentDiscountRequest request, LookupStudentDiscountHandler handler, HttpContext httpContext) =>
            handler.HandleAsync(request, httpContext))
        .RequireRateLimiting("CodewaveOtpPolicy");
    }
}
