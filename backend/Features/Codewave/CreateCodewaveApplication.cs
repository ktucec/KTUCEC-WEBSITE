using ktucec.Domain.Entities;
using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Codewave;
using ktucec.Infrastructure.Services.Shopier;
using ktucec.Shared.Common;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Codewave;


// 1. REQUEST & RESPONSE
public record CreateCodewaveApplicationRequest(
    string? FirstName,
    string? LastName,
    string? Email,
    string? Phone,
    string? City,
    string? AttendeeType,
    string? Language,
    decimal ListPrice,
    decimal DiscountAmount,
    decimal TotalPrice,
    string? Currency,
    string? DiscountCode);

// RedirectUrl: indirimli bilette öğrenciye özel tek stoklu Shopier ürünü; indirimsizde null
// (codewave sitesi herkese açık bilet ürününe yönlendirir).
public record CreateCodewaveApplicationResponse(int ApplicationId, string? RedirectUrl);


// 2. HANDLER
// YALNIZCA codewave sunucusu çağırır (X-Codewave-Key). Bilet formu gönderildiğinde başvuruyu "Waiting" olarak kaydeder.
// İndirim kodu varsa:
//  - kod, kazanıldığı edu.tr adresiyle (formdaki e-posta) eşleşmelidir,
//  - öğrenciye özel ürün yoksa Shopier'de indirimli fiyatla, adında rastgele kod geçen tek stoklu bir ürün açılır,
//  - ürün zaten varsa ve stoğu bitmişse (satın alınmış) indirim kullanılmış sayılır, yoksa aynı ürüne yönlendirilir.
// Böylece her indirim en fazla bir kez satın alınabilir; ziyaretçi ödemeden sonra siteye dönmese bile.
// Bir telefon numarasıyla tek bilet: o numarayla onaylanmış (ödenmiş) başvuru varsa reddedilir ("phone_used");
// bekleyen başvuru varsa yeni satır açılmaz, aynı satır yeni bilgilerle güncellenir.
public class CreateCodewaveApplicationHandler
{
    private readonly KtucecDbContext _context;
    private readonly CodewaveSecurityService _security;
    private readonly ShopierApiClient _shopier;

    public CreateCodewaveApplicationHandler(KtucecDbContext context, CodewaveSecurityService security, ShopierApiClient shopier)
    {
        _context = context;
        _security = security;
        _shopier = shopier;
    }

    public async Task<IResult> HandleAsync(CreateCodewaveApplicationRequest request)
    {
        // A. INPUT VALIDATION (codewave tarafı da doğruluyor; burada güvenmeden tekrar kontrol edilir)
        var firstName = (request.FirstName ?? string.Empty).Trim();
        var lastName = (request.LastName ?? string.Empty).Trim();
        var email = CodewaveRules.NormalizeEmail(request.Email);
        var phone = (request.Phone ?? string.Empty).Trim();
        var city = (request.City ?? string.Empty).Trim();
        var language = request.Language == "EN" ? "EN" : "TR";
        var currency = (request.Currency ?? string.Empty).Trim().ToUpperInvariant();
        var hasCode = !string.IsNullOrWhiteSpace(request.DiscountCode);
        var discountCode = hasCode ? CodewaveRules.NormalizeDiscountCode(request.DiscountCode) : null;

        if (firstName.Length is 0 or > 50
            || lastName.Length is 0 or > 50
            || email.Length is 0 or > CodewaveRules.EmailMaxLength || !email.Contains('@')
            || phone.Length is < 8 or > 16
            || city.Length is 0 or > 60
            || currency.Length != 3
            || !Enum.TryParse<CodewaveAttendeeType>(request.AttendeeType, ignoreCase: true, out var attendeeType)
            || !Enum.IsDefined(attendeeType))
        {
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "invalid", "Başvuru bilgileri geçersiz.");
        }

