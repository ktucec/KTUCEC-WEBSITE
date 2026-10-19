"use client";

import { useRef } from 'react';

// Mouse'a göre 3B eğilen değer kartı
export default function AboutCard({ icon, title, description, customClass = "" }) {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = (y - rect.height / 2) / 14;
        const rotateY = (rect.width / 2 - x) / 14;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    };

    const handleMouseLeave = () => {
        if (cardRef.current) cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`spot surface-card group rounded-[28px] p-7 md:p-8 cursor-default !transition-[transform,box-shadow] !duration-200 ease-out ${customClass}`}
            style={{ willChange: 'transform' }}
        >
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-brand text-white shadow-[0_12px_24px_-10px_rgba(215,20,26,0.7)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-12 group-hover:scale-110">
                <span className="material-symbols-outlined text-[28px]" aria-hidden="true">{icon}</span>
            </span>
            <h3 className="mt-7 font-display text-2xl font-bold tracking-[-0.025em] text-ink">{title}</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{description}</p>
        </div>
    );
}
