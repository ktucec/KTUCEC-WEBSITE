// CODEWAVE 2026 öğrenci indirimi: tarayıcıdaki modal ve sunucudaki ödeme rotası aynı kuralları kullanır.
// Tutar her zaman sunucuda buradan hesaplanır; tarayıcıdan gelen fiyata güvenilmez.
import { STUDENT_DISCOUNT, TICKET } from '@/editions/2026/event';

// Backend'in ürettiği biçim: CW26-XXXX-XXXX
export const DISCOUNT_CODE_RE = /^CW26-[0-9A-Z]{4}-[0-9A-Z]{4}$/;
export const STUDENT_NO_RE = /^\d{2,15}$/;
export const OTP_RE = /^\d{6}$/;

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export const normalizeEmail = (v: string) => v.trim().toLowerCase();
export const normalizeDiscountCode = (v: string) => v.trim().toUpperCase();

// Yalnızca *.edu.tr uzantılı adresler (ör. 123456@ogr.ktu.edu.tr). "ad@edu.tr" gibi alan adı olmayanlar geçmez.
export function isEduTrEmail(value: string) {
    const email = normalizeEmail(value);
    if (email.length < 6 || email.length > 254 || !EMAIL_RE.test(email)) return false;
    const host = email.slice(email.lastIndexOf('@') + 1);
    return host.endsWith('.edu.tr') && host.length > '.edu.tr'.length;
}

export type Quote = { list: number; discount: number; total: number };

const round2 = (n: number) => Math.round(n * 100) / 100;

// İndirimli ya da indirimsiz tutar. İndirim fiyatı sıfıra indiremez: Shopier sıfır tutarlı ödeme almaz.
export function quote(discounted: boolean): Quote {
    const list = TICKET.price;
    if (!discounted) return { list, discount: 0, total: list };
    const raw = STUDENT_DISCOUNT.type === 'percent' ? (list * STUDENT_DISCOUNT.value) / 100 : STUDENT_DISCOUNT.value;
    const discount = round2(Math.min(Math.max(raw, 0), list - 1));
    return { list, discount, total: round2(list - discount) };
}
