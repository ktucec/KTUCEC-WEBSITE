"use client";

export default function HomeAbout() {
    return (
        <section className="pt-12 md:pt-20" id="bizkimiz">
            <div className="glass-panel-dark rounded-[24px] md:rounded-[32px] p-6 sm:p-8 md:p-16 relative overflow-hidden fade-up">
                {/* Decorative Blur Elements */}
                <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-56 h-56 md:w-80 md:h-80 bg-[var(--color-tertiary-container)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
                    {/* Left Column: Text Content */}
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-3 md:gap-4">
                            <span
                                className="material-symbols-outlined text-[var(--color-primary)] text-3xl md:text-4xl shrink-0"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                psychology
                            </span>
                            <h2 className="font-headline-md text-2xl md:text-headline-md text-[var(--color-on-surface)]">
                                Biz Kimiz?
                            </h2>
                        </div>
                        <p className="font-body-lg text-base md:text-body-lg text-[var(--color-on-surface-variant)] leading-relaxed">
                            Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü (KTUCEC), teknolojiyi tutkuyla takip eden, üretmeyi ve paylaşmayı seven öğrencilerin buluşma noktasıdır.
                        </p>
                        <p className="font-body-md text-sm md:text-body-md text-[var(--color-on-surface-variant)] leading-relaxed">
                            Amacımız, akademik teoriyi pratik endüstri standartlarıyla birleştirerek üyelerimizi geleceğin mühendislik dünyasına hazırlamaktır. Düzenlediğimiz eğitimler, hackathonlar ve sektör buluşmaları ile güçlü bir ağ oluşturuyoruz.
                        </p>

                        {/* Tags / Badges */}
                        <div className="flex flex-wrap gap-2 md:gap-3 pt-2 md:pt-4">
                            <span className="bg-primary/10 text-[var(--color-primary)] font-label-md text-[11px] md:text-xs uppercase px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-primary/20">
                                Yazılım
                            </span>
                            <span className="bg-primary/10 text-[var(--color-primary)] font-label-md text-[11px] md:text-xs uppercase px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-primary/20">
                                Donanım
                            </span>
                            <span className="bg-primary/10 text-[var(--color-primary)] font-label-md text-[11px] md:text-xs uppercase px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-primary/20">
                                Yapay Zeka
                            </span>
                            <span className="bg-primary/10 text-[var(--color-primary)] font-label-md text-[11px] md:text-xs uppercase px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-primary/20">
                                Siber Güvenlik
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Image */}
                    <div className="relative aspect-[4/3] rounded-[16px] md:rounded-[24px] overflow-hidden shadow-2xl border border-white/20 md:border-white/50">
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: "url('/home-bizkimiz.jpg')" }}
                        ></div>
                    </div>
                </div>
            </div>
        </section>
    );
}