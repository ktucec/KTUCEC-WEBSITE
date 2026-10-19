"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export const HEADING_ANIM_DURATION_MS = 1500;

// Bölüm başlığı: başlık satırı aşağıdan yükselir, altına üzerinde sinyal gezen kırmızı bir hat çizilir.
// "icon" parametresi geriye dönük uyumluluk için kabul ediliyor ama artık kullanılmıyor.
export default function SectionHeading({ title, subtitle, action, className = "" }) {
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
        <div ref={ref} className={`${isVisible ? "is-in" : ""} ${className}`}>
            <div className="flex items-end justify-between gap-6">
                <div className="min-w-0">
                    <h2 className="font-display text-[2.35rem] sm:text-5xl md:text-[3.6rem] font-extrabold tracking-[-0.045em] leading-[0.95] text-ink" style={{ fontStretch: "85%" }}>
                        <span className="rise-line"><span>{title}</span></span>
                    </h2>
                    {subtitle && (
                        <p className="mt-3 text-muted text-base md:text-lg max-w-xl fade-up visible">{subtitle}</p>
                    )}
                </div>
                {action && (
                    <Link
                        href={action.href}
                        className="group hidden sm:inline-flex items-center gap-1.5 shrink-0 pb-1 font-semibold text-ink hover:text-brand transition-colors"
                    >
                        {action.label}
                        <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true">arrow_outward</span>
                    </Link>
                )}
            </div>
            <div className="signal-line mt-5 md:mt-6" aria-hidden="true" />
        </div>
    );
}
