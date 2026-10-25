using ktucec.Domain.Entities.Common;
using ktucec.Domain.Enums;

namespace ktucec.Domain.Entities;

// CODEWAVE bilet başvurusu. Shopier'e yönlendirmeden hemen önce "Pending" olarak oluşturulur,
// Shopier'in imzalı geri dönüşüyle "Paid" ya da "Failed" olur.
public class CodewaveApplication : BaseEntity
{
    // codewave sitesinin ürettiği, Shopier'e platform_order_id olarak giden sipariş numarası (benzersiz)
    public string OrderId { get; set; } = string.Empty;

    // --- Bilet formu ---
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
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

    // --- Ödeme ---
    public CodewaveApplicationStatus Status { get; set; } = CodewaveApplicationStatus.Pending;
    public string? PaymentId { get; set; }
    public DateTime? PaidAt { get; set; }
}
