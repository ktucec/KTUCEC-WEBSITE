"use client";

import { useEffect, useRef } from "react";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

// Sitenin genel efekt katmanı:
// 1) Üstte scroll ilerleme çubuğu
// 2) .spot sınıflı kartlarda mouse'u takip eden ışık (CSS değişkenleri --mx / --my)
// 3) Tıklayınca kırmızı kıvılcımlar
// 4) Konami kodu ile 0/1 yağmuru + konsolda geliştiricilere küçük not
export default function FxLayer() {
    const barRef = useRef(null);

    useEffect(() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // --- 1. Scroll ilerlemesi ---
        let ticking = false;
        const updateProgress = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? window.scrollY / max : 0;
            if (barRef.current) barRef.current.style.setProperty("--progress", p.toFixed(4));
            ticking = false;
        };
        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(updateProgress);
            }
        };
        updateProgress();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        // --- 2. Spot ışığı ---
        const onPointerMove = (e) => {
            const card = e.target.closest?.(".spot");
            if (!card) return;
            const r = card.getBoundingClientRect();
            card.style.setProperty("--mx", `${e.clientX - r.left}px`);
            card.style.setProperty("--my", `${e.clientY - r.top}px`);
        };
        document.addEventListener("pointermove", onPointerMove, { passive: true });

        // --- 3. Tıklama kıvılcımları ---
        const onPointerDown = (e) => {
            if (reduceMotion || e.pointerType === "touch") return;
            const count = 8;
            for (let i = 0; i < count; i++) {
                const s = document.createElement("span");
                s.className = "spark";
                const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
                const dist = 26 + Math.random() * 22;
                s.style.left = `${e.clientX}px`;
                s.style.top = `${e.clientY}px`;
                s.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
                s.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
                s.style.setProperty("--rot", `${Math.random() * 360}deg`);
                if (i % 3 === 0) s.style.background = "var(--sea)";
                document.body.appendChild(s);
                setTimeout(() => s.remove(), 650);
            }
        };
        document.addEventListener("pointerdown", onPointerDown);

        // --- 4. Konami kodu ---
        let pos = 0;
        const onKey = (e) => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
            if (pos === KONAMI.length) {
                pos = 0;
                if (reduceMotion) return;
                for (let i = 0; i < 90; i++) {
                    const b = document.createElement("span");
                    b.className = "bit-rain";
                    b.textContent = Math.random() > 0.5 ? "1" : "0";
                    b.style.left = `${Math.random() * 100}vw`;
                    b.style.fontSize = `${14 + Math.random() * 26}px`;
                    b.style.animationDuration = `${1.6 + Math.random() * 2.2}s`;
                    b.style.animationDelay = `${Math.random() * 0.8}s`;
                    b.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
                    if (Math.random() > 0.7) b.style.color = "var(--sea)";
                    document.body.appendChild(b);
                    setTimeout(() => b.remove(), 5000);
                }
            }
        };
        window.addEventListener("keydown", onKey);

        if (!window.__ktucecHello) {
            window.__ktucecHello = true;
            console.log(
                "%cKTÜCEC%c\nKodu inceleyecek kadar meraklıysan aramıza katıl: https://www.ktucec.com/iletisim\n(İpucu: ↑ ↑ ↓ ↓ ← → ← → B A)",
                "font: 800 32px sans-serif; color: #d7141a;",
                "font: 14px sans-serif;"
            );
        }

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("keydown", onKey);
        };
    }, []);

    return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}
