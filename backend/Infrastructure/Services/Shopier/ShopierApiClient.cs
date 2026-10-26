using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace ktucec.Infrastructure.Services.Shopier;

public record ShopierProduct(string Id, string? Url, int? StockQuantity);

public record ShopierOrderLine(string ProductId, string? Title, int Quantity, decimal? Total);

public record ShopierOrderRefund(string? Type, string? Status, DateTimeOffset? RefundedAt);

// Siparişin bizim için gerekli alanları. Alıcı bilgisi shippingInfo'dan, yoksa billingInfo'dan okunur.
public record ShopierOrder(
    string Id,
    string? PaymentStatus,
    DateTimeOffset? CreatedAt,
    string? Currency,
    decimal? Total,
    string? BuyerFirstName,
    string? BuyerLastName,
    string? BuyerEmail,
    string? BuyerPhone,
    IReadOnlyList<ShopierOrderLine> LineItems,
    IReadOnlyList<ShopierOrderRefund> Refunds);

// Shopier REST API v1 (https://api.shopier.com/v1), "Kişisel Erişim Anahtarı" (PAT) ile.
// Anahtar Shopier panelinde Hesap Yönetimi > Kişisel Erişim Anahtarı'ndan alınır (iki adımlı doğrulama gerekir)
// ve appsettings'te Shopier:PersonalAccessToken olarak durur (PAT'te kapsam seçimi yoktur; hesaba tam erişim sağlar).
// Ürün ayarları appsettings'ten gelir: Shopier:ProductImageUrl (herkese açık jpg/jpeg/png/bmp adresi, zorunlu),
// Shopier:ProductDescription, Shopier:HideProductFromShop (true ise ürün dükkanda listelenmez, yalnızca bağlantıyla açılır).
public class ShopierApiClient
{
    private const string BaseUrl = "https://api.shopier.com/v1/";

    private readonly HttpClient _http;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ShopierApiClient> _logger;

    public ShopierApiClient(HttpClient http, IConfiguration configuration, ILogger<ShopierApiClient> logger)
    {
        _http = http;
        _http.BaseAddress = new Uri(BaseUrl);
        _http.Timeout = TimeSpan.FromSeconds(20);
        _configuration = configuration;
        _logger = logger;
    }

    private string? Token => _configuration["Shopier:PersonalAccessToken"]?.Trim() is { Length: > 0 } t ? t : null;

    public bool IsConfigured => Token is not null;

    // Dijital, kargosuz, tek stoklu bir ürün açar. Başarısızlıkta null döner (ayrıntı loglanır).
    public async Task<ShopierProduct?> CreateDigitalProductAsync(string title, decimal price, string currency, int stockQuantity, CancellationToken ct = default)
    {
        // Shopier ürün için en az bir görsel ister (media zorunlu, en fazla 5; herkese açık URL).
        var imageUrl = _configuration["Shopier:ProductImageUrl"]?.Trim();
        if (string.IsNullOrEmpty(imageUrl))
        {
            _logger.LogError("Shopier:ProductImageUrl ayarı boş; Shopier ürünü için görsel gerekli.");
            return null;
        }

        var description = _configuration["Shopier:ProductDescription"]?.Trim();
        if (string.IsNullOrEmpty(description))
            description = "KTÜCEC CODEWAVE 2026 öğrenci bileti.";

        // Varsayılan: gizli. Ürün dükkanda listelenmez, yalnızca bağlantıyı bilen görür.
        var hide = !bool.TryParse(_configuration["Shopier:HideProductFromShop"], out var h) || h;

        var body = new
        {
            title,
            description,
            type = "digital",
            media = new[] { new { type = "image", url = imageUrl, placement = 1 } },
            priceData = new
            {
                currency,
                price = price.ToString("0.00", CultureInfo.InvariantCulture)
            },
            stockQuantity,
            shippingPayer = "sellerPays",
            customListing = hide
        };

        using var request = CreateRequest(HttpMethod.Post, "products");
        if (request is null) return null;
        request.Content = JsonContent.Create(body);

        var product = await SendAsync(request, ct);

        // Yanıtta bağlantı yoksa ürün bir kez daha okunur.
        if (product is not null && string.IsNullOrEmpty(product.Url))
            product = await GetProductAsync(product.Id, ct) ?? product;

        return product;
    }

