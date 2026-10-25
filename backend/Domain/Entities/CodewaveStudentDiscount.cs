using ktucec.Domain.Entities.Common;

namespace ktucec.Domain.Entities;

// edu.tr e-posta onayı ile kazanılan CODEWAVE öğrenci indirimi.
// Bir e-posta adresi yalnızca bir kez indirim kazanabilir. İndirimli bilet, Shopier'de bu kayda özel açılan
// tek stoklu bir üründür: ürün bir kez satın alınınca stok biter ve indirim kendiliğinden kullanılmış olur.
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

    // Onaydan sonra üretilir (benzersiz). Tarayıcı ödeme adımında bu kodla indirimli bileti ister.
    public string? DiscountCode { get; set; }

    // --- Shopier'deki tek stoklu indirimli ürün ---
    // İlk ödeme denemesinde bir kez oluşturulur; sonraki denemelerde aynı ürüne yönlendirilir.
    public string? ShopierProductId { get; set; }
    public string? ShopierProductUrl { get; set; }

    // Ürün adındaki rastgele kod (Shopier panelinde hangi öğrenciye ait olduğu buradan bulunur)
    public string? ShopierProductCode { get; set; }
    public DateTime? ShopierProductCreatedAt { get; set; }

    // Aynı anda iki ödeme denemesinin iki ürün açmasını engelleyen kısa süreli kilit
    public DateTime? ShopierProductRequestedAt { get; set; }

    // Kötüye kullanım incelemesi için son isteğin IP adresi
    public string? LastRequestIp { get; set; }

    public ICollection<CodewaveApplication> Applications { get; set; } = new List<CodewaveApplication>();
}
