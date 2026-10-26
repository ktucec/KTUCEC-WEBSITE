using ktucec.Domain.Entities;
using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Codewave;
using ktucec.Infrastructure.Services.Shopier;
using ktucec.Shared.Common;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Codewave;


// 1. RESPONSE
public record SyncShopierOrdersResponse(
    int TicketOrders,
    int NewOrders,
    int Approved,
    int Refunded,
    int Unmatched,
    int EmailsSent,
    int EmailsFailed);


// 2. HANDLER
// Shopier'deki bilet siparişlerini okuyup başvuruların durumunu günceller. Dışarıdan (Plesk zamanlanmış görevi,
// 30 dk'da bir) tetiklenir; sunucu uyusa bile her çağrı uygulamayı uyandırıp işi yapar. Tekrar çalıştırmak güvenlidir:
// her sipariş bir kez kaydedilir (CodewaveShopierOrders.OrderId benzersiz).
//
// Eşleştirme:
//  - Öğrenciye özel ürün (ShopierProductId) → o indirime bağlı bekleyen başvuru (kesin eşleşme)
//  - Herkese açık bilet ürünü (Shopier:TicketProductId) → alıcı telefonu (PhoneKey), bulunamazsa alıcı e-postası
//  - Adet 1 değilse, tutar başvuruyla uyuşmuyorsa ya da başvuru zaten ödenmişse onaylanmaz; sipariş elle incelenmek
//    üzere UnmatchedReason ile kaydedilir.
// Tam iadesi tamamlanan siparişin başvurusu Refunded olur. Onaylanan başvurulara onay e-postası gönderilir.
public class SyncShopierOrdersHandler
{
    // Aynı anda tek senkronizasyon (tek sunucu süreci)
    private static readonly SemaphoreSlim Gate = new(1, 1);

    private readonly KtucecDbContext _context;
    private readonly ShopierApiClient _shopier;
    private readonly CodewaveTicketMailer _mailer;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SyncShopierOrdersHandler> _logger;

    public SyncShopierOrdersHandler(KtucecDbContext context, ShopierApiClient shopier, CodewaveTicketMailer mailer,
        IConfiguration configuration, ILogger<SyncShopierOrdersHandler> logger)
    {
        _context = context;
        _shopier = shopier;
        _mailer = mailer;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<IResult> HandleAsync()
    {
        if (!_shopier.IsConfigured)
            return CodewaveResults.Error(StatusCodes.Status503ServiceUnavailable, "not_configured", "Shopier bağlantısı ayarlanmamış.");

        if (!await Gate.WaitAsync(0))
            return CodewaveResults.Error(StatusCodes.Status409Conflict, "sync_running", "Senkronizasyon zaten çalışıyor.");

        try
        {
            // İstemci bağlantıyı kesse bile iş yarıda kalmasın; yalnızca kendi süre sınırımız geçerli.
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(100));
            var result = await RunAsync(cts.Token);
            if (result is null)
                return CodewaveResults.Error(StatusCodes.Status502BadGateway, "shopier_failed", "Shopier siparişleri okunamadı.");

            _logger.LogInformation("CODEWAVE Shopier senkronizasyonu: {@Result}", result);
            return Results.Ok(new ApiResult<SyncShopierOrdersResponse>(true, result, "Senkronizasyon tamamlandı."));
        }
        finally
        {
            Gate.Release();
        }
    }

