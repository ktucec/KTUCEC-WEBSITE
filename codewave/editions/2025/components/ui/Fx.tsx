'use client';
import { useEffect, useRef } from 'react';

// Sayfa geneli efektler: kaydırma çubuğu, imleci izleyen ışık ve film greni.
export default function Fx() {
    const bar = useRef<HTMLDivElement>(null);
    const glow = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let raf = 0;
        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                const h = document.documentElement.scrollHeight - window.innerHeight;
                const p = h > 0 ? window.scrollY / h : 0;
                if (bar.current) bar.current.style.transform = `scaleX(${p})`;
            });
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        // İmleç ışığı yalnızca ince imleçli (fare) cihazlarda
        const fine = window.matchMedia('(pointer: fine)').matches;
        let gx = 0, gy = 0, tx = 0, ty = 0, graf = 0;
        const onMove = (e: PointerEvent) => {
            tx = e.clientX;
            ty = e.clientY;
            if (!graf) graf = requestAnimationFrame(loop);
        };
        const loop = () => {
            gx += (tx - gx) * 0.14;
            gy += (ty - gy) * 0.14;
            if (glow.current) glow.current.style.transform = `translate3d(${gx - 300}px, ${gy - 300}px, 0)`;
            graf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(loop) : 0;
        };
        if (fine) window.addEventListener('pointermove', onMove, { passive: true });

        return () => {
            cancelAnimationFrame(raf);
            cancelAnimationFrame(graf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            window.removeEventListener('pointermove', onMove);
        };
    }, []);

    return (
        <>
            <div ref={bar} className="fx-progress" aria-hidden="true" />
            <div ref={glow} className="fx-glow" aria-hidden="true" />
            <div className="fx-grain" aria-hidden="true" />
        </>
    );
}
