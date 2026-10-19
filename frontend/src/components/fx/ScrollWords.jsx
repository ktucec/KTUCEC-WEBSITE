"use client";

import { useEffect, useRef } from "react";

// Sayfa kaydırıldıkça kelimeler soluk renkten tam renge geçer.
export default function ScrollWords({ text, className = "" }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const words = Array.from(el.querySelectorAll("[data-word]"));
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            words.forEach((w) => (w.style.opacity = 1));
            return;
        }
        let ticking = false;
        const update = () => {
            const r = el.getBoundingClientRect();
            const vh = window.innerHeight;
            // Paragrafın üstü ekranın %85'ine geldiğinde başlar, alt kısmı %45'e gelince biter
            const start = vh * 0.85;
            const end = vh * 0.45;
            const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height * 0.6)));
            const lit = p * words.length;
            words.forEach((w, i) => {
                const o = Math.min(1, Math.max(0.16, lit - i + 0.16));
                w.style.opacity = o.toFixed(3);
            });
            ticking = false;
        };
        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [text]);

    return (
        <p ref={ref} className={className}>
            {text.split(" ").map((w, i) => (
                <span key={i} data-word style={{ opacity: 0.16, transition: "opacity 0.15s linear" }}>
                    {w}{" "}
                </span>
            ))}
        </p>
    );
}
