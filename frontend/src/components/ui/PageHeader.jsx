"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// İç sayfaların ortak başlığı: küçük yol göstergesi, satır satır yükselen dev başlık ve açıklama.
// "ghost" verilirse arkada dev, içi boş bir yazı süzülür.
export default function PageHeader({ crumb, title, lines, description, ghost, children }) {
    const [isIn, setIsIn] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setIsIn(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const titleLines = lines || [title];

    return (
        <header className={`relative pt-32 md:pt-40 pb-12 md:pb-16 ${isIn ? "is-in" : ""}`}>
            {ghost && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute right-[-2%] top-24 md:top-20 font-display font-extrabold leading-none tracking-[-0.06em] hidden md:block animate-[float_9s_ease-in-out_infinite] motion-reduce:animate-none"
                    style={{ fontSize: "clamp(8rem, 18vw, 17rem)", color: "color-mix(in oklab, var(--brand) 9%, transparent)", fontStretch: "75%" }}
                >
                    {ghost}
                </span>
            )}

            <nav className="relative flex items-center gap-2 text-sm text-muted" aria-label="Sayfa yolu">
                <Link href="/" className="hover:text-brand transition-colors">Ana sayfa</Link>
                <span className="w-4 h-px bg-current opacity-50" aria-hidden="true" />
                <span className="text-ink font-semibold">{crumb}</span>
            </nav>

            <h1
                className="relative mt-5 font-display font-extrabold text-ink tracking-[-0.05em] leading-[0.9] text-[3.3rem] sm:text-7xl md:text-[6.5rem]"
                style={{ fontStretch: "80%" }}
            >
                {titleLines.map((line, i) => (
                    <span key={i} className="rise-line">
                        <span style={{ transitionDelay: `${120 + i * 110}ms` }}>{line}</span>
                    </span>
                ))}
            </h1>

            {description && (
                <p
                    className="relative mt-6 md:mt-8 max-w-2xl text-lg md:text-xl leading-relaxed text-muted rise-in"
                    style={{ animationDelay: "0.35s" }}
                >
                    {description}
                </p>
            )}
            {children}
        </header>
    );
}
