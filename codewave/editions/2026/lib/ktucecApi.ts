// ktucec.com backend'i ile sunucudan sunucuya iletişim. YALNIZCA sunucu rotalarından import edilir:
// iç anahtar (CODEWAVE_INTERNAL_KEY) tarayıcıya asla gitmez.
//
// Uçlar (backend/Features/Codewave):
//  - POST /api/codewave/internal/orders                     → başvuruyu "Pending" kaydeder, indirim kodunu siparişe ayırır
//  - POST /api/codewave/internal/orders/{orderId}/complete  → Shopier sonucu: Paid / Failed
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

export type CreateOrderInput = {
    orderId: string;
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
};

export const createOrder = (config: BackendConfig, input: CreateOrderInput) =>
    post<{ orderId: string; totalPrice: number }>(config, '/api/codewave/internal/orders', input);

export const completeOrder = (config: BackendConfig, orderId: string, result: { paymentId: string; success: boolean }) =>
    post<{ orderId: string; status: string }>(config, `/api/codewave/internal/orders/${encodeURIComponent(orderId)}/complete`, result);