    public async Task<ShopierProduct?> GetProductAsync(string id, CancellationToken ct = default)
    {
        using var request = CreateRequest(HttpMethod.Get, $"products/{Uri.EscapeDataString(id)}");
        if (request is null) return null;
        return await SendAsync(request, ct);
    }

    // GET /orders: sayfa sayfa (en fazla 50'şer, eskiden yeniye) tüm siparişleri okur. Başarısızlıkta null döner.
    // dateStart verilmezse Shopier son 60 günü döner. refundType: none · partial · full
    public async Task<IReadOnlyList<ShopierOrder>?> ListOrdersAsync(DateTimeOffset? dateStart, string? refundType, CancellationToken ct = default)
    {
        const int pageSize = 50;
        const int maxPages = 40;
        var orders = new List<ShopierOrder>();

        for (var page = 1; page <= maxPages; page++)
        {
            var query = new List<string> { $"limit={pageSize}", $"page={page}", "sort=dateAsc" };
            if (dateStart is { } start) query.Add("dateStart=" + Uri.EscapeDataString(FormatDate(start)));
            if (!string.IsNullOrEmpty(refundType)) query.Add("refundType=" + Uri.EscapeDataString(refundType));

            using var request = CreateRequest(HttpMethod.Get, "orders?" + string.Join('&', query));
            if (request is null) return null;

            var items = await SendForListAsync(request, ct);
            if (items is null) return null;

            foreach (var item in items)
            {
                var order = ParseOrder(item);
                if (order is not null) orders.Add(order);
            }

            if (items.Count < pageSize) break;
        }

        return orders;
    }

    // Shopier tarih biçimi: yyyy-MM-ddTHH:mm:ss+0300 (saat diliminde iki nokta yok)
    private static string FormatDate(DateTimeOffset value) =>
        value.ToOffset(TimeSpan.FromHours(3)).ToString("yyyy-MM-dd'T'HH:mm:ss", CultureInfo.InvariantCulture) + "+0300";

