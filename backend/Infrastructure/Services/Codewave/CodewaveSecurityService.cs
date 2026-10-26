using System.Security.Cryptography;
using System.Text;

namespace ktucec.Infrastructure.Services.Codewave;

// CODEWAVE indirim akışının kriptografik işleri: OTP üretimi/özeti, indirim kodu üretimi ve
// codewave sunucusunun gönderdiği iç anahtarın doğrulanması.
public class CodewaveSecurityService
{
    // Karışabilecek karakterler (0/O, 1/I/L) çıkarılmış alfabe
    private const string CodeAlphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    private const int MinSecretLength = 32;

    private readonly IConfiguration _configuration;

    public CodewaveSecurityService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private string GetSecret(string key)
    {
        var value = _configuration[$"Codewave:{key}"];
        if (string.IsNullOrWhiteSpace(value) || value.Length < MinSecretLength)
            throw new InvalidOperationException($"Codewave:{key} ayarı eksik ya da {MinSecretLength} karakterden kısa.");
        return value;
    }

    // 000000-999999 arası, kriptografik olarak güvenli rastgele 6 haneli kod
    public string GenerateOtp() => RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");

    // Kod e-postaya bağlı olarak özetlenir; aynı kod farklı bir adres için geçersizdir.
    public string HashOtp(string normalizedEmail, string otp)
    {
        var key = Encoding.UTF8.GetBytes(GetSecret("OtpSecret"));
        var data = Encoding.UTF8.GetBytes($"{normalizedEmail}:{otp}");
        return Convert.ToHexString(HMACSHA256.HashData(key, data)).ToLowerInvariant();
    }

    // Sabit zamanlı karşılaştırma: yanıt süresinden kodun doğruluğu tahmin edilemez
    public bool VerifyOtp(string? storedHash, string normalizedEmail, string otp)
    {
        if (string.IsNullOrEmpty(storedHash)) return false;
        var expected = Encoding.ASCII.GetBytes(storedHash);
        var actual = Encoding.ASCII.GetBytes(HashOtp(normalizedEmail, otp));
        return CryptographicOperations.FixedTimeEquals(expected, actual);
    }

    // Ör. CW26-7KQ2-M9XA → 31^8 ≈ 850 milyar olasılık
    public string GenerateDiscountCode()
    {
        Span<char> chars = stackalloc char[8];
        for (var i = 0; i < chars.Length; i++)
            chars[i] = CodeAlphabet[RandomNumberGenerator.GetInt32(CodeAlphabet.Length)];
        return $"CW26-{new string(chars[..4])}-{new string(chars[4..])}";
    }

    // Shopier'deki tek stoklu indirimli ürünün adına eklenen rastgele kod (ör. K7Q2M9XAP4RT8WZ3)
    public string GenerateProductCode(int length = 16)
    {
        Span<char> chars = stackalloc char[length];
        for (var i = 0; i < chars.Length; i++)
            chars[i] = CodeAlphabet[RandomNumberGenerator.GetInt32(CodeAlphabet.Length)];
        return new string(chars);
    }

    // QR biletin kodu: 31^20 ≈ 2^99 olasılık, tahmin edilemez. Telefon/ad gibi bir bilgiden türetilmez.
    public string GenerateTicketCode() => GenerateProductCode(20);

    // İki değer de SHA-256'dan geçirilir; böylece uzunluk farkı bile zamanlamadan sızmaz.
    public bool IsValidInternalKey(string? provided)
    {
        if (string.IsNullOrEmpty(provided)) return false;
        var expected = SHA256.HashData(Encoding.UTF8.GetBytes(GetSecret("InternalApiKey")));
        var actual = SHA256.HashData(Encoding.UTF8.GetBytes(provided));
        return CryptographicOperations.FixedTimeEquals(expected, actual);
    }
}
