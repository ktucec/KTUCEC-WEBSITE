namespace ktucec.Domain.Entities;

// Tek kullanımlık e-posta kodu (OTP) alanlarını taşıyan kayıtların ortak yüzü. Gönderim sınırları ve kod üretimi
// (CodewaveOtpSender) bu arayüz üzerinden hem öğrenci indirimi hem de "biletimi bul" kayıtları için çalışır.
public interface ICodewaveOtpHolder
{
    string Email { get; }
    string? OtpCodeHash { get; set; }
    DateTime? OtpCodeExpiresAt { get; set; }
    int OtpFailedAttempts { get; set; }
    DateTime? OtpLastSentAt { get; set; }
    DateTime? OtpSendWindowStartedAt { get; set; }
    int OtpSendCount { get; set; }
}
