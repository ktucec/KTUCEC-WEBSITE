using ktucec.Domain.Entities.Common;

namespace ktucec.Domain.Entities;

// Shopier'den okunan CODEWAVE bilet siparişi. Her sipariş bir kez kaydedilir (OrderId benzersiz); senkronizasyon
// tekrar çalıştığında aynı sipariş ikinci kez işlenmez. Eşleşmeyen siparişler UnmatchedReason ile burada kalır
// ve elle incelenir.
public class CodewaveShopierOrder : BaseEntity
{
    public string OrderId { get; set; } = string.Empty;
    public DateTime? OrderCreatedAt { get; set; }

    // Siparişteki bilet ürünü (herkese açık bilet ya da öğrenciye özel tek stoklu ürün)
    public string ProductId { get; set; } = string.Empty;
    public string? ProductTitle { get; set; }
    public int Quantity { get; set; }
    public decimal? Total { get; set; }
    public string? Currency { get; set; }

    // Shopier ödeme sayfasında girilen alıcı bilgileri
    public string? BuyerFirstName { get; set; }
    public string? BuyerLastName { get; set; }
    public string? BuyerEmail { get; set; }
    public string? BuyerPhone { get; set; }

    // Eşleşme: product (öğrenci ürünü) · phone · email. Eşleşmediyse CodewaveApplicationId boş, neden UnmatchedReason'da:
    // no_application · duplicate · quantity · amount_mismatch
    public int? CodewaveApplicationId { get; set; }
    public CodewaveApplication? CodewaveApplication { get; set; }
    public string? MatchMethod { get; set; }
    public string? UnmatchedReason { get; set; }

    // Tam iade tamamlandığında dolar
    public DateTime? RefundedAt { get; set; }
}
