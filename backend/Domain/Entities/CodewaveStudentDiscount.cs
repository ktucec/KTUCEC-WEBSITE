using ktucec.Domain.Entities.Common;

namespace ktucec.Domain.Entities;

// edu.tr e-posta onayı ile kazanılan tek seferlik CODEWAVE öğrenci indirimi.
// Bir e-posta adresi yalnızca bir kez indirim kazanabilir; indirim kodu yalnızca bir ödemede kullanılabilir.
public class CodewaveStudentDiscount : BaseEntity
{
    // Küçük harfe çevrilmiş, *.edu.tr uzantılı adres (benzersiz)
    public string Email { get; set; } = string.Empty;

    // 2-15 haneli, yalnızca rakam
    public string StudentNumber { get; set; } = string.Empty;

    // --- OTP ---
    // Kodun kendisi değil, gizli anahtarla alınmış HMAC-SHA256 özeti saklanır (DB sızsa bile kod okunamaz).
    public string? OtpCodeHash { get; set; }
    public DateTime? OtpCodeExpiresAt { get; set; }
    public int OtpFailedAttempts { get; set; }

    // Gönderim sınırı: tekrar gönderme bekleme süresi ve saatlik pencere
    public DateTime? OtpLastSentAt { get; set; }
    public DateTime? OtpSendWindowStartedAt { get; set; }
    public int OtpSendCount { get; set; }

    // --- Onay ---
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }

    // Onaydan sonra üretilir (benzersiz). Shopier'e giden siparişte bu kod kullanılır.
    public string? DiscountCode { get; set; }

    // --- Tek seferlik kullanım ---
    // Ödeme sayfasına gidilirken kod bu siparişe kısa süreliğine ayrılır; ödeme başarısız olursa ya da süre dolarsa serbest kalır.
    public string? ReservedOrderId { get; set; }
    public DateTime? ReservedUntil { get; set; }

    // Başarılı ödemeyle kod kalıcı olarak kullanılmış sayılır.
    public DateTime? RedeemedAt { get; set; }
    public string? RedeemedOrderId { get; set; }

    // Kötüye kullanım incelemesi için son isteğin IP adresi
    public string? LastRequestIp { get; set; }

    public ICollection<CodewaveApplication> Applications { get; set; } = new List<CodewaveApplication>();
}
