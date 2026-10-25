'use client';
import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// İçindeki düğmeyi imlece doğru hafifçe çeker ve sıvı dolgunun başlayacağı noktayı (--mx/--my) imlecin
// girdiği yere taşır. Yalnızca hassas işaretçide ve hareket serbestken çalışır.
export default function Magnetic({ children, strength = 0.32, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
    const root = useRef<HTMLSpanElement>(null);

    useGSAP(
        (_ctx, contextSafe) => {
            const el = root.current;
            const target = el?.firstElementChild as HTMLElement | null;
            if (!el || !target || !contextSafe) return;
            const mm = gsap.matchMedia();
            mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
                const xTo = gsap.quickTo(target, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
                const yTo = gsap.quickTo(target, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
                const move = contextSafe((e: PointerEvent) => {
                    const r = el.getBoundingClientRect();
                    xTo((e.clientX - (r.left + r.width / 2)) * strength);
                    yTo((e.clientY - (r.top + r.height / 2)) * strength);
                    target.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
                    target.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
                });
                const leave = contextSafe(() => {
                    xTo(0);
                    yTo(0);
                });
                el.addEventListener('pointermove', move);
                el.addEventListener('pointerleave', leave);
                return () => {
                    el.removeEventListener('pointermove', move);
                    el.removeEventListener('pointerleave', leave);
                };
            });
        },
        { scope: root },
    );

    return (
        <span ref={root} className={`magnetic ${className}`}>
            {children}
        </span>
    );
}
