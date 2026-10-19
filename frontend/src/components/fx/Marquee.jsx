"use client";

import { useEffect, useRef } from "react";

// Sonsuz kayan bant. Sayfa kaydırıldıkça hızlanır, yukarı kaydırınca yön değiştirir.
//
// Performans notları:
// - Genişlik her karede DOM'dan okunmaz (eskiden scrollWidth her karede okunuyordu ve tarayıcıyı
//   sürekli layout hesaplamaya zorluyordu). Sadece boyut değişince ResizeObserver ile ölçülür.
// - Bant ekranda değilse ya da sekme arka plandaysa animasyon tamamen durur.
// - Hız kare süresine göre hesaplanır; 60Hz ve 120Hz ekranlarda aynı hızda akar.
export default function Marquee({ items, reverse = false, className = "", itemClassName = "", separator = "✦", baseSpeed = 0.6 }) {
    const rootRef = useRef(null);
    const trackRef = useRef(null);

    useEffect(() => {
        const root = rootRef.current;
        const track = trackRef.current;
        if (!root || !track) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let half = track.scrollWidth / 2;
        let x = 0;
        let boost = 0;
        let dir = reverse ? 1 : -1;
        let lastY = window.scrollY;
        let lastTime = 0;
        let rafId = null;
        let inView = false;

        const resizeObserver = new ResizeObserver(() => {
            half = track.scrollWidth / 2;
        });
        resizeObserver.observe(track);

        const onScroll = () => {
            if (!inView) return;
            const y = window.scrollY;
            const dy = y - lastY;
            lastY = y;
            boost = Math.min(18, boost + Math.abs(dy) * 0.12);
            if (dy !== 0) dir = (dy > 0 ? -1 : 1) * (reverse ? -1 : 1);
        };

        const loop = (now) => {
            // 60 karelik bir saniyeye göre ölçekle (dt = 1 → 16.7ms)
            const dt = lastTime ? Math.min((now - lastTime) / 16.667, 3) : 1;
            lastTime = now;

            x += dir * (baseSpeed + boost) * dt;
            boost *= Math.pow(0.92, dt);
            if (half > 0) {
                if (x <= -half) x += half;
                else if (x > 0) x -= half;
            }
            track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
            rafId = requestAnimationFrame(loop);
        };

        const start = () => {
            if (rafId !== null || !inView || document.hidden) return;
            lastTime = 0;
            lastY = window.scrollY;
            rafId = requestAnimationFrame(loop);
        };
        const stop = () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = null;
        };

        // Sadece ekrandayken çalış
        const io = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            inView ? start() : stop();
        });
        io.observe(root);

        const onVisibility = () => (document.hidden ? stop() : start());
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            stop();
            io.disconnect();
            resizeObserver.disconnect();
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("scroll", onScroll);
        };
    }, [reverse, baseSpeed]);

    const row = (copy) => (
        <div className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {items.map((item, i) => (
                <span key={`${copy}-${i}`} className="flex items-center">
                    <span className={itemClassName}>{item}</span>
                    <span className="mx-6 md:mx-9 opacity-70" aria-hidden="true">{separator}</span>
                </span>
            ))}
        </div>
    );

    return (
        <div ref={rootRef} className={`marquee ${className}`}>
            <div ref={trackRef} className="marquee-track">
                {row(0)}
                {row(1)}
            </div>
        </div>
    );
}
