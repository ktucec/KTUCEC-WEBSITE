"use client";

import { useEffect, useRef, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";

export default function HomeAbout() {
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = sectionRef.current;
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
        <section className="pt-12 md:pt-20" id="bizkimiz" ref={sectionRef}>
            <div className={`glass-panel-dark rounded-[24px] md:rounded-[32px] p-6 sm:p-10 md:p-16 lg:p-20 relative overflow-hidden fade-up ${isVisible ? "visible" : ""}`}>
                {/* Decorative Blur Elements */}
                <div className="absolute top-0 right-0 w-56 h-56 md:w-80 md:h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-[var(--color-tertiary-container)]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                {/* Oversized ghost background word */}
                <span
                    aria-hidden="true"
                    className="ha-ghost-text hidden lg:block absolute -top-6 -left-4 font-headline-md font-bold text-[9rem] xl:text-[11rem] tracking-tighter select-none pointer-events-none opacity-[0.06]"
                >
                    KTUCEC
                </span>

                <div className="ha-grid gap-8 md:gap-14 lg:gap-20 relative z-10">
                    {/* Heading — top on mobile, top-left on desktop */}
                    <div className="ha-area-heading">
                        <SectionHeading icon="psychology" title="Biz Kimiz?" />
                    </div>

                    {/* Image */}
                    <div className="ha-area-image relative">
                        <div className="relative aspect-[4/3] rounded-[20px] md:rounded-[28px] overflow-hidden shadow-2xl shadow-black/30 border border-white/20 md:border-white/40 rotate-1 md:rotate-2 hover:rotate-0 transition-transform duration-500 ease-out">
                            <div
                                className="ha-mobile-drift w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: "url('/home-bizkimiz.jpg')" }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                        </div>

                        {/* Floating glass badge */}
                        <div className="ha-float hidden sm:flex absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8 items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl px-4 py-3.5 md:px-5 md:py-4 shadow-xl">
                            <span
                                className="material-symbols-outlined text-[var(--color-primary)] text-2xl md:text-3xl"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                diversity_3
                            </span>
                            <div className="leading-tight">
                                <p className="font-headline-sm text-lg md:text-xl font-bold text-[var(--color-on-surface)]">
                                    KTUCEC
                                </p>
                                <p className="font-body-md text-[10px] md:text-xs text-[var(--color-on-surface-variant)] uppercase tracking-wide">
                                    Bilgisayar Müh. Kulübü
                                </p>
                            </div>
                        </div>

                        {/* Accent ring decoration */}
                        <div className="hidden md:block absolute -top-5 -right-5 w-16 h-16 rounded-full border-2 border-dashed border-primary/30"></div>
                    </div>

                    {/* Text + tags */}
                    <div className="ha-area-text space-y-5 md:space-y-7">
                        <p className="font-body-lg text-base md:text-body-lg text-[var(--color-on-surface-variant)] leading-relaxed">
                            Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü (KTUCEC), teknolojiyi tutkuyla takip eden, üretmeyi ve paylaşmayı seven öğrencilerin buluşma noktasıdır.
                        </p>
                        <p className="font-body-md text-sm md:text-body-md text-[var(--color-on-surface-variant)] leading-relaxed">
                            Amacımız, akademik teoriyi pratik endüstri standartlarıyla birleştirerek üyelerimizi geleceğin mühendislik dünyasına hazırlamaktır. Düzenlediğimiz eğitimler, hackathonlar ve sektör buluşmaları ile güçlü bir ağ oluşturuyoruz.
                        </p>

                        <div className="flex flex-wrap gap-2.5 md:gap-3 pt-1">
                            {[
                                { label: "Yazılım", icon: "code" },
                                { label: "Donanım", icon: "memory" },
                                { label: "Yapay Zeka", icon: "smart_toy" },
                                { label: "Siber Güvenlik", icon: "shield_lock" },
                            ].map((tag) => (
                                <span
                                    key={tag.label}
                                    className="ha-tag-chip flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-[var(--color-primary)] font-label-md text-[11px] md:text-xs uppercase tracking-wide px-3.5 py-2 md:px-4 md:py-2.5 rounded-full border border-primary/20 hover:border-primary/40 cursor-default"
                                >
                                    <span className="material-symbols-outlined text-[15px] md:text-base">
                                        {tag.icon}
                                    </span>
                                    {tag.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}