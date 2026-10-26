using System.Globalization;
using System.Net;
using ktucec.Domain.Entities;

namespace ktucec.Infrastructure.Services.Codewave;

// Ödemesi onaylanan bilet başvurusuna, formdaki (kişisel) e-posta adresine onay e-postası gönderir.
// Başvurunun diline göre Türkçe ya da İngilizce yazılır. Kullanıcıdan gelen metinler HTML'e kodlanarak eklenir.
public class CodewaveTicketMailer
{
    private const string EventDateTr = "8 Aralık 2026, 09.00";
    private const string EventDateEn = "8 December 2026, 09:00";
    private const string VenueTr = "KTÜ Prof. Dr. Osman Turan Kültür ve Kongre Merkezi, Trabzon";
    private const string VenueEn = "KTU Prof. Dr. Osman Turan Culture and Congress Center, Trabzon";
    private const string SiteUrl = "https://codewave.ktucec.com";
    private const string ContactEmail = "ktucec@ceng.ktu.edu.tr";

    private readonly EmailService _emailService;
    private readonly ILogger<CodewaveTicketMailer> _logger;

    public CodewaveTicketMailer(EmailService emailService, ILogger<CodewaveTicketMailer> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    // QR görseli ve bilet bağlantısı. Görsel yüklenmeyen e-posta istemcileri için bağlantı ve "biletimi bul" yolu da yazılır.
    private static string TicketBlock(string? ticketCode, bool en)
    {
        if (string.IsNullOrEmpty(ticketCode)) return string.Empty;

        var link = $"{SiteUrl}/bilet/{ticketCode}";
        var find = $"{SiteUrl}/biletim";
        return
            "<div style=\"margin:20px 0;padding:16px;border:1px solid #e3e3e3;border-radius:12px;text-align:center\">" +
            (en
                ? "<p style=\"margin:0 0 10px;font-weight:600\">Your entry QR code</p>"
                : "<p style=\"margin:0 0 10px;font-weight:600\">Giriş QR kodun</p>") +
            $"<a href=\"{link}\"><img src=\"{link}/qr.png\" width=\"220\" height=\"220\" alt=\"QR\" style=\"display:block;margin:0 auto\"></a>" +
            (en
                ? $"<p style=\"margin:10px 0 0;font-size:13px\">Show it at the entrance. If the image does not load, open <a href=\"{link}\">your ticket page</a>.<br>Lost this email? Find your ticket anytime at <a href=\"{find}\">{find}</a>.</p>"
                : $"<p style=\"margin:10px 0 0;font-size:13px\">Girişte göster. Görsel yüklenmezse <a href=\"{link}\">bilet sayfanı</a> aç.<br>Bu e-postayı kaybedersen biletini istediğin zaman <a href=\"{find}\">{find}</a> adresinden bulabilirsin.</p>") +
            "</div>";
    }

    public async Task<bool> SendConfirmationAsync(CodewaveApplication application)
    {
        var en = application.Language == "EN";
        var name = WebUtility.HtmlEncode($"{application.FirstName} {application.LastName}".Trim());
        var reference = $"CW26-{application.Id:D5}";
        var order = WebUtility.HtmlEncode(application.ShopierOrderId ?? "-");
        var amount = (application.PaidAmount ?? application.TotalPrice).ToString("0.00", CultureInfo.InvariantCulture);
        var currency = WebUtility.HtmlEncode(application.Currency);

        string Row(string label, string value) =>
            $"<tr><td style=\"padding:6px 12px 6px 0;color:#555\">{label}</td><td style=\"padding:6px 0;font-weight:600\">{value}</td></tr>";

        var subject = en ? "Your CODEWAVE 2026 ticket is confirmed" : "CODEWAVE 2026 biletin onaylandı";
        var body =
            "<div style=\"font-family:Arial,sans-serif;max-width:520px;color:#111\">" +
            "<h2 style=\"margin:0 0 4px;color:#2e7ebe\">CODEWAVE 2026</h2>" +
            (en
                ? $"<p>Hi {name},</p><p>We received your payment and your CODEWAVE 2026 ticket is confirmed. See you there!</p>"
                : $"<p>Merhaba {name},</p><p>Ödemen alındı ve CODEWAVE 2026 biletin onaylandı. Etkinlikte görüşmek üzere!</p>") +
            "<table style=\"border-collapse:collapse;margin:16px 0\">" +
            Row(en ? "Date" : "Tarih", en ? EventDateEn : EventDateTr) +
            Row(en ? "Venue" : "Yer", en ? VenueEn : VenueTr) +
            Row(en ? "Registration no." : "Kayıt no", reference) +
            Row(en ? "Shopier order no." : "Shopier sipariş no", order) +
            Row(en ? "Amount paid" : "Ödenen tutar", $"{amount} {currency}") +
            "</table>" +
            TicketBlock(application.TicketCode, en) +
            (en
                ? $"<p>Event details: <a href=\"{SiteUrl}\">{SiteUrl}</a><br>Questions: <a href=\"mailto:{ContactEmail}\">{ContactEmail}</a></p>"
                : $"<p>Etkinlik bilgileri: <a href=\"{SiteUrl}\">{SiteUrl}</a><br>Soruların için: <a href=\"mailto:{ContactEmail}\">{ContactEmail}</a></p>") +
            "<p style=\"color:#666;font-size:13px\">KTÜCEC · Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü</p>" +
            "</div>";

        try
        {
            await _emailService.SendEmailAsync(application.Email, subject, body);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CODEWAVE bilet onay e-postası gönderilemedi (başvuru {ApplicationId}).", application.Id);
            return false;
        }
    }
}
