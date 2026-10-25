using ktucec.Shared.Models;

namespace ktucec.Infrastructure.Services.Codewave;

// Yalnızca codewave sitesinin sunucusunun çağırabileceği uçlar için: "X-Codewave-Key" başlığı
// appsettings'teki Codewave:InternalApiKey ile eşleşmezse istek işleyiciye ulaşmaz.
public class CodewaveInternalKeyFilter : IEndpointFilter
{
    public const string HeaderName = "X-Codewave-Key";

    private readonly CodewaveSecurityService _security;

    public CodewaveInternalKeyFilter(CodewaveSecurityService security)
    {
        _security = security;
    }

    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var provided = context.HttpContext.Request.Headers[HeaderName].ToString();
        if (!_security.IsValidInternalKey(provided))
            return Results.Json(new ApiResult(false, "Yetkisiz istek."), statusCode: StatusCodes.Status401Unauthorized);

        return await next(context);
    }
}
