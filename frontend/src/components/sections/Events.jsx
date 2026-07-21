"use client";

export default function Events() {
    return (
        <section className="pt-12 md:pt-20" id="etkinlikler">
            {/* Section Header */}
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12 fade-up">
                <span
                    className="material-symbols-outlined text-[var(--color-primary)] text-3xl md:text-4xl shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    event
                </span>
                <h2 className="font-headline-md text-2xl md:text-headline-md text-[var(--color-on-surface)]">
                    Yaklaşan Etkinlikler
                </h2>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6 h-auto md:h-[600px]">

                {/* Large Event Card */}
                <div className="md:col-span-2 md:row-span-2 glass-panel-dark rounded-[20px] md:rounded-[24px] p-5 sm:p-6 md:p-8 flex flex-col justify-end relative overflow-hidden group fade-up min-h-[320px] md:min-h-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-container-highest)]/95 via-[var(--color-surface-container-highest)]/40 to-transparent z-10 pointer-events-none"></div>
                    <div
                        className="absolute inset-0 bg-cover bg-center z-0 opacity-25 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDRQjIxjvLkQBXwf-j5klMzWn6d07f2ekWXYZO-tSi0SjIkVmvwrHOorTZdqWxfbnxxb-Wrq0LBtNfqirVrN1SDG97WoIqM2WEogS8dchwoIUXEnjgl8u34V9k_-r6qzVeq2DEP_h6viEl6krgtIXuXHEqYN0WjDj6CsnfimZm87smJ52iOFYBnc6qwwCBr8YBhP7ec3nYME3ec7JjDjLZGKCmR9nTtYjLafqupLePOO_WMLyDxUbtUKN_xX9i3hf8mu6FJuwNdyE7U')" }}
                    ></div>
                    <div className="relative z-20">
                        <div className="flex gap-2 mb-3 md:mb-4">
                            <span className="bg-primary/20 text-[var(--color-primary)] px-2.5 py-0.5 md:px-3 md:py-1 rounded-full font-label-md text-[11px] md:text-[12px] uppercase backdrop-blur-md">
                                Zirve
                            </span>
                            <span className="bg-surface/80 text-[var(--color-on-surface)] px-2.5 py-0.5 md:px-3 md:py-1 rounded-full font-label-md text-[11px] md:text-[12px] uppercase backdrop-blur-md">
                                24 Ekim
                            </span>
                        </div>
                        <h3 className="font-headline-md text-xl sm:text-2xl md:text-headline-md text-[var(--color-on-surface)] mb-2 md:mb-4 leading-snug">
                            KTÜ Teknoloji Zirvesi '24
                        </h3>
                        <p className="font-body-lg text-xs sm:text-sm md:text-body-lg text-[var(--color-on-surface-variant)] mb-4 md:mb-6 leading-relaxed">
                            Sektörün öncü isimleriyle buluştuğumuz, yapay zeka ve web3 odaklı büyük zirvemiz.
                        </p>
                        <button className="bg-surface/50 border border-[var(--color-primary)] text-[var(--color-primary)] px-5 py-1.5 md:px-6 md:py-2 rounded-xl font-label-md text-xs md:text-label-md hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer">
                            Detaylar
                        </button>
                    </div>
                </div>

                {/* Medium Event Card */}
                <div
                    className="md:col-span-2 md:row-span-1 glass-panel-dark rounded-[20px] md:rounded-[24px] p-5 md:p-6 flex flex-col justify-center relative overflow-hidden group fade-up"
                    style={{ transitionDelay: '150ms' }}
                >
                    <div className="relative z-20 flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex gap-2 mb-2 md:mb-3">
                                <span className="bg-primary/20 text-[var(--color-primary)] px-2.5 py-0.5 md:px-3 md:py-1 rounded-full font-label-md text-[11px] md:text-[12px] uppercase">
                                    Eğitim
                                </span>
                            </div>
                            <h3 className="font-headline-sm text-base sm:text-lg md:text-headline-sm text-[var(--color-on-surface)] mb-1 md:mb-2 leading-snug">
                                React & Next.js Bootcamp
                            </h3>
                            <p className="font-body-md text-xs md:text-body-md text-[var(--color-on-surface-variant)] leading-relaxed">
                                6 haftalık yoğun frontend eğitimi tamamlandı.
                            </p>
                        </div>
                        <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 bg-[var(--color-surface-container)] rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-[var(--color-primary)] shadow-inner">
                            <span className="font-headline-sm text-lg md:text-xl leading-none">12</span>
                            <span className="font-label-md text-[10px] md:text-xs uppercase">Kas</span>
                        </div>
                    </div>
                </div>

                {/* Small Event Card 1 */}
                <div
                    className="md:col-span-1 md:row-span-1 glass-panel-dark rounded-[20px] md:rounded-[24px] p-4 sm:p-5 md:p-6 flex flex-col justify-between group fade-up"
                    style={{ transitionDelay: '300ms' }}
                >
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4 shrink-0">
                        <span className="material-symbols-outlined text-[var(--color-primary)] text-sm md:text-base">
                            coffee
                        </span>
                    </div>
                    <div>
                        <h3 className="font-headline-sm text-base md:text-lg font-bold text-[var(--color-on-surface)] mb-1 md:mb-2">
                            Code & Coffee
                        </h3>
                        <p className="font-body-md text-xs md:text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                            Haftalık algoritma buluşması.
                        </p>
                    </div>
                </div>

                {/* Small Event Card 2 */}
                <div
                    className="md:col-span-1 md:row-span-1 glass-panel-dark rounded-[20px] md:rounded-[24px] p-4 sm:p-5 md:p-6 flex flex-col justify-between group fade-up"
                    style={{ transitionDelay: '450ms' }}
                >
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4 shrink-0">
                        <span className="material-symbols-outlined text-[var(--color-primary)] text-sm md:text-base">
                            rocket_launch
                        </span>
                    </div>
                    <div>
                        <h3 className="font-headline-sm text-base md:text-lg font-bold text-[var(--color-on-surface)] mb-1 md:mb-2">
                            Mezun Paneli
                        </h3>
                        <p className="font-body-md text-xs md:text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                            Sektörden tavsiyeler.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}