"use client";

import { useRef } from 'react';

export default function AboutCard({ icon, title, description, customClass = "" }) {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`glass-card p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl group transition-all duration-200 cursor-default ease-out ${customClass}`}
            style={{ willChange: 'transform' }}
        >
            <span className="material-symbols-outlined text-primary text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform block">
                {icon}
            </span>
            <h3 className="font-headline-sm text-lg sm:text-xl md:text-headline-sm mb-1.5 md:mb-2 text-on-surface leading-snug">
                {title}
            </h3>
            <p className="text-[var(--color-on-secondary-fixed-variant)] opacity-80 font-body-md text-xs sm:text-sm md:text-body-md leading-relaxed">
                {description}
            </p>
        </div>
    );
}