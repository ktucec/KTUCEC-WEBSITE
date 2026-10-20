'use client';
import type { PointerEvent, ReactNode } from 'react';

// İçeriğini imlece doğru hafifçe çeken sarmalayıcı (butonlar için).
export default function Magnetic({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
    const move = (e: PointerEvent<HTMLSpanElement>) => {
        if (e.pointerType === 'touch') return;
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
    };
    const leave = (e: PointerEvent<HTMLSpanElement>) => {
        e.currentTarget.style.transform = '';
    };
    return (
        <span className="magnetic" onPointerMove={move} onPointerLeave={leave}>
            {children}
        </span>
    );
}
