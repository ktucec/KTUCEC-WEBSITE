using ktucec.Domain.Entities.Common;
using ktucec.Domain.Enums;

namespace ktucec.Domain.Entities;

// CODEWAVE bilet başvurusu. Bilet formu gönderilip ziyaretçi Shopier'e yönlendirilirken "Waiting" olarak
// oluşturulur. Bir telefon numarasıyla tek bilet alınabilir: aynı numarayla bekleyen başvuru varsa yenisi açılmaz,
// o satır güncellenir. Shopier sipariş senkronizasyonu ödenen başvuruyu onaylar ve onay e-postası gönderir.
public class CodewaveApplication : BaseEntity
{
    // --- Bilet formu ---
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;

    // Eşleştirme anahtarı: telefonun yalnızca rakamları, Türkiye numaralarında son 10 hane (ör. 5321234567).
    // Shopier siparişindeki telefon da aynı biçime çevrilip bununla karşılaştırılır.
    public string PhoneKey { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public CodewaveAttendeeType AttendeeType { get; set; }
    public string Language { get; set; } = "TR";

    // --- Tutar (TL) ---
    public decimal ListPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalPrice { get; set; }
    public string Currency { get; set; } = "TRY";

    // --- İndirim (varsa) ---
    public int? CodewaveStudentDiscountId { get; set; }
    public CodewaveStudentDiscount? CodewaveStudentDiscount { get; set; }
    public string? DiscountCode { get; set; }

    // Ziyaretçinin yönlendirildiği Shopier ürün sayfası (indirimsizde herkese açık ürün, indirimlide tek stoklu ürün)
    public string? ShopierProductUrl { get; set; }

    public CodewaveApplicationStatus Status { get; set; } = CodewaveApplicationStatus.Waiting;

    // --- Shopier ödemesi (senkronizasyon doldurur) ---
    public string? ShopierOrderId { get; set; }
    public decimal? PaidAmount { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? RefundedAt { get; set; }

    // Onay e-postası (kişisel adrese) gönderildiğinde dolar; boşsa sonraki senkronizasyon yeniden dener.
    public DateTime? ConfirmationEmailSentAt { get; set; }
}
