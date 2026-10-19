"use client";

import { useEffect, useId, useState } from "react";

// Güneş ↔ ay butonu. Tema değişirken, tarayıcı destekliyorsa yeni tema
// butonun olduğu noktadan daire şeklinde yayılarak gelir.
export default function ThemeToggle({ className = "" }) {
    const [isDark, setIsDark] = useState(false);
    const maskId = `moon-${useId().replace(/:/g, "")}`;

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const applyTheme = (dark) => {
        document.documentElement.classList.toggle("dark", dark);
        try {
            localStorage.setItem("theme", dark ? "dark" : "light");
        } catch { }
        setIsDark(dark);
    };

    const handleClick = (e) => {
        const next = !isDark;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (!document.startViewTransition || reduceMotion) {
            applyTheme(next);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        const transition = document.startViewTransition(() => applyTheme(next));
        transition.ready.then(() => {
            document.documentElement.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                { duration: 650, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" }
            );
        });
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
            title={isDark ? "Açık tema" : "Koyu tema"}
            className={`theme-toggle grid place-items-center w-11 h-11 rounded-full transition-colors cursor-pointer ${className}`}
        >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <mask id={maskId}>
                    <rect x="0" y="0" width="24" height="24" fill="white" />
                    <circle className="moon-mask-circle" cx="30" cy="0" r="7" fill="black" />
                </mask>
                <circle className="sun-core" cx="12" cy="12" r="5" fill="currentColor" mask={`url(#${maskId})`} />
                <g className="sun-rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="1.5" x2="12" y2="3.5" />
                    <line x1="12" y1="20.5" x2="12" y2="22.5" />
                    <line x1="1.5" y1="12" x2="3.5" y2="12" />
                    <line x1="20.5" y1="12" x2="22.5" y2="12" />
                    <line x1="4.6" y1="4.6" x2="6" y2="6" />
                    <line x1="18" y1="18" x2="19.4" y2="19.4" />
                    <line x1="4.6" y1="19.4" x2="6" y2="18" />
                    <line x1="18" y1="6" x2="19.4" y2="4.6" />
                </g>
            </svg>
        </button>
    );
}
