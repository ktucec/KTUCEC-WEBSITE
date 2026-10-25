'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DISCOUNT_CODE_RE, isEduTrEmail, normalizeEmail, quote, type Quote } from '@/editions/2026/lib/discount';

// Kazanılan öğrenci indirimi bu cihazda saklanır: sayfa yenilense ya da Shopier'den geri dönülse de
// fiyat indirimli kalır. Kodun gerçekten kullanılabilir olduğunu ödeme adımında backend doğrular.
const STORAGE_KEY = 'cw26-discount';

export type AppliedDiscount = { email: string; code: string };

type Ctx = {
    discount: AppliedDiscount | null;
    amount: Quote;
    apply: (d: AppliedDiscount) => void;
    clear: () => void;
};

const DiscountContext = createContext<Ctx | null>(null);

function read(): AppliedDiscount | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const v = JSON.parse(raw);
        if (typeof v?.email === 'string' && typeof v?.code === 'string' && isEduTrEmail(v.email) && DISCOUNT_CODE_RE.test(v.code)) {
            return { email: normalizeEmail(v.email), code: v.code };
        }
    } catch {
        // Bozuk ya da erişilemeyen kayıt yok sayılır.
    }
    return null;
}

// Sunucu her zaman indirimsiz fiyatı üretir; kayıtlı indirim hidrasyondan sonra uygulanır.
export function DiscountProvider({ children }: { children: ReactNode }) {
    const [discount, setDiscount] = useState<AppliedDiscount | null>(null);

    useEffect(() => {
        setDiscount(read());
        // Başka sekmede kaldırılan/eklenen indirim burada da görünsün.
        const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && setDiscount(read());
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const apply = useCallback((d: AppliedDiscount) => {
        const next = { email: normalizeEmail(d.email), code: d.code };
        setDiscount(next);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
            // Saklanamasa da bu oturumda geçerlidir.
        }
    }, []);

    const clear = useCallback(() => {
        setDiscount(null);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // Depolama yoksa yapılacak bir şey yok.
        }
    }, []);

    const value = useMemo(() => ({ discount, amount: quote(discount !== null), apply, clear }), [discount, apply, clear]);
    return <DiscountContext.Provider value={value}>{children}</DiscountContext.Provider>;
}

export function useDiscount() {
    const ctx = useContext(DiscountContext);
    if (!ctx) throw new Error('useDiscount must be used within DiscountProvider');
    return ctx;
}
