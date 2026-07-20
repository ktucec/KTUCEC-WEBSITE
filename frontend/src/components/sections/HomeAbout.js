"use client";
export default function HomeAbout() {
    return (
        <section className="pt-20" id="bizkimiz">
            <div className="glass-panel-dark rounded-[32px] p-8 md:p-16 relative overflow-hidden fade-up">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--color-tertiary-container)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-[var(--color-primary)] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                            <h2 className="font-headline-md text-headline-md text-[var(--color-on-surface)]">Biz Kimiz?</h2>
                        </div>
                        <p className="font-body-lg text-body-lg text-[var(--color-on-surface-variant)] leading-relaxed">
                            Karadeniz Teknik Üniversitesi Bilgisayar Mühendisliği Kulübü (KTUCEC), teknolojiyi tutkuyla takip eden, üretmeyi ve paylaşmayı seven öğrencilerin buluşma noktasıdır.
                        </p>
                        <p className="font-body-md text-body-md text-[var(--color-on-surface-variant)]">
                            Amacımız, akademik teoriyi pratik endüstri standartlarıyla birleştirerek üyelerimizi geleceğin mühendislik dünyasına hazırlamaktır. Düzenlediğimiz eğitimler, hackathonlar ve sektör buluşmaları ile güçlü bir ağ oluşturuyoruz.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-4">
                            <span className="bg-primary/10 text-[var(--color-primary)] font-label-md text-xs uppercase px-4 py-2 rounded-full border border-primary/20">Yazılım</span>
                            <span className="bg-primary/10 text-[var(--color-primary)] font-label-md text-xs uppercase px-4 py-2 rounded-full border border-primary/20">Donanım</span>
                            <span className="bg-primary/10 text-[var(--color-primary)] font-label-md text-xs uppercase px-4 py-2 rounded-full border border-primary/20">Yapay Zeka</span>
                            <span className="bg-primary/10 text-[var(--color-primary)] font-label-md text-xs uppercase px-4 py-2 rounded-full border border-primary/20">Siber Güvenlik</span>
                        </div>
                    </div>

                    <div className="relative aspect-square md:aspect-[4/3] rounded-[24px] overflow-hidden shadow-2xl border border-white/50">
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBhub4AuCLvCWqJUW5HJr0f8GoUkTKdvyFbMLuDPs41JRukuuoLjd4XCMWkOcY4bYPy1PtOmGsyGdtewry5PO_XOwEMy9bLkmSfD8O-dIjJahjDUMWmCb6-lC4LZ-Q4QfwSiYXV2aGQN0jzBOqp01eZ4no_pkKBD_e50NiH97awlEHBYobYllYGeisMlmed2LFxAWUp6Hn1gFlTCbPtCEKpKgEVGNWlMHeDoGKdnUR9k6yIc8MdIyzHqNlJFgBMCLI5cU_z7SA3KuyG')" }}
                        ></div>
                    </div>
                </div>
            </div>
        </section>
    );
}