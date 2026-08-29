"use client";

import { useEffect, useRef, useState } from "react";

export const HEADING_ANIM_DURATION_MS = 1500;

export default function SectionHeading({ icon, title, className = "" }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.35 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`sh-root flex items-center gap-3 md:gap-4 ${className}`}
            style={{ "--sh-duration": `${HEADING_ANIM_DURATION_MS}ms` }}
        >
            <style>{`
                @keyframes sh-fade-up {
                    0% { opacity: 0; transform: translateY(14px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes sh-underline-grow {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }
                .sh-icon, .sh-title {
                    opacity: 0;
                }
                .sh-underline {
                    transform: scaleX(0);
                    transform-origin: left;
                }
                .sh-icon.sh-in {
                    animation: sh-fade-up var(--sh-duration) cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                .sh-title.sh-in {
                    animation: sh-fade-up var(--sh-duration) cubic-bezier(0.2, 0.8, 0.2, 1) 120ms forwards;
                }
                .sh-underline.sh-in {
                    animation: sh-underline-grow var(--sh-duration) cubic-bezier(0.2, 0.8, 0.2, 1) 280ms forwards;
                }
            `}</style>

            <div className={`sh-icon flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner shrink-0 ${isVisible ? "sh-in" : ""}`}>
                <span
                    className="material-symbols-outlined text-primary text-2xl md:text-3xl leading-none tracking-normal select-none"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    {icon}
                </span>
            </div>

            <div className="min-w-0">
                <h2 className={`sh-title font-headline-md text-2xl md:text-4xl font-bold tracking-tight text-on-surface leading-[1.1] ${isVisible ? "sh-in" : ""}`}>
                    {title}
                </h2>
                <span className={`sh-underline block h-1 w-12 md:w-16 mt-1.5 rounded-full bg-gradient-to-r from-primary to-tertiary-container ${isVisible ? "sh-in" : ""}`} />
            </div>
        </div>
    );
}