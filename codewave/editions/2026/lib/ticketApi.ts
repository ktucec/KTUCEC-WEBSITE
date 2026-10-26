// "Biletimi bul" sayfasının backend çağrıları (CORS: yalnızca codewave.ktucec.com, çerezsiz).
// Güvenlik, bilet alırken yazılan e-postaya giden tek kullanımlık kod ve backend'deki sınırlarla sağlanır.
import type { ApiFail, OtpSent } from './discountApi';

const API_URL = (process.env.NEXT_PUBLIC_KTUCEC_API_URL || '').replace(/\/+$/, '');

export type LookupTicket = { ticketCode: string; fullName: string; attendeeType: 'Student' | 'Professional' | 'Other'; reference: string };
export type LookupResult = { email: string; tickets: LookupTicket[] };

type ApiOk<T> = { ok: true; data: T };

async function post<T>(path: string, body: unknown): Promise<ApiOk<T> | ApiFail> {
    if (!API_URL) return { ok: false, code: 'unknown' };
    try {
        const res = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'omit',
            cache: 'no-store',
            signal: AbortSignal.timeout(15_000),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.isSuccess) return { ok: true, data: json.data as T };
        const code = typeof json?.data?.code === 'string' ? json.data.code : res.status === 429 ? 'rate_limited' : 'unknown';
        return {
            ok: false,
            code,
            retryAfter: typeof json?.data?.retryAfterSeconds === 'number' ? json.data.retryAfterSeconds : undefined,
            attemptsLeft: typeof json?.data?.attemptsLeft === 'number' ? json.data.attemptsLeft : undefined,
        };
    } catch {
        return { ok: false, code: 'network' };
    }
}

export const requestTicketCode = (email: string) => post<OtpSent>('/api/codewave/ticket-lookup/request', { email });

export const verifyTicketCode = (email: string, code: string) => post<LookupResult>('/api/codewave/ticket-lookup/verify', { email, code });
