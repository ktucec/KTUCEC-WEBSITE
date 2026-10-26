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

    // --- Shopier indirimli ürün ---
    // Aynı indirim için eşzamanlı iki ödeme denemesi ikinci bir ürün açamaz; kilit bu süre sonra kendiliğinden düşer.
    public static readonly TimeSpan ShopierProductLock = TimeSpan.FromMinutes(2);

    public const int EmailMaxLength = 254;

    // --- Shopier sipariş senkronizasyonu ---
    // Her çalıştırmada son 3 günün siparişleri okunur (30 dk'da bir çalışır; kaçan çalıştırmaları da kapsar).
    // Tam iadeler ayrıca son 60 günden (Shopier varsayılanı) okunur.
    public static readonly TimeSpan OrderSyncLookback = TimeSpan.FromDays(3);
    public const int OrderSyncMaxEmailsPerRun = 25;

    // Telefonu eşleştirme anahtarına çevirir: yalnızca rakamlar; Türkiye numaralarında başındaki 0/90/0090 atılır
    // (0532 123 45 67, +90 532 123 45 67, 5321234567 → 5321234567). Yabancı numaralar tüm rakamlarıyla kalır.
    public static string PhoneKey(string? phone)
    {
        var digits = new string((phone ?? string.Empty).Where(char.IsAsciiDigit).ToArray());
        if (digits.StartsWith("00", StringComparison.Ordinal)) digits = digits[2..];
        if (digits.Length == 12 && digits.StartsWith("90", StringComparison.Ordinal)) return digits[2..];
        if (digits.Length == 11 && digits.StartsWith('0')) return digits[1..];
        return digits.Length > 16 ? digits[..16] : digits;
    }

    [GeneratedRegex(@"^\d{2,15}$")]
    private static partial Regex StudentNumberRegex();

    [GeneratedRegex(@"^\d{6}$")]
    private static partial Regex OtpRegex();

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

    public static bool IsValidDiscountCode(string? value) => value is not null && DiscountCodeRegex().IsMatch(value);
}
