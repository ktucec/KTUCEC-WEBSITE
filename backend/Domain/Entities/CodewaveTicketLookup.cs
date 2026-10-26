using ktucec.Domain.Entities.Common;

namespace ktucec.Domain.Entities;

// "Biletimi bul" sayfası için e-posta doğrulama kaydı. Bilet alırken yazılan (kişisel) adrese kod gönderilir;
// kod doğrulanınca o adresin onaylı biletleri (QR kodlarıyla) gösterilir. Yalnızca onaylı bileti olan adresler için açılır.
public class CodewaveTicketLookup : BaseEntity, ICodewaveOtpHolder
{
    // Küçük harfe çevrilmiş adres (benzersiz)
    public string Email { get; set; } = string.Empty;

    // Kodun kendisi değil, gizli anahtarla alınmış HMAC-SHA256 özeti saklanır.
    public string? OtpCodeHash { get; set; }
    public DateTime? OtpCodeExpiresAt { get; set; }
    public int OtpFailedAttempts { get; set; }

    public DateTime? OtpLastSentAt { get; set; }
    public DateTime? OtpSendWindowStartedAt { get; set; }
    public int OtpSendCount { get; set; }

    public string? LastRequestIp { get; set; }
}
