import { apiFetch } from "@/lib/api";

// CODEWAVE bilet QR'ı okut (yönetim paneli). Kod ya da QR'daki tam bağlantı gönderilebilir.
// Bilet bulunamazsa 404 ve "Bilet bulunamadı." mesajıyla ApiError fırlatır. Her başarılı okutma kaydedilir.
export function scanTicket(code) {
    return apiFetch("/api/codewave/tickets/scan", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ code }),
    });
}
