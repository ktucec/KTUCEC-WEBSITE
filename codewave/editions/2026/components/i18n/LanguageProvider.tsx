'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DICT, LANG_STORAGE_KEY, type Dict, type Lang } from '@/editions/2026/i18n';

type Ctx = { lang: Lang; d: Dict; setLang: (l: Lang) => void };

const LanguageContext = createContext<Ctx | null>(null);

// Sunucu her zaman TR üretir; kayıtlı tercih (2025 ile ortak anahtar) hidrasyondan sonra uygulanır.
export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('TR');

    useEffect(() => {
        try {
            const saved = localStorage.getItem(LANG_STORAGE_KEY);
            if (saved === 'EN') setLangState('EN');
        } catch {
            // Gizli sekme vb. durumlarda depolama erişilemeyebilir; TR ile devam edilir.
        }
    }, []);

    useEffect(() => {
        document.documentElement.lang = lang === 'TR' ? 'tr' : 'en';
    }, [lang]);

    const setLang = (l: Lang) => {
        setLangState(l);
        try {
            localStorage.setItem(LANG_STORAGE_KEY, l);
        } catch {
            // Tercih kaydedilemese de dil bu oturumda değişir.
        }
    };

    return <LanguageContext.Provider value={{ lang, d: DICT[lang], setLang }}>{children}</LanguageContext.Provider>;
}

export function useLang() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLang must be used within LanguageProvider');
    return ctx;
}

type StringKey = { [K in keyof Dict]: Dict[K] extends string ? K : never }[keyof Dict];

// Sunucu bileşenlerinin içinde kullanılan metin yaprağı: sayfanın geri kalanı sunucuda kalır.
export function T({ k }: { k: StringKey }) {
    const { d } = useLang();
    return <>{d[k]}</>;
}
