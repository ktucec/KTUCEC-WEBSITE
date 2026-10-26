using ktucec.Domain.Entities;
using ktucec.Shared.Common;

namespace ktucec.Infrastructure.Services.Codewave;

public enum OtpSendOutcome
{
    Sent,
    Cooldown,
    LimitReached,
    MailFailed
}

public record OtpSendResult(OtpSendOutcome Outcome, int RetryAfterSeconds = 0);

// İndirim kazanma ve sorgulama akışlarının ortak parçası: gönderim sınırlarını uygular, yeni kodu üretip
// özetini kayda yazar ve e-postayı gönderir. Kaydın veritabanına yazılması çağıran işleyicinin işidir.
public class CodewaveOtpSender
{
    private readonly CodewaveSecurityService _security;
    private readonly EmailService _emailService;
    private readonly ILogger<CodewaveOtpSender> _logger;

    public CodewaveOtpSender(CodewaveSecurityService security, EmailService emailService, ILogger<CodewaveOtpSender> logger)
    {
        _security = security;
        _emailService = emailService;
        _logger = logger;
    }

    // Sınır aşıldıysa kayıt değiştirilmez.
    public OtpSendResult? CheckLimits(ICodewaveOtpHolder entry, DateTime now)
    {
        if (entry.OtpLastSentAt is { } last && now - last < CodewaveRules.OtpResendCooldown)
        {
            var wait = (int)Math.Ceiling((CodewaveRules.OtpResendCooldown - (now - last)).TotalSeconds);
            return new OtpSendResult(OtpSendOutcome.Cooldown, wait);
        }

        var windowOpen = entry.OtpSendWindowStartedAt is { } start && now - start < CodewaveRules.OtpSendWindow;
        if (windowOpen && entry.OtpSendCount >= CodewaveRules.OtpMaxSendsPerWindow)
        {
            var wait = (int)Math.Ceiling((CodewaveRules.OtpSendWindow - (now - entry.OtpSendWindowStartedAt!.Value)).TotalSeconds);
            return new OtpSendResult(OtpSendOutcome.LimitReached, wait);
        }

        return null;
    }

    // Yeni kodu kayda işler (özet + süre + sayaçlar) ve düz kodu döner. Önce CheckLimits çağrılmalıdır.
    public string Issue(ICodewaveOtpHolder entry, DateTime now)
    {
        var otp = _security.GenerateOtp();

        entry.OtpCodeHash = _security.HashOtp(entry.Email, otp);
        entry.OtpCodeExpiresAt = now.Add(CodewaveRules.OtpLifetime);
        entry.OtpFailedAttempts = 0;
        entry.OtpLastSentAt = now;

        if (entry.OtpSendWindowStartedAt is not { } start || now - start >= CodewaveRules.OtpSendWindow)
        {
            entry.OtpSendWindowStartedAt = now;
            entry.OtpSendCount = 0;
        }
        entry.OtpSendCount++;

        return otp;
    }

    public async Task<bool> SendTicketLookupAsync(string email, string otp, bool english)
    {
        var minutes = (int)CodewaveRules.OtpLifetime.TotalMinutes;
        var subject = english ? "Your CODEWAVE 2026 verification code" : "CODEWAVE 2026 doğrulama kodunuz";
        var body =
            "<div style=\"font-family:Arial,sans-serif;max-width:480px\">" +
            (english
                ? "<h3 style=\"margin:0 0 12px\">CODEWAVE 2026 · Find my ticket</h3><p>Your verification code to see your ticket:</p>"
                : "<h3 style=\"margin:0 0 12px\">CODEWAVE 2026 · Biletimi bul</h3><p>Biletinizi görüntülemek için doğrulama kodunuz:</p>") +
            $"<p style=\"font-size:28px;letter-spacing:6px;font-weight:700;margin:16px 0\">{otp}</p>" +
            (english
                ? $"<p>The code is valid for {minutes} minutes and can be used once.</p><p style=\"color:#666;font-size:13px\">If you did not request this, ignore this email and do not share the code.</p>"
                : $"<p>Kod {minutes} dakika geçerlidir ve yalnızca bir kez kullanılabilir.</p><p style=\"color:#666;font-size:13px\">Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; kodu kimseyle paylaşmayın.</p>") +
            "</div>";

        try
        {
            await _emailService.SendEmailAsync(email, subject, body);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CODEWAVE biletimi bul OTP e-postası gönderilemedi.");
            return false;
        }
    }

    public async Task<bool> SendAsync(string email, string otp, bool isLookup)
    {
        var minutes = (int)CodewaveRules.OtpLifetime.TotalMinutes;
        var intro = isLookup
            ? "CODEWAVE 2026 öğrenci indirimini sorgulamak için doğrulama kodunuz:"
            : "CODEWAVE 2026 öğrenci indirimini almak için doğrulama kodunuz:";

        var body =
            "<div style=\"font-family:Arial,sans-serif;max-width:480px\">" +
            "<h3 style=\"margin:0 0 12px\">CODEWAVE 2026 · Öğrenci İndirimi</h3>" +
            $"<p>{intro}</p>" +
            $"<p style=\"font-size:28px;letter-spacing:6px;font-weight:700;margin:16px 0\">{otp}</p>" +
            $"<p>Kod {minutes} dakika geçerlidir ve yalnızca bir kez kullanılabilir.</p>" +
            "<p style=\"color:#666;font-size:13px\">Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; kodu kimseyle paylaşmayın.</p>" +
            "</div>";

        try
        {
            await _emailService.SendEmailAsync(email, "CODEWAVE 2026 doğrulama kodunuz", body);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CODEWAVE OTP e-postası gönderilemedi.");
            return false;
        }
    }
}
