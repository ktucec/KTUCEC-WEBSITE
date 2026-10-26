namespace ktucec.Domain.Enums;

// CODEWAVE bilet başvurusunun durumu. Form gönderilip Shopier'e yönlendirilince "Waiting" olarak açılır.
// Shopier siparişleri senkronize edilince ödenmiş başvuru "Approved", tam iadesi tamamlanan "Refunded" olur.
// "Rejected" elle (ileride yönetim panelinden) kullanılmak içindir.
public enum CodewaveApplicationStatus
{
    Waiting = 0,
    Approved = 1,
    Rejected = 2,
    Refunded = 3
}
