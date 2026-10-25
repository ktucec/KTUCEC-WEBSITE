'use client';
import { formatAmount } from '@/editions/2026/i18n';
import { useDiscount } from './discount/DiscountProvider';
import { useLang } from './i18n/LanguageProvider';

// Fiyat event.ts'deki TICKET.price değerinden, seçili dilin biçimiyle yazılır. Öğrenci indirimi
// kazanılmışsa indirimli tutar gösterilir (asıl tutarı ödeme adımında sunucu yeniden hesaplar).
export default function Price() {
    const { lang } = useLang();
    const { amount } = useDiscount();
    return <>{formatAmount(lang, amount.total)}</>;
}
