'use client';
import { formatPrice } from '@/editions/2026/i18n';
import { useLang } from './i18n/LanguageProvider';

// Fiyat event.ts'deki TICKET.price değerinden, seçili dilin biçimiyle yazılır.
export default function Price() {
    const { lang } = useLang();
    return <>{formatPrice(lang)}</>;
}
