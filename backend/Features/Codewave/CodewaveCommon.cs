using ktucec.Infrastructure.Services.Codewave;
using ktucec.Shared.Models;

namespace ktucec.Features.Codewave;

// Hata yanıtlarında arayüzün dile göre metin seçebilmesi için makine tarafından okunur bir kod döner.
public record CodewaveErrorData(string Code, int? RetryAfterSeconds = null, int? AttemptsLeft = null);

// OTP gönderildiğinde dönen bilgi (kodun kendisi asla dönmez)
public record CodewaveOtpSentResponse(string Email, int ExpiresInSeconds, int ResendInSeconds);

public static class CodewaveResults
{
    // codewave.ktucec.com tarayıcıdan yalnızca bu yol altındaki uçları çağırır (Program.cs'te ayrı CORS politikası)
    public const string CorsPolicy = "AllowCodewave";
    public const string PublicPathPrefix = "/api/codewave/discount";

    public static IResult Error(int statusCode, string code, string message, int? retryAfter = null, int? attemptsLeft = null) =>
        Results.Json(
            new ApiResult<CodewaveErrorData>(false, new CodewaveErrorData(code, retryAfter, attemptsLeft), message),
            statusCode: statusCode);

    public static IResult FromSendResult(OtpSendResult result) => result.Outcome switch
    {
        OtpSendOutcome.Cooldown => Error(StatusCodes.Status429TooManyRequests, "otp_cooldown",
            "Yeni kod istemeden önce biraz bekleyin.", retryAfter: result.RetryAfterSeconds),
        OtpSendOutcome.LimitReached => Error(StatusCodes.Status429TooManyRequests, "otp_limit",
            "Bu adres için çok fazla kod istendi. Daha sonra tekrar deneyin.", retryAfter: result.RetryAfterSeconds),
        _ => Error(StatusCodes.Status502BadGateway, "mail_failed",
            "Doğrulama e-postası gönderilemedi. Lütfen biraz sonra tekrar deneyin."),
    };

    // available: kullanılabilir · redeemed: Shopier'deki tek stoklu indirimli ürün satıldı
    public static string StatusFromStock(int? stockQuantity) => stockQuantity is <= 0 ? "redeemed" : "available";

    public static string? ClientIp(HttpContext httpContext)
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString();
        return ip is { Length: > 45 } ? ip[..45] : ip;
    }
}
