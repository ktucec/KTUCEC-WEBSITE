"use client";
import Link from 'next/link';

export default function Announcements() {
    return (
        <section className="pt-12 md:pt-20" id="duyurular">
            {/* Header Section */}
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12 fade-up">
                <span
                    className="material-symbols-outlined text-primary text-3xl md:text-4xl shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    campaign
                </span>
                <h2 className="font-headline-md text-2xl md:text-headline-md text-(--color-on-surface)">
                    Son Duyurular
                </h2>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
                {/* Card 1 */}
                <div
                    className="glass-panel-dark rounded-[20px] md:rounded-3xl p-6 md:p-8 hover:scale-[1.02] transition-transform duration-300 group fade-up flex flex-col justify-between"
                    style={{ transitionDelay: '100ms' }}
                >
                    <div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-primary text-xl md:text-2xl">
                                terminal
                            </span>
                        </div>
                        <div className="inline-block bg-primary/10 text-primary font-label-md text-[11px] md:text-[12px] uppercase px-3 py-1 rounded-full mb-3 md:mb-4">
                            Yeni
                        </div>
                        <h3 className="font-headline-sm text-lg md:text-headline-sm text-(--color-on-surface) mb-2 md:mb-4 leading-snug">
                            Güz Dönemi Proje Başvuruları Başladı
                        </h3>
                        <p className="font-body-md text-sm md:text-body-md text-on-surface-variant mb-5 md:mb-6 leading-relaxed">
                            Yapay zeka ve siber güvenlik alanındaki yeni projelerimiz için ekip arkadaşları arıyoruz.
                        </p>
                    </div>
                    <Link href="#" className="inline-flex items-center text-primary font-label-md text-sm md:text-label-md hover:underline group-hover:gap-2 transition-all">
                        İncele <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                    </Link>
                </div>

                {/* Card 2 */}
                <div
                    className="glass-panel-dark rounded-[20px] md:rounded-3xl p-6 md:p-8 hover:scale-[1.02] transition-transform duration-300 group fade-up flex flex-col justify-between"
                    style={{ transitionDelay: '200ms' }}
                >
                    <div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-primary text-xl md:text-2xl">
                                groups
                            </span>
                        </div>
                        <h3 className="font-headline-sm text-lg md:text-headline-sm text-(--color-on-surface) mb-2 md:mb-4 leading-snug">
                            Genel Kurul Toplantısı
                        </h3>
                        <p className="font-body-md text-sm md:text-body-md text-on-surface-variant mb-5 md:mb-6 leading-relaxed">
                            Yönetim kurulu seçimi ve dönem planlaması için tüm üyelerimizin katılımı beklenmektedir.
                        </p>
                    </div>
                    <Link href="#" className="inline-flex items-center text-primary font-label-md text-sm md:text-label-md hover:underline group-hover:gap-2 transition-all">
                        İncele <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                    </Link>
                </div>

                {/* Card 3 */}
                <div
                    className="glass-panel-dark rounded-[20px] md:rounded-3xl p-6 md:p-8 hover:scale-[1.02] transition-transform duration-300 group fade-up flex flex-col justify-between"
                    style={{ transitionDelay: '300ms' }}
                >
                    <div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-primary text-xl md:text-2xl">
                                code
                            </span>
                        </div>
                        <h3 className="font-headline-sm text-lg md:text-headline-sm text-(--color-on-surface) mb-2 md:mb-4 leading-snug">
                            Hackathon Kayıtları
                        </h3>
                        <p className="font-body-md text-sm md:text-body-md text-on-surface-variant mb-5 md:mb-6 leading-relaxed">
                            Bahar dönemi büyük hackathon etkinliğimiz için ön kayıtlar açıldı. Takımını kur!
                        </p>
                    </div>
                    <Link href="#" className="inline-flex items-center text-primary font-label-md text-sm md:text-label-md hover:underline group-hover:gap-2 transition-all">
                        İncele <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}