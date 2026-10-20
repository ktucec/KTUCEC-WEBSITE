'use client';
import { useEffect, useRef, useState } from 'react';

export default function Counter({ value }: { value: number }) {
    const [n, setN] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const o = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                let s = 0;
                const id = setInterval(() => {
                    s += Math.ceil(value / 35);
                    if (s >= value) { s = value; clearInterval(id); }
                    setN(s);
                }, 25);
                o.disconnect();
            }
        }, { threshold: .4 });

        if (ref.current) o.observe(ref.current);
        return () => o.disconnect();
    }, [value]);

    return <span ref={ref}>{n.toLocaleString('tr-TR')}</span>;
}