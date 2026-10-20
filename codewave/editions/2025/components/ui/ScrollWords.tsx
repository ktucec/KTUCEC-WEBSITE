'use client';
import { useEffect, useRef, type CSSProperties } from 'react';

// Paragraf kaydırıldıkça kelimeler sırayla aydınlanır.
export default function ScrollWords({ text, className = '' }: { text: string; className?: string }) {
    const ref = useRef<HTMLParagraphElement>(null);
    const words = text.split(' ');

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) {
            el.style.setProperty('--p', '2');
            return;
        }
        let raf = 0;
        const update = () => {
            raf = 0;
            const r = el.getBoundingClientRect();
            const vh = window.innerHeight;
            const p = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
            el.style.setProperty('--p', String(Math.min(Math.max(p, 0), 1.2)));
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [text]);

    return (
        <p ref={ref} className={`scroll-words ${className}`} aria-label={text}>
            {words.map((w, i) => (
                <span key={i} aria-hidden="true" style={{ '--s': i / words.length } as CSSProperties}>
                    {w}{' '}
                </span>
            ))}
        </p>
    );
}
