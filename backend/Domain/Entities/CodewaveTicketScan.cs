using ktucec.Domain.Entities.Common;

namespace ktucec.Domain.Entities;

// Yönetim panelinde okutulan her bilet için bir satır. Bilet birden çok kez okutulabilir; hiçbiri reddedilmez,
// hepsi kaydedilir (CreatedAt = okutma zamanı). Tanınmayan kodlar için kayıt açılmaz.
public class CodewaveTicketScan : BaseEntity
{
    public int CodewaveApplicationId { get; set; }
    public CodewaveApplication? CodewaveApplication { get; set; }

    // Okutan yönetici (kullanıcı silinirse kayıt kalır, ad burada durur)
    public int? ScannedByUserId { get; set; }
    public string ScannedByName { get; set; } = string.Empty;

    // Okutma anındaki bilet durumu: "valid" ya da "refunded"
    public string Result { get; set; } = "valid";
}
