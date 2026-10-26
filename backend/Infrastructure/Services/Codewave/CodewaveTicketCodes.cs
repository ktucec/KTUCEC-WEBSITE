using ktucec.Domain.Entities;
using ktucec.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Infrastructure.Services.Codewave;

// Onaylı başvurulara QR bilet kodu verir. Senkronizasyon ve "biletimi bul" aynı yolu kullanır; böylece onayı
// elle (ya da QR özelliğinden önce) verilmiş başvuruların da kodu olur. Kaydetme çağıranın işidir.
public class CodewaveTicketCodes
{
    private readonly KtucecDbContext _context;
    private readonly CodewaveSecurityService _security;

    public CodewaveTicketCodes(KtucecDbContext context, CodewaveSecurityService security)
    {
        _context = context;
        _security = security;
    }

    // Kodu olmayan başvurulara kod yazar; kaç tanesine yazdığını döner.
    public async Task<int> AssignMissingAsync(IEnumerable<CodewaveApplication> applications, CancellationToken ct = default)
    {
        var count = 0;
        foreach (var app in applications.Where(a => string.IsNullOrEmpty(a.TicketCode)))
        {
            app.TicketCode = await GenerateUniqueAsync(ct);
            app.TicketIssuedAt = DateTime.UtcNow;
            count++;
        }
        return count;
    }

    private async Task<string> GenerateUniqueAsync(CancellationToken ct)
    {
        for (var i = 0; i < 5; i++)
        {
            var candidate = _security.GenerateTicketCode();
            if (!await _context.CodewaveApplications.AnyAsync(a => a.TicketCode == candidate, ct))
                return candidate;
        }
        throw new InvalidOperationException("Benzersiz bilet kodu üretilemedi.");
    }
}
