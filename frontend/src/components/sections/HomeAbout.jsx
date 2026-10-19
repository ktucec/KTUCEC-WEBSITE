"use client";

import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import ScrollWords from "@/components/fx/ScrollWords";
import RotatingBadge from "@/components/fx/RotatingBadge";

const tags = [
    { label: "Yazılım", icon: "code", rot: "-4deg" },
    { label: "Donanım", icon: "memory", rot: "3deg" },
    { label: "Yapay zeka", icon: "smart_toy", rot: "-2deg" },
    { label: "Siber güvenlik", icon: "shield_lock", rot: "5deg" },
];

export default function HomeAbout() {
    return (
        <section id="bizkimiz">
            <SectionHeading title="Biz kimiz?" className="mb-10 md:mb-14" />

            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
                <div>
                    <ScrollWords
                        className="font-display text-[1.65rem] sm:text-3xl md:text-[2.5rem] font-bold leading-[1.15] tracking-[-0.03em] text-ink"
                        text="Teknolojiyi tutkuyla takip eden, üretmeyi ve paylaşmayı seven KTÜ öğrencilerinin buluşma noktasıyız."
                    />
                    <p className="mt-7 text-muted text-base md:text-lg leading-relaxed max-w-xl fade-up">
                        Akademik teoriyi sektörün pratiğiyle birleştiriyoruz. Eğitimler, hackathonlar ve sektör buluşmalarıyla
                        üyelerimizin hem kendini geliştirdiği hem de güçlü bir çevre edindiği bir topluluk kuruyoruz.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3 fade-up">
                        {tags.map((tag) => (
                            <span
                                key={tag.label}
                                className="inline-flex items-center gap-2 rounded-full bg-card border border-line px-4 py-2.5 text-[15px] font-semibold text-ink shadow-sm cursor-default transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 hover:scale-110 hover:border-brand hover:text-brand"
                                style={{ transform: `rotate(${tag.rot})` }}
                            >
                                <span className="material-symbols-outlined text-[18px] text-brand" aria-hidden="true">{tag.icon}</span>
                                {tag.label}
                            </span>
                        ))}
                    </div>

                    <Link href="/hakkimizda" className="btn btn-primary mt-10 fade-up">
                        Hikayemizi oku
                        <span className="material-symbols-outlined btn-icon text-[20px]" aria-hidden="true">arrow_outward</span>
                    </Link>
                </div>

                {/* Fotoğraf: hafif eğik çerçeve, üzerine gelince düzelir; köşede dönen rozet */}
                <div className="relative fade-up">
                    <div className="group relative aspect-[4/3] rounded-[30px] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                        <div className="zoom-img absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/home-bizkimiz.jpg')" }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                        <p className="absolute left-5 bottom-4 text-white/90 text-sm font-semibold">Kulüp ailesinden bir kare</p>
                    </div>
                    <RotatingBadge className="absolute -left-5 -bottom-10 sm:-left-10 sm:-bottom-12" size={128} />
                    <div className="absolute -top-4 -right-3 w-20 h-20 rounded-full border-2 border-dashed border-brand/50 animate-[spin_24s_linear_infinite] motion-reduce:animate-none" aria-hidden="true" />
                </div>
            </div>
        </section>
    );
}
