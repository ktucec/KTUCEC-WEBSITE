// QR bilet kodu (backend CodewaveRules.TicketCodeRegex ile aynı): 20 karakter, 0/O ve 1/I/L yok.
export const TICKET_CODE_RE = /^[2-9A-HJKMNP-Z]{20}$/;

export const ticketUrl = (siteUrl: string, code: string) => `${siteUrl}/bilet/${code}`;
export const ticketQrSrc = (code: string) => `/bilet/${code}/qr.png`;