        // Tutarlar: indirim yalnızca kodla birlikte ve toplam = liste - indirim olmalı
        if (request.ListPrice <= 0 || request.DiscountAmount < 0 || request.TotalPrice <= 0
            || request.DiscountAmount >= request.ListPrice
            || request.TotalPrice != request.ListPrice - request.DiscountAmount
            || hasCode != (request.DiscountAmount > 0))
        {
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "invalid_amount", "Başvuru tutarı geçersiz.");
        }

        // Telefon: tek bilet kuralı ve Shopier siparişiyle eşleştirme bu anahtarla yapılır
        var phoneKey = CodewaveRules.PhoneKey(phone);
        if (phoneKey.Length < 8)
            return CodewaveResults.Error(StatusCodes.Status400BadRequest, "invalid", "Başvuru bilgileri geçersiz.");

        CodewaveStudentDiscount? discount = null;
        string? redirectUrl = null;

        // B. İNDİRİM KODU: kod geçerli ve doğrulanmış olmalı. Form e-postası kişisel adrestir; indirimin bağlı olduğu
        // edu.tr adresiyle aynı olması gerekmez (indirim kodla taşınır).
        if (hasCode)
        {
            if (!CodewaveRules.IsValidDiscountCode(discountCode))
                return CodewaveResults.Error(StatusCodes.Status404NotFound, "discount_invalid", "İndirim kodu geçersiz.");

            discount = await _context.CodewaveStudentDiscounts.FirstOrDefaultAsync(d => d.DiscountCode == discountCode);
            if (discount is null || !discount.IsVerified)
                return CodewaveResults.Error(StatusCodes.Status404NotFound, "discount_invalid", "İndirim kodu geçersiz.");
        }

        // C. MEVCUT KAYIT: yeni satır açmadan önce aynı e-posta, telefon ya da indirime ait kayıt aranır.
        //  - Ödenmiş (onaylı) bilet varsa yeni başvuru açılmaz ve tekrar satın alma engellenir.
        //  - Bekleyen kayıt varsa yenisi açılmaz; o satır güncellenir ve ziyaretçi aynı ödeme sayfasına yönlendirilir
        //    (indirimliyse kendisine ayrılmış ürüne, indirimsizse herkese açık ürüne).
        var discountId = discount?.Id;
        var matches = await _context.CodewaveApplications
            .Where(a => (a.Status == CodewaveApplicationStatus.Waiting || a.Status == CodewaveApplicationStatus.Approved)
                        && (a.Email == email
                            || a.PhoneKey == phoneKey
                            || (discountId != null && a.CodewaveStudentDiscountId == discountId)))
            .OrderByDescending(a => a.Id)
            .ToListAsync();

        if (discountId is not null
            && matches.Any(a => a.Status == CodewaveApplicationStatus.Approved && a.CodewaveStudentDiscountId == discountId))
            return CodewaveResults.Error(StatusCodes.Status409Conflict, "discount_used", "Bu indirim daha önce kullanılmış.");

        if (matches.Any(a => a.Status == CodewaveApplicationStatus.Approved && a.Email == email))
            return CodewaveResults.Error(StatusCodes.Status409Conflict, "email_used", "Bu e-posta adresiyle zaten bilet alınmış.");

        if (matches.Any(a => a.Status == CodewaveApplicationStatus.Approved && a.PhoneKey == phoneKey))
            return CodewaveResults.Error(StatusCodes.Status409Conflict, "phone_used", "Bu telefon numarasıyla zaten bilet alınmış.");

        var existing = matches.FirstOrDefault(a => a.Status == CodewaveApplicationStatus.Waiting);

        // D. İNDİRİMLİ BİLET: öğrenciye özel tek stoklu ürün (varsa aynı ürüne, yoksa yenisi açılır)
        if (discount is not null)
        {
            var product = await GetOrCreateProductAsync(discount, request.TotalPrice, currency);
            if (product.Error is not null) return product.Error;
            redirectUrl = product.Url;
        }

        // E. BAŞVURUYU KAYDET (mevcut bekleyen kayıt varsa o satır güncellenir)
        var application = existing ?? new CodewaveApplication
        {
            Status = CodewaveApplicationStatus.Waiting,
            CreatedAt = DateTime.UtcNow
        };

        application.FirstName = firstName;
        application.LastName = lastName;
        application.Email = email;
        application.Phone = phone;
        application.PhoneKey = phoneKey;
        application.City = city;
        application.AttendeeType = attendeeType;
        application.Language = language;
        application.ListPrice = request.ListPrice;
        application.DiscountAmount = request.DiscountAmount;
        application.TotalPrice = request.TotalPrice;
        application.Currency = currency;
        application.CodewaveStudentDiscountId = discount?.Id;
        application.DiscountCode = discount?.DiscountCode;
        application.ShopierProductUrl = redirectUrl;

        if (existing is null)
            _context.CodewaveApplications.Add(application);

        await _context.SaveChangesAsync();

        var data = new CreateCodewaveApplicationResponse(application.Id, redirectUrl);
        return Results.Ok(new ApiResult<CreateCodewaveApplicationResponse>(true, data, "Başvuru kaydedildi."));
    }

    private record ProductResult(string? Url, IResult? Error);

    private async Task<ProductResult> GetOrCreateProductAsync(CodewaveStudentDiscount discount, decimal price, string currency)
    {
        // 1. Ürün zaten açılmış: stok bittiyse indirim kullanılmıştır, değilse aynı ürüne gidilir.
        if (!string.IsNullOrEmpty(discount.ShopierProductId))
        {
            var existing = await _shopier.GetProductAsync(discount.ShopierProductId);
            if (existing?.StockQuantity is <= 0)
                return new(null, CodewaveResults.Error(StatusCodes.Status409Conflict, "discount_used", "Bu indirim daha önce kullanılmış."));

            if (!string.IsNullOrEmpty(existing?.Url) && existing.Url != discount.ShopierProductUrl)
                discount.ShopierProductUrl = existing.Url;

            if (string.IsNullOrEmpty(discount.ShopierProductUrl))
                return new(null, CodewaveResults.Error(StatusCodes.Status502BadGateway, "shopier_failed", "Ödeme sayfası hazırlanamadı."));

            return new(discount.ShopierProductUrl, null);
        }

        // 2. Ürün yok: kısa süreli kilit al (tek UPDATE; eşzamanlı ikinci istek ikinci bir ürün açamaz).
        var now = DateTime.UtcNow;
        var lockExpired = now - CodewaveRules.ShopierProductLock;
        DateTime? requestedAt = now;

        var locked = await _context.CodewaveStudentDiscounts
            .Where(d => d.Id == discount.Id
                        && d.ShopierProductId == null
                        && (d.ShopierProductRequestedAt == null || d.ShopierProductRequestedAt < lockExpired))
            .ExecuteUpdateAsync(s => s.SetProperty(d => d.ShopierProductRequestedAt, requestedAt));

        if (locked == 0)
            return new(null, CodewaveResults.Error(StatusCodes.Status409Conflict, "busy", "İndirimli bilet hazırlanıyor, birkaç saniye sonra tekrar deneyin."));

        // 3. Shopier'de tek stoklu ürünü aç
        var code = _security.GenerateProductCode();
        var created = await _shopier.CreateDigitalProductAsync(
            title: $"CODEWAVE 2026 Öğrenci Bileti {code}",
            price: price,
            currency: currency,
            stockQuantity: 1);

        if (created is null)
        {
            // Kilit hemen bırakılır; öğrenci tekrar deneyebilir.
            await _context.CodewaveStudentDiscounts
                .Where(d => d.Id == discount.Id && d.ShopierProductId == null)
                .ExecuteUpdateAsync(s => s.SetProperty(d => d.ShopierProductRequestedAt, (DateTime?)null));
            return new(null, CodewaveResults.Error(StatusCodes.Status502BadGateway, "shopier_failed", "Ödeme sayfası hazırlanamadı."));
        }

        // Ürün açıldıysa (bağlantısı gelmese bile) kimliği kaydedilir: bir sonraki denemede yenisi açılmaz.
        discount.ShopierProductId = created.Id;
        discount.ShopierProductUrl = created.Url;
        discount.ShopierProductCode = code;
        discount.ShopierProductCreatedAt = now;
        discount.ShopierProductRequestedAt = now;
        await _context.SaveChangesAsync();

        if (string.IsNullOrEmpty(created.Url))
            return new(null, CodewaveResults.Error(StatusCodes.Status502BadGateway, "shopier_failed", "Ödeme sayfası hazırlanamadı."));

        return new(created.Url, null);
    }
}


// 3. ENDPOINT
public static class CreateCodewaveApplicationEndpoint
{
    public static void MapCreateCodewaveApplication(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/codewave/internal/applications", (CreateCodewaveApplicationRequest request, CreateCodewaveApplicationHandler handler) =>
            handler.HandleAsync(request))
        .AddEndpointFilter<CodewaveInternalKeyFilter>()
        .ExcludeFromDescription();
    }
}
