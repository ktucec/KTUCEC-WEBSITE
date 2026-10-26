using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace ktucec.Infrastructure.Services.Shopier;

public record ShopierProduct(string Id, string? Url, int? StockQuantity);

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