    private async Task<SyncShopierOrdersResponse?> RunAsync(CancellationToken ct)
    {
        var ticketProductId = _configuration["Shopier:TicketProductId"]?.Trim();
        if (string.IsNullOrEmpty(ticketProductId))
            _logger.LogWarning("Shopier:TicketProductId boş; herkese açık bilet siparişleri eşleştirilmeyecek.");

        // A. SİPARİŞLERİ OKU: son günlerin tüm siparişleri + son 60 günün tam iadeleri
        var recent = await _shopier.ListOrdersAsync(DateTimeOffset.UtcNow - CodewaveRules.OrderSyncLookback, null, ct);
        var refundedOrders = await _shopier.ListOrdersAsync(null, "full", ct);
        if (recent is null || refundedOrders is null) return null;

        var orders = new Dictionary<string, ShopierOrder>();
        foreach (var o in recent.Concat(refundedOrders)) orders[o.Id] = o;

        // B. BİZİM ÜRÜNLERİMİZ: öğrenciye özel ürünler (veritabanından) ve herkese açık bilet ürünü
        var productIds = orders.Values.SelectMany(o => o.LineItems).Select(l => l.ProductId).Distinct().ToList();
        var discountsByProduct = await _context.CodewaveStudentDiscounts
            .Where(d => d.ShopierProductId != null && productIds.Contains(d.ShopierProductId))
            .ToDictionaryAsync(d => d.ShopierProductId!, ct);

        var orderIds = orders.Keys.ToList();
        var known = await _context.CodewaveShopierOrders
            .Where(x => orderIds.Contains(x.OrderId))
            .ToDictionaryAsync(x => x.OrderId, ct);

        int ticketOrders = 0, newOrders = 0, approved = 0, refunded = 0, unmatched = 0;

        foreach (var order in orders.Values.OrderBy(o => o.CreatedAt))
        {
            // Yalnızca ödenmiş siparişler (Shopier şu an zaten yalnızca bunları listeliyor)
            if (order.PaymentStatus is { Length: > 0 } ps && ps != "paid") continue;

            // Önce öğrenciye özel ürün, yoksa herkese açık bilet ürünü aranır; ikisi de yoksa bilet dışı bir sipariştir.
            CodewaveStudentDiscount? discount = null;
            ShopierOrderLine? line = null;
            foreach (var l in order.LineItems)
            {
                if (discountsByProduct.TryGetValue(l.ProductId, out var d))
                {
                    discount = d;
                    line = l;
                    break;
                }
            }
            if (line is null && !string.IsNullOrEmpty(ticketProductId))
                line = order.LineItems.FirstOrDefault(l => l.ProductId == ticketProductId);
            if (line is null) continue;

            ticketOrders++;

            if (!known.TryGetValue(order.Id, out var row))
            {
                row = new CodewaveShopierOrder
                {
                    OrderId = order.Id,
                    OrderCreatedAt = order.CreatedAt?.UtcDateTime,
                    ProductId = line.ProductId,
                    ProductTitle = Clip(line.Title, 200),
                    Quantity = order.LineItems.Sum(l => l.Quantity),
                    Total = order.Total ?? line.Total,
                    Currency = Clip(order.Currency, 3),
                    BuyerFirstName = Clip(order.BuyerFirstName, 100),
                    BuyerLastName = Clip(order.BuyerLastName, 100),
                    BuyerEmail = Clip(order.BuyerEmail?.Trim(), 254),
                    BuyerPhone = Clip(order.BuyerPhone?.Trim(), 32),
                    CreatedAt = DateTime.UtcNow
                };
                _context.CodewaveShopierOrders.Add(row);
                known[order.Id] = row;
                newOrders++;

                if (await MatchAsync(row, discount, ct)) approved++;
                else unmatched++;
            }
            else if (row.CodewaveApplicationId is null && row.UnmatchedReason == "no_application")
            {
                // Önceki çalıştırmada başvuru bulunamadıysa tekrar denenir
                if (await MatchAsync(row, discount, ct)) { approved++; unmatched--; }
            }

            // C. TAM İADE
            var fullRefund = order.Refunds.FirstOrDefault(r => r.Type == "full" && r.Status == "succeeded");
            if (fullRefund is not null && row.RefundedAt is null)
            {
                row.RefundedAt = (fullRefund.RefundedAt ?? DateTimeOffset.UtcNow).UtcDateTime;
                if (row.CodewaveApplicationId is { } appId)
                {
                    var app = await _context.CodewaveApplications.FirstOrDefaultAsync(a => a.Id == appId, ct);
                    if (app is not null && app.Status == CodewaveApplicationStatus.Approved)
                    {
                        app.Status = CodewaveApplicationStatus.Refunded;
                        app.RefundedAt = row.RefundedAt;
                        refunded++;
                    }
                }
            }

            await _context.SaveChangesAsync(ct);
        }

        // D. ONAY E-POSTALARI (gönderilemeyenler sonraki çalıştırmada tekrar denenir)
        var pendingMails = await _context.CodewaveApplications
            .Where(a => a.Status == CodewaveApplicationStatus.Approved && a.ConfirmationEmailSentAt == null && a.ShopierOrderId != null)
            .OrderBy(a => a.PaidAt)
            .Take(CodewaveRules.OrderSyncMaxEmailsPerRun)
            .ToListAsync(ct);

        int emailsSent = 0, emailsFailed = 0;
        foreach (var app in pendingMails)
        {
            if (await _mailer.SendConfirmationAsync(app))
            {
                app.ConfirmationEmailSentAt = DateTime.UtcNow;
                await _context.SaveChangesAsync(ct);
                emailsSent++;
            }
            else
            {
                emailsFailed++;
            }
        }

        return new SyncShopierOrdersResponse(ticketOrders, newOrders, approved, refunded, unmatched, emailsSent, emailsFailed);
    }

