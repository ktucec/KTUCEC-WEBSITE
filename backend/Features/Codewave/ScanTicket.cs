using System.Security.Claims;
using ktucec.Domain.Entities;
using ktucec.Domain.Enums;
using ktucec.Infrastructure.Database;
using ktucec.Shared.Common;
using ktucec.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ktucec.Features.Codewave;


// 1. REQUEST & RESPONSE
public record ScanTicketRequest(string? Code);
public record TicketScanEntry(DateTime ScannedAt, string ScannedBy, string Result);
public record ScanTicketResponse(
    string Status,            // valid | refunded
    string FullName,
    string AttendeeType,
    string Reference,
    string Phone,
    decimal? PaidAmount,
    string Currency,
    int ScanCount,            // bu okutma dahil
    List<TicketScanEntry> History);  // yeniden eskiye, bu okutma dahil (en fazla 20)


// 2. HANDLER
// Yönetim panelinde okutulan QR'ı işler. Aynı bilet birden çok kez okutulabilir: hiçbiri reddedilmez, her okutma
// kaydedilir ve yanıtta daha önceki girişler gösterilir. İade edilmiş bilet geçersiz (status "refunded") sayılır.
// Tanınmayan kod 404 döner ve kayıt açılmaz.
public class ScanTicketHandler
{
    private readonly KtucecDbContext _context;

    public ScanTicketHandler(KtucecDbContext context)
    {
        _context = context;
    }

    public async Task<IResult> HandleAsync(ScanTicketRequest request, HttpContext httpContext)
    {
        var code = CodewaveRules.NormalizeTicketCode(request.Code);
        if (!CodewaveRules.IsValidTicketCode(code))
            return CodewaveResults.Error(StatusCodes.Status404NotFound, "ticket_not_found", "Bilet bulunamadı.");

        var app = await _context.CodewaveApplications.FirstOrDefaultAsync(a => a.TicketCode == code);
        if (app is null || app.Status is not (CodewaveApplicationStatus.Approved or CodewaveApplicationStatus.Refunded))
            return CodewaveResults.Error(StatusCodes.Status404NotFound, "ticket_not_found", "Bilet bulunamadı.");

        int? userId = int.TryParse(httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;
        var scannedBy = userId is { } uid
            ? await _context.Users.Where(u => u.Id == uid).Select(u => u.NameSurname).FirstOrDefaultAsync()
            : null;

        var result = app.Status == CodewaveApplicationStatus.Approved ? "valid" : "refunded";
        _context.CodewaveTicketScans.Add(new CodewaveTicketScan
        {
            CodewaveApplicationId = app.Id,
            ScannedByUserId = userId,
            ScannedByName = Clip(string.IsNullOrWhiteSpace(scannedBy) ? "-" : scannedBy, 100),
            Result = result
        });
        await _context.SaveChangesAsync();

        var rows = await _context.CodewaveTicketScans.AsNoTracking()
            .Where(s => s.CodewaveApplicationId == app.Id)
            .OrderByDescending(s => s.CreatedAt).ThenByDescending(s => s.Id)
            .Select(s => new { s.CreatedAt, s.ScannedByName, s.Result })
            .ToListAsync();

        // Veritabanından gelen zaman UTC'dir ama türü belirsiz döner; "Z" ile işaretlenirse tarayıcı doğru yerel saati gösterir.
        var scans = rows
            .Select(s => new TicketScanEntry(DateTime.SpecifyKind(s.CreatedAt, DateTimeKind.Utc), s.ScannedByName, s.Result))
            .ToList();

        var data = new ScanTicketResponse(
            result,
            $"{app.FirstName} {app.LastName}".Trim(),
            app.AttendeeType.ToString(),
            $"CW26-{app.Id:D5}",
            app.Phone,
            app.PaidAmount,
            app.Currency,
            scans.Count,
            scans.Take(20).ToList());

        return Results.Ok(new ApiResult<ScanTicketResponse>(true, data, result == "valid" ? "Bilet geçerli." : "Bilet iade edilmiş."));
    }

    private static string Clip(string value, int max) => value.Length > max ? value[..max] : value;
}


// 3. ENDPOINT
public static class ScanTicketEndpoint
{
    public static void MapScanTicket(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/codewave/tickets/scan", (ScanTicketRequest request, ScanTicketHandler handler, HttpContext httpContext) =>
            handler.HandleAsync(request, httpContext))
        .RequireAuthorization("AdminAndManager")
        .RequireRateLimiting("FlexPolicy");
    }
}