    private static DateTimeOffset? ParseDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var s = value.Trim();
        // "+0300" → "+03:00" (standart ayrıştırıcı iki noktalı biçimi bekler)
        if (s.Length > 5 && (s[^5] == '+' || s[^5] == '-') && s[^4..].All(char.IsAsciiDigit))
            s = s[..^2] + ":" + s[^2..];
        return DateTimeOffset.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var d) ? d : null;
    }

    private static ShopierOrder? ParseOrder(JsonElement e)
    {
        if (e.ValueKind != JsonValueKind.Object) return null;
        var id = ReadString(e, "id");
        if (string.IsNullOrEmpty(id)) return null;

        e.TryGetProperty("shippingInfo", out var shipping);
        e.TryGetProperty("billingInfo", out var billing);
        string? Buyer(string name) =>
            (shipping.ValueKind == JsonValueKind.Object ? ReadString(shipping, name) : null) is { Length: > 0 } v
                ? v
                : billing.ValueKind == JsonValueKind.Object ? ReadString(billing, name) : null;

        var lines = new List<ShopierOrderLine>();
        if (e.TryGetProperty("lineItems", out var items) && items.ValueKind == JsonValueKind.Array)
        {
            foreach (var li in items.EnumerateArray())
            {
                if (li.ValueKind != JsonValueKind.Object) continue;
                var productId = ReadString(li, "productId");
                if (string.IsNullOrEmpty(productId)) continue;
                var quantity = li.TryGetProperty("quantity", out var q) && q.ValueKind == JsonValueKind.Number && q.TryGetInt32(out var n) ? n : 1;
                lines.Add(new ShopierOrderLine(productId, ReadString(li, "title"), quantity, ReadDecimal(li, "total")));
            }
        }

        var refunds = new List<ShopierOrderRefund>();
        if (e.TryGetProperty("refunds", out var rs) && rs.ValueKind == JsonValueKind.Array)
        {
            foreach (var r in rs.EnumerateArray())
            {
                if (r.ValueKind != JsonValueKind.Object) continue;
                refunds.Add(new ShopierOrderRefund(ReadString(r, "type"), ReadString(r, "status"),
                    ParseDate(ReadString(r, "dateRefunded")) ?? ParseDate(ReadString(r, "dateCreated"))));
            }
        }

        decimal? total = e.TryGetProperty("totals", out var totals) && totals.ValueKind == JsonValueKind.Object
            ? ReadDecimal(totals, "total")
            : null;

        return new ShopierOrder(
            id,
            ReadString(e, "paymentStatus"),
            ParseDate(ReadString(e, "dateCreated")),
            ReadString(e, "currency"),
            total,
            Buyer("firstName"),
            Buyer("lastName"),
            Buyer("email"),
            Buyer("phone"),
            lines,
            refunds);
    }

    // Liste yanıtı: doğrudan dizi ya da { "data": [...] }
    private async Task<List<JsonElement>?> SendForListAsync(HttpRequestMessage request, CancellationToken ct)
    {
        try
        {
            using var response = await _http.SendAsync(request, ct);
            var text = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Shopier API {Method} {Path} başarısız: {Status} {Body}",
                    request.Method, request.RequestUri, (int)response.StatusCode, text.Length > 500 ? text[..500] : text);
                return null;
            }

            using var doc = JsonDocument.Parse(text);
            var root = doc.RootElement;
            if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var data))
                root = data;

            if (root.ValueKind != JsonValueKind.Array)
            {
                _logger.LogError("Shopier API liste yanıtı beklenen biçimde değil: {Body}", text.Length > 500 ? text[..500] : text);
                return null;
            }

            return root.EnumerateArray().Select(x => x.Clone()).ToList();
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
        {
            _logger.LogError(ex, "Shopier API isteği başarısız: {Method} {Path}", request.Method, request.RequestUri);
            return null;
        }
    }

    private static decimal? ReadDecimal(JsonElement element, string name)
    {
        if (!element.TryGetProperty(name, out var v)) return null;
        if (v.ValueKind == JsonValueKind.Number && v.TryGetDecimal(out var n)) return n;
        if (v.ValueKind == JsonValueKind.String
            && decimal.TryParse(v.GetString(), NumberStyles.Number, CultureInfo.InvariantCulture, out var s)) return s;
        return null;
    }

    private HttpRequestMessage? CreateRequest(HttpMethod method, string path)
    {
        var token = Token;
        if (token is null)
        {
            _logger.LogError("Shopier:PersonalAccessToken ayarı boş; Shopier API çağrılamadı.");
            return null;
        }

        var request = new HttpRequestMessage(method, path);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        return request;
    }

    private async Task<ShopierProduct?> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        try
        {
            using var response = await _http.SendAsync(request, ct);
            var text = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Shopier API {Method} {Path} başarısız: {Status} {Body}",
                    request.Method, request.RequestUri, (int)response.StatusCode, text.Length > 500 ? text[..500] : text);
                return null;
            }

            using var doc = JsonDocument.Parse(text);
            var root = doc.RootElement;

            // Bazı yanıtlar ürünü bir "data" alanı içinde döndürebilir.
            if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Object)
                root = data;

            var id = ReadString(root, "id");
            if (string.IsNullOrEmpty(id))
            {
                _logger.LogError("Shopier API yanıtında ürün kimliği yok: {Body}", text.Length > 500 ? text[..500] : text);
                return null;
            }

            int? stock = root.TryGetProperty("stockQuantity", out var s) && s.ValueKind == JsonValueKind.Number && s.TryGetInt32(out var n) ? n : null;
            return new ShopierProduct(id, ReadString(root, "url"), stock);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
        {
            _logger.LogError(ex, "Shopier API isteği başarısız: {Method} {Path}", request.Method, request.RequestUri);
            return null;
        }
    }

    private static string? ReadString(JsonElement element, string name) =>
        element.TryGetProperty(name, out var v) ? v.ValueKind switch
        {
            JsonValueKind.String => v.GetString(),
            JsonValueKind.Number => v.GetRawText(),
            _ => null
        } : null;
}