    // Siparişi bekleyen bir başvuruyla eşleştirir ve onaylar. Onaylanamazsa nedeni sipariş kaydına yazılır.
    private async Task<bool> MatchAsync(CodewaveShopierOrder row, CodewaveStudentDiscount? discount, CancellationToken ct)
    {
        CodewaveApplication? app;
        string method;
        bool alreadyPaid;

        if (discount is not null)
        {
            method = "product";
            app = await _context.CodewaveApplications
                .Where(a => a.CodewaveStudentDiscountId == discount.Id && a.Status == CodewaveApplicationStatus.Waiting)
                .OrderByDescending(a => a.Id)
                .FirstOrDefaultAsync(ct);
            alreadyPaid = app is null && await _context.CodewaveApplications
                .AnyAsync(a => a.CodewaveStudentDiscountId == discount.Id && a.Status == CodewaveApplicationStatus.Approved, ct);
        }
        else
        {
            method = "phone";
            var phoneKey = CodewaveRules.PhoneKey(row.BuyerPhone);
            app = phoneKey.Length >= 8
                ? await WaitingFullPrice(a => a.PhoneKey == phoneKey, ct)
                : null;

            var email = CodewaveRules.NormalizeEmail(row.BuyerEmail);
            if (app is null && email.Length > 0)
            {
                method = "email";
                app = await WaitingFullPrice(a => a.Email == email, ct);
            }

            alreadyPaid = app is null && await _context.CodewaveApplications.AnyAsync(a =>
                a.CodewaveStudentDiscountId == null
                && a.Status == CodewaveApplicationStatus.Approved
                && ((phoneKey.Length >= 8 && a.PhoneKey == phoneKey) || (email.Length > 0 && a.Email == email)), ct);
        }

        if (app is null)
            return Unmatched(row, alreadyPaid ? "duplicate" : "no_application");

        if (row.Quantity != 1)
            return Unmatched(row, "quantity");

        if (row.Total is not { } paid
            || Math.Round(paid, 2) != Math.Round(app.TotalPrice, 2)
            || !string.Equals(row.Currency, app.Currency, StringComparison.OrdinalIgnoreCase))
            return Unmatched(row, "amount_mismatch");

        app.Status = CodewaveApplicationStatus.Approved;
        app.ShopierOrderId = row.OrderId;
        app.PaidAmount = paid;
        app.PaidAt = row.OrderCreatedAt ?? DateTime.UtcNow;

        row.CodewaveApplicationId = app.Id;
        row.MatchMethod = method;
        row.UnmatchedReason = null;
        return true;
    }

    private Task<CodewaveApplication?> WaitingFullPrice(System.Linq.Expressions.Expression<Func<CodewaveApplication, bool>> filter, CancellationToken ct) =>
        _context.CodewaveApplications
            .Where(a => a.Status == CodewaveApplicationStatus.Waiting && a.CodewaveStudentDiscountId == null)
            .Where(filter)
            .OrderByDescending(a => a.Id)
            .FirstOrDefaultAsync(ct);

    private bool Unmatched(CodewaveShopierOrder row, string reason)
    {
        row.UnmatchedReason = reason;
        _logger.LogWarning("CODEWAVE Shopier siparişi {OrderId} eşleşmedi: {Reason}", row.OrderId, reason);
        return false;
    }

    private static string? Clip(string? value, int max) => value is { Length: > 0 } v && v.Length > max ? v[..max] : value;
}


// 3. ENDPOINT
public static class SyncShopierOrdersEndpoint
{
    public static void MapSyncShopierOrders(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/codewave/internal/shopier/sync", (SyncShopierOrdersHandler handler) => handler.HandleAsync())
            .AddEndpointFilter<CodewaveInternalKeyFilter>()
            .RequireRateLimiting("StrictPolicy")
            .ExcludeFromDescription();
    }
}
