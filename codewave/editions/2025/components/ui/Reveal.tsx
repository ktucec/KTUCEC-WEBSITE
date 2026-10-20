'use client';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type Variant = 'rise' | 'blur' | 'clip' | 'scale';

// Görünür olunca sahneye giren sarmalayıcı. delay: ms (sıralı giriş için)
export default function Reveal({
    children,
    className = '',
    delay = 0,
    variant = 'rise',
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
    variant?: Variant;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!('IntersectionObserver' in window)) {
            setShown(true);
            return;
        }
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setShown(true);
                    io.disconnect();
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`reveal rv-${variant}${shown ? ' in' : ''} ${className}`}
            style={{ '--d': `${delay}ms` } as CSSProperties}
        >
            {children}
        </div>
    );
}
