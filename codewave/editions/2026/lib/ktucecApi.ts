// ktucec.com backend'i ile sunucudan sunucuya iletişim. YALNIZCA sunucu rotalarından import edilir:
// iç anahtar (CODEWAVE_INTERNAL_KEY) tarayıcıya asla gitmez.
//
// Uç (backend/Features/Codewave/CreateCodewaveApplication.cs):
//  - GET /api/codewave/internal/tickets/{kod} (GetPublicTicket.cs) → QR bilet sayfasının verisi (maskeli ad, durum)
//  - POST /api/codewave/internal/applications → başvuruyu "Waiting" olarak kaydeder; indirim kodu varsa öğrenciye
//    özel tek stoklu Shopier ürününü (gerekirse açarak) döner
import type { AttendeeType } from './registration';

export const INTERNAL_KEY_HEADER = 'X-Codewave-Key';

type BackendConfig = { baseUrl: string; key: string };

// Sunucu tarafı adres önceliklidir; yoksa tarayıcının kullandığı herkese açık adres kullanılır.
export function getBackendConfig(): BackendConfig | null {
    const baseUrl = (process.env.KTUCEC_API_URL || process.env.NEXT_PUBLIC_KTUCEC_API_URL || '').trim().replace(/\/+$/, '');
    const key = process.env.CODEWAVE_INTERNAL_KEY?.trim();
    if (!baseUrl || !key || key.length < 32) return null;
    return { baseUrl, key };
}

export const isBackendConfigured = () => getBackendConfig() !== null;

type Ok<T> = { ok: true; data: T };
type Fail = { ok: false; status: number; code: string };

async function post<T>(config: BackendConfig, path: string, body: unknown): Promise<Ok<T> | Fail> {
    try {
        const res = await fetch(`${config.baseUrl}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', [INTERNAL_KEY_HEADER]: config.key },
            body: JSON.stringify(body),
            cache: 'no-store',
            signal: AbortSignal.timeout(10_000),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.isSuccess) return { ok: true, data: json.data as T };
        const code = typeof json?.data?.code === 'string' ? json.data.code : 'unknown';
        return { ok: false, status: res.status, code };
    } catch {
        return { ok: false, status: 0, code: 'unreachable' };
    }
}

async function get<T>(config: BackendConfig, path: string): Promise<Ok<T> | Fail> {
    try {
        const res = await fetch(`${config.baseUrl}${path}`, {
            headers: { [INTERNAL_KEY_HEADER]: config.key },
            cache: 'no-store',
            signal: AbortSignal.timeout(10_000),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.isSuccess) return { ok: true, data: json.data as T };
        const code = typeof json?.data?.code === 'string' ? json.data.code : 'unknown';
        return { ok: false, status: res.status, code };
    } catch {
        return { ok: false, status: 0, code: 'unreachable' };
    }
}

export type PublicTicket = {
    status: 'valid' | 'refunded';
    maskedName: string;
    attendeeType: 'Student' | 'Professional' | 'Other';
    reference: string;
};

// Herkese açık bilet sayfası için: bilet kodu → maskeli ad ve durum. Kod yoksa { ok:false, status:404 }.
export const getPublicTicket = (config: BackendConfig, code: string) =>
    get<PublicTicket>(config, `/api/codewave/internal/tickets/${encodeURIComponent(code)}`);

export type CreateApplicationInput = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    attendeeType: AttendeeType;
    language: 'TR' | 'EN';
    listPrice: number;
    discountAmount: number;
    totalPrice: number;
    currency: string;
    discountCode?: string;
    privacyNoticeAccepted: boolean;
    explicitConsentAccepted: boolean;
};

// redirectUrl: indirimli bilette öğrenciye özel Shopier ürünü; indirimsizde null.
export const createApplication = (config: BackendConfig, input: CreateApplicationInput) =>
    post<{ applicationId: number; redirectUrl: string | null }>(config, '/api/codewave/internal/applications', input);
