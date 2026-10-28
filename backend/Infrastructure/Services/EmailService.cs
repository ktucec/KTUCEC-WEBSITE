using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace ktucec.Infrastructure.Services;

public class EmailService
{
    // SMTP sunucusu yanıt vermezse istek 100 sn (varsayılan) beklemesin: 20 sn sonra hata verilir,
    // çağıran taraf (onay e-postası / OTP) bunu "gönderilemedi" sayar.
    private static readonly TimeSpan SendTimeout = TimeSpan.FromSeconds(20);

    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var smtpSection = _configuration.GetSection("Smtp");
        var host = smtpSection["Host"];
        var port = int.Parse(smtpSection["Port"] ?? "587");

        var fromEmail = smtpSection["Email"]?.Trim();
        var password = smtpSection["Password"];

        if (string.IsNullOrWhiteSpace(fromEmail) || string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException("SMTP ayarları appsettings içinde bulunamadı veya eksik!");
        }

        var cleanToEmail = toEmail?.Trim();
        if (string.IsNullOrWhiteSpace(cleanToEmail))
        {
            throw new ArgumentException("Alıcı e-posta adresi boş olamaz.", nameof(toEmail));
        }

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(fromEmail, password),
            EnableSsl = true,
            Timeout = (int)SendTimeout.TotalMilliseconds
        };

        using var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail, "KTUCEC Yönetimi"),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };

        mailMessage.To.Add(cleanToEmail);

        // Async gönderimde SmtpClient.Timeout her zaman uygulanmayabildiği için süre ayrıca burada da sınırlanır.
        await client.SendMailAsync(mailMessage).WaitAsync(SendTimeout);
    }
}