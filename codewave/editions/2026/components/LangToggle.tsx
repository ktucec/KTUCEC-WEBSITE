'use client';
import { useLang } from './i18n/LanguageProvider';

// Tek dokunuşla TR ⇄ EN. Görünen etiket geçilecek dili gösterir.
export default function LangToggle({ className = '' }: { className?: string }) {
    const { lang, d, setLang } = useLang();
    const next = lang === 'TR' ? 'EN' : 'TR';
    return (
        <button type="button" className={`lang ${className}`} onClick={() => setLang(next)} aria-label={d.langSwitch} lang={next === 'EN' ? 'en' : 'tr'}>
            {next}
        </button>
    );
}
