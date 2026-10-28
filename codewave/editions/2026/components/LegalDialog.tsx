'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLang } from './i18n/LanguageProvider';

export type LegalKind = 'openConsent' | 'privacy';

// Metindeki **kalın** işaretli kısımlar kalın yazılır.
const rich = (text: string) => text.split('**').map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));

// Açık rıza ve aydınlatma metinlerini küçük puntolu, sade bir pencerede gösterir.
// Bilet penceresinin (TicketDialog) üstünde açılır; Escape yalnızca bu pencereyi kapatır.
export default function LegalDialog({ kind, onClose }: { kind: LegalKind; onClose: () => void }) {
    const { d } = useLang();
    const text = d.legal[kind];
    const title = useRef<HTMLHeadingElement>(null);
    const close = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const t = window.setTimeout(() => title.current?.focus(), 30);
        // Yakalama aşamasında dinlenir: alttaki bilet penceresi Escape'i ve Tab'ı görmez.
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopImmediatePropagation();
                e.preventDefault();
                onClose();
            } else if (e.key === 'Tab') {
                e.stopImmediatePropagation();
                e.preventDefault();
                close.current?.focus();
            }
        };
        window.addEventListener('keydown', onKey, true);
        return () => {
            window.clearTimeout(t);
            window.removeEventListener('keydown', onKey, true);
        };
    }, [onClose]);

    return createPortal(
        <div className="legal-wrap" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="legal-panel" role="dialog" aria-modal="true" aria-labelledby="legal-title">
                <div className="legal-head">
                    <h2 id="legal-title" ref={title} tabIndex={-1}>
                        {text.title}
                    </h2>
                    <button
                        ref={close}
                        type="button"
                        onClick={onClose}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--line-hi)] text-mute transition-colors hover:text-ink"
                        aria-label={d.legal.close}
                    >
                        <X size={14} aria-hidden="true" />
                    </button>
                </div>
                <div className="legal-body">
                    {text.body.map((block, i) =>
                        block.heading ? (
                            <h3 key={i}>{block.heading}</h3>
                        ) : block.items ? (
                            <ul key={i}>
                                {block.items.map((item) => (
                                    <li key={item}>{rich(item)}</li>
                                ))}
                            </ul>
                        ) : (
                            <p key={i}>{block.text && rich(block.text)}</p>
                        ),
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}
