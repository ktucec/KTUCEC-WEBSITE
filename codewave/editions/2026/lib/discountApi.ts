// Tarayıcıdan ktucec.com backend'inin öğrenci indirimi uçlarına giden istekler (CORS: yalnızca codewave.ktucec.com).
// Bu uçlar kimlik doğrulaması istemez; güvenlik e-postaya giden tek kullanımlık kod ve backend'deki sınırlarla sağlanır.

const API_URL = (process.env.NEXT_PUBLIC_KTUCEC_API_URL || '').replace(/\/+$/, '');

export const isDiscountApiConfigured = () => API_URL.length > 0;

export type DiscountStatus = 'available' | 'redeemed';
export type OtpSent = { email: string; expiresInSeconds: number; resendInSeconds: number };
export type Verified = { email: string; discountCode: string; status: DiscountStatus };

export type ApiFail = { ok: false; code: string; retryAfter?: number; attemptsLeft?: number };
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
        // Sunucunun IP sınırı (429) gövdesiz döner.
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

export const claimDiscount = (email: string, studentNumber: string) =>
    post<OtpSent>('/api/codewave/discount/claim', { email, studentNumber });

export const lookupDiscount = (email: string) => post<OtpSent>('/api/codewave/discount/lookup', { email });

export const verifyDiscount = (email: string, code: string) => post<Verified>('/api/codewave/discount/verify', { email, code });
