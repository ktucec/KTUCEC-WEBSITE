'use client';
import type { CSSProperties, PointerEvent, ReactNode } from 'react';

// Fareyi takip eden ışık (spotlight) + hafif 3B eğim. State kullanmaz, CSS değişkenlerini doğrudan günceller.
export default function SpotCard({
    children,
    className = '',
    tilt = 6,
    as: Tag = 'div',
}: {
    children: ReactNode;
    className?: string;
    tilt?: number;
    as?: 'div' | 'article';
}) {
    const move = (e: PointerEvent<HTMLElement>) => {
        if (e.pointerType === 'touch') return;
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${x * 100}%`);
        el.style.setProperty('--my', `${y * 100}%`);
        el.style.setProperty('--rx', `${(0.5 - y) * tilt}deg`);
        el.style.setProperty('--ry', `${(x - 0.5) * tilt}deg`);
    };
    const leave = (e: PointerEvent<HTMLElement>) => {
        const el = e.currentTarget;
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
    };

    return (
        <Tag
            className={`spot ${className}`}
            style={{ '--rx': '0deg', '--ry': '0deg' } as CSSProperties}
            onPointerMove={move}
            onPointerLeave={leave}
        >
            {children}
        </Tag>
    );
}
