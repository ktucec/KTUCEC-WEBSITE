using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Infrastructure.Services.Codewave;
using ktucec.Shared.Common;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Codewave;


// 1. RESPONSE
// Herkese açık bilet sayfası için: ad maskelidir, telefon/e-posta/tutar yoktur.
public record PublicTicketResponse(string Status, string MaskedName, string AttendeeType, string Reference);


// 2. HANDLER
// QR'daki bağlantı (codewave.ktucec.com/bilet/KOD) açıldığında codewave sunucusu bu uca iç anahtarla sorar.
// Bilet yoksa 404; iade edilmişse status "refunded" döner.
public class GetPublicTicketHandler
{
    private readonly KtucecDbContext _context;

    public GetPublicTicketHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<IResult> HandleAsync(string code)
    {
        code = CodewaveRules.NormalizeTicketCode(code);
        if (!CodewaveRules.IsValidTicketCode(code))
            return CodewaveResults.Error(StatusCodes.Status404NotFound, "ticket_not_found", "Bilet bulunamadı.");

        var app = await _context.CodewaveApplications.AsNoTracking()
            .Where(a => a.TicketCode == code)
            .Select(a => new { a.Id, a.FirstName, a.LastName, a.AttendeeType, a.Status })
            .FirstOrDefaultAsync();

        if (app is null || app.Status is not (CodewaveApplicationStatus.Approved or CodewaveApplicationStatus.Refunded))
            return CodewaveResults.Error(StatusCodes.Status404NotFound, "ticket_not_found", "Bilet bulunamadı.");

        var data = new PublicTicketResponse(
            app.Status == CodewaveApplicationStatus.Approved ? "valid" : "refunded",
            CodewaveRules.MaskName(app.FirstName, app.LastName),
            app.AttendeeType.ToString(),
            $"CW26-{app.Id:D5}");

        return Results.Ok(new ApiResult<PublicTicketResponse>(true, data, "Bilet."));
    }
}


// 3. ENDPOINT
public static class GetPublicTicketEndpoint
{
    public static void MapGetPublicTicket(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/codewave/internal/tickets/{code}", (string code, GetPublicTicketHandler handler) => handler.HandleAsync(code))
            .AddEndpointFilter<CodewaveInternalKeyFilter>()
            .RequireRateLimiting("FlexPolicy")
            .ExcludeFromDescription();
    }
}
