"use client";

import { useEffect, useRef } from "react";

// Sonsuz kayan bant. Sayfa kaydırıldıkça hızlanır, yukarı kaydırınca yön değiştirir.
export default function Marquee({ items, reverse = false, className = "", itemClassName = "", separator = "✦", baseSpeed = 0.6 }) {
    const trackRef = useRef(null);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let x = 0;
        let boost = 0;
        let dir = reverse ? 1 : -1;
        let lastY = window.scrollY;
        let rafId;

        const onScroll = () => {
            const dy = window.scrollY - lastY;
            lastY = window.scrollY;
            boost = Math.min(18, boost + Math.abs(dy) * 0.12);
            if (dy !== 0) dir = (dy > 0 ? -1 : 1) * (reverse ? -1 : 1);
        };

        const loop = () => {
            const half = track.scrollWidth / 2;
            x += dir * (baseSpeed + boost);
            boost *= 0.92;
            if (x <= -half) x += half;
            if (x > 0) x -= half;
            track.style.transform = `translate3d(${x}px,0,0)`;
            rafId = requestAnimationFrame(loop);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        rafId = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(rafId);
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
        <div className={`marquee ${className}`}>
            <div ref={trackRef} className="marquee-track">
                {row(0)}
                {row(1)}
            </div>
        </div>
    );
}
