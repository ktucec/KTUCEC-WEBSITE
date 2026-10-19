"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GLYPHS = "01<>/{}[]#$%&*+=?";

// Harfleri rastgele karakterlerden "çözülerek" yerine oturan başlık.
// Açılışta bir kere oynar, üzerine gelince tekrar oynar.
export default function ScrambleText({ text, className = "", duration = 1300, replayOnHover = true }) {
    const [chars, setChars] = useState(() => text.split("").map((c) => ({ c, glitch: false })));
    const rafRef = useRef(null);

    const play = useCallback(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        cancelAnimationFrame(rafRef.current);
        const start = performance.now();
        const letters = text.split("");
        const step = duration / letters.length;

        const frame = (now) => {
            const t = now - start;
            const next = letters.map((c, i) => {
                const settleAt = 200 + i * step;
                if (t >= settleAt) return { c, glitch: false };
                return { c: GLYPHS[Math.floor(Math.random() * GLYPHS.length)], glitch: true };
            });
            setChars(next);
            if (t < 200 + letters.length * step) rafRef.current = requestAnimationFrame(frame);
        };
        rafRef.current = requestAnimationFrame(frame);
    }, [text, duration]);

    useEffect(() => {
        play();
        return () => cancelAnimationFrame(rafRef.current);
    }, [play]);

    return (
        <span
            className={className}
            onMouseEnter={replayOnHover ? play : undefined}
            aria-label={text}
            role="text"
        >
            {/* Asıl harf görünmez yer tutucu olarak kalır; böylece karışık karakterler yazının genişliğini oynatmaz */}
            {chars.map((ch, i) => (
                <span key={i} aria-hidden="true" className="scramble-char relative">
                    <span className={ch.glitch ? "invisible" : ""}>{text[i]}</span>
                    {ch.glitch && (
                        <span className="is-glitch absolute inset-0 flex items-center justify-center">{ch.c}</span>
                    )}
                </span>
            ))}
        </span>
    );
}
