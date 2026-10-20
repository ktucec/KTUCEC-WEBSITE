'use client';
import { useEffect, useRef, useState, type MouseEvent, type CSSProperties } from 'react';
import { EDITIONS, type EditionId } from './editions';
import './edition-switcher.css';

// Her edisyonun root layout'unda kullanılan, tema bağımsız üst geçiş çubuğu.
// Renk için edisyonun tanımlayabileceği değişkenler: --ed-accent, --ed-accent-2.
export default function EditionSwitcher({ current }: { current: EditionId }) {
    const [target, setTarget] = useState<EditionId>(current);
    const [condensed, setCondensed] = useState(false);
    const leaving = useRef(false);

    useEffect(() => {
        const onScroll = () => setCondensed(window.scrollY > 70);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const go = (e: MouseEvent<HTMLAnchorElement>, id: EditionId, href: string) => {
        if (id === current || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        if (leaving.current) return;
        leaving.current = true;
        setTarget(id); // seçici kayarak hedefe gider, ardından sayfa geçişi başlar
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.setTimeout(() => window.location.assign(href), reduce ? 0 : 340);
    };

    const index = Math.max(0, EDITIONS.findIndex((ed) => ed.id === target));

    return (
        <nav
            className={`ed-switch${condensed ? ' is-condensed' : ''}`}
            aria-label="CODEWAVE edisyonları"
            style={{ '--i': index, '--n': EDITIONS.length } as CSSProperties}
        >
            <span className="ed-brand" aria-hidden="true">
                <i />
                <b>CODEWAVE</b>
            </span>
            <div className="ed-seg">
                <span className="ed-thumb" aria-hidden="true" />
                {EDITIONS.map((ed) => (
                    <a
                        key={ed.id}
                        href={ed.href}
                        className={ed.id === target ? 'is-active' : ''}
                        aria-current={ed.id === current ? 'page' : undefined}
                        onClick={(e) => go(e, ed.id, ed.href)}
                    >
                        {ed.label}
                        {ed.latest && <em className="ed-new" aria-label="güncel" />}
                    </a>
                ))}
            </div>
        </nav>
    );
}
