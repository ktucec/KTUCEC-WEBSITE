'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const INTERACTIVE = 'a, button, [data-cursor], label, summary';

// Hassas işaretçili cihazlarda: yeşil bir nokta ve onu gecikmeyle izleyen halka. Etkileşimli bir öğenin
// üstünde halka büyür; data-cursor taşıyan öğelerde içinde kısa bir etiket görünür ("Bilet", "Çevir").
// Dokunmatik cihazlarda ve hareket azaltma tercihinde hiç çalışmaz; yerel imleç kalır.
export default function Cursor() {
    const root = useRef<HTMLDivElement>(null);
    const ring = useRef<HTMLDivElement>(null);
    const dot = useRef<HTMLDivElement>(null);
    const label = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!fine || reduce || !root.current || !ring.current || !dot.current) return;

        const html = document.documentElement;
        html.classList.add('has-cursor');
        const el = root.current;
        const dotX = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3.out' });
        const dotY = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3.out' });
        const ringX = gsap.quickTo(ring.current, 'x', { duration: 0.5, ease: 'power3.out' });
        const ringY = gsap.quickTo(ring.current, 'y', { duration: 0.5, ease: 'power3.out' });

        const move = (e: PointerEvent) => {
            el.classList.add('is-on');
            dotX(e.clientX);
            dotY(e.clientY);
            ringX(e.clientX);
            ringY(e.clientY);
        };
        const over = (e: PointerEvent) => {
            const target = (e.target as Element | null)?.closest<HTMLElement>(INTERACTIVE);
            const text = target?.dataset.cursor ?? '';
            el.classList.toggle('is-hover', Boolean(target) && !text);
            el.classList.toggle('is-label', Boolean(text));
            if (label.current) label.current.textContent = text;
        };
        const down = () => el.classList.add('is-down');
        const up = () => el.classList.remove('is-down');
        const leave = () => el.classList.remove('is-on');

        window.addEventListener('pointermove', move, { passive: true });
        window.addEventListener('pointerover', over, { passive: true });
        window.addEventListener('pointerdown', down);
        window.addEventListener('pointerup', up);
        document.addEventListener('pointerleave', leave);
        return () => {
            html.classList.remove('has-cursor');
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerover', over);
            window.removeEventListener('pointerdown', down);
            window.removeEventListener('pointerup', up);
            document.removeEventListener('pointerleave', leave);
        };
    }, []);

    return (
        <div ref={root} className="cursor" aria-hidden="true">
            <div ref={ring} className="cursor-ring">
                <span ref={label} />
            </div>
            <div ref={dot} className="cursor-dot" />
        </div>
    );
}
