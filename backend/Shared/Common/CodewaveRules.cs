using System.Text.RegularExpressions;

namespace ktucec.Shared.Common;

// CODEWAVE öğrenci indirimi ve bilet siparişi için sabit kurallar. Süre/sınır değişecekse yalnızca burası güncellenir.
public static partial class CodewaveRules
{
    // --- OTP ---
    public static readonly TimeSpan OtpLifetime = TimeSpan.FromMinutes(10);
    public static readonly TimeSpan OtpResendCooldown = TimeSpan.FromSeconds(60);
    public static readonly TimeSpan OtpSendWindow = TimeSpan.FromHours(1);
    public const int OtpMaxSendsPerWindow = 5;
    public const int OtpMaxFailedAttempts = 5;

    // --- Sipariş ---
    // Ödeme sayfasına giderken indirim kodu bu süre boyunca o siparişe ayrılır.
    public static readonly TimeSpan DiscountReservation = TimeSpan.FromMinutes(30);

    public const int EmailMaxLength = 254;

    [GeneratedRegex(@"^\d{2,15}$")]
    private static partial Regex StudentNumberRegex();

    [GeneratedRegex(@"^\d{6}$")]
    private static partial Regex OtpRegex();

    // codewave sitesindeki createOrderId() ile uyumlu: büyük harf + rakam
    [GeneratedRegex(@"^[A-Z0-9]{8,32}$")]
    private static partial Regex OrderIdRegex();

    [GeneratedRegex(@"^CW26-[0-9A-Z]{4}-[0-9A-Z]{4}$")]
    private static partial Regex DiscountCodeRegex();

    public static string NormalizeEmail(string? email) => (email ?? string.Empty).Trim().ToLowerInvariant();

    public static string NormalizeDiscountCode(string? code) => (code ?? string.Empty).Trim().ToUpperInvariant();

    // Yalnızca *.edu.tr uzantılı, geçerli biçimde bir adres (ör. 123456@ogr.ktu.edu.tr)
    public static bool IsEduTrEmail(string normalizedEmail)
    {
        if (normalizedEmail.Length is < 6 or > EmailMaxLength) return false;
        if (!System.Net.Mail.MailAddress.TryCreate(normalizedEmail, out var parsed)) return false;
        if (!string.Equals(parsed.Address, normalizedEmail, StringComparison.Ordinal)) return false;

        var host = parsed.Host;
        return host.EndsWith(".edu.tr", StringComparison.Ordinal) && host.Length > ".edu.tr".Length;
    }

    public static bool IsValidStudentNumber(string? value) => value is not null && StudentNumberRegex().IsMatch(value);

    public static bool IsValidOtp(string? value) => value is not null && OtpRegex().IsMatch(value);

    public static bool IsValidOrderId(string? value) => value is not null && OrderIdRegex().IsMatch(value);

    public static bool IsValidDiscountCode(string? value) => value is not null && DiscountCodeRegex().IsMatch(value);
}
