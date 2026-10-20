'use client';
import { useEffect, useRef, useState } from 'react';

// Görünür olunca easeOutExpo ile sayan sayaç.
export default function Counter({ value, suffix = '', duration = 1800 }: { value: number; suffix?: string; duration?: number }) {
    const [n, setN] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let raf = 0;
        const io = new IntersectionObserver(
            ([e]) => {
                if (!e.isIntersecting) return;
                io.disconnect();
                const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (reduce) return setN(value);
                const t0 = performance.now();
                const tick = (now: number) => {
                    const p = Math.min((now - t0) / duration, 1);
                    const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
                    setN(Math.round(value * eased));
                    if (p < 1) raf = requestAnimationFrame(tick);
                };
                raf = requestAnimationFrame(tick);
            },
            { threshold: 0.4 }
        );
        io.observe(el);
        return () => {
            io.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [value, duration]);

    return (
        <span ref={ref}>
            {n.toLocaleString('tr-TR')}
            {suffix}
        </span>
    );
}
