namespace ktucec.Domain.Enums;

// CODEWAVE bilet başvurusunun ödeme durumu.
// Pending: Shopier'e yönlendirildi, sonuç bekleniyor. Paid / Failed: Shopier'in imzalı geri dönüşüyle kesinleşir.
public enum CodewaveApplicationStatus
{
    Pending = 0,
    Paid = 1,
    Failed = 2
}
