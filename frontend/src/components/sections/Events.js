"use client";
export default function Events() {
    return (
        <section className="pt-20" id="etkinlikler">
            <div className="flex items-center gap-4 mb-12 fade-up">
                <span className="material-symbols-outlined text-[var(--color-primary)] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                <h2 className="font-headline-md text-headline-md text-[var(--color-on-surface)]">Son Etkinlikler</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
                {/* Large Event Card */}
                <div className="md:col-span-2 md:row-span-2 glass-panel-dark rounded-[24px] p-8 flex flex-col justify-end relative overflow-hidden group fade-up">
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-container-highest)]/90 to-transparent z-10 pointer-events-none"></div>
                    <div
                        className="absolute inset-0 bg-cover bg-center z-0 opacity-20 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDRQjIxjvLkQBXwf-j5klMzWn6d07f2ekWXYZO-tSi0SjIkVmvwrHOorTZdqWxfbnxxb-Wrq0LBtNfqirVrN1SDG97WoIqM2WEogS8dchwoIUXEnjgl8u34V9k_-r6qzVeq2DEP_h6viEl6krgtIXuXHEqYN0WjDj6CsnfimZm87smJ52iOFYBnc6qwwCBr8YBhP7ec3nYME3ec7JjDjLZGKCmR9nTtYjLafqupLePOO_WMLyDxUbtUKN_xX9i3hf8mu6FJuwNdyE7U')" }}
                    ></div>
                    <div className="relative z-20">
                        <div className="flex gap-2 mb-4">
                            <span className="bg-primary/20 text-[var(--color-primary)] px-3 py-1 rounded-full font-label-md text-[12px] uppercase backdrop-blur-md">Zirve</span>
                            <span className="bg-surface/80 text-[var(--color-on-surface)] px-3 py-1 rounded-full font-label-md text-[12px] uppercase backdrop-blur-md">24 Ekim</span>
                        </div>
                        <h3 className="font-headline-md text-headline-md text-[var(--color-on-surface)] mb-4">KTÜ Teknoloji Zirvesi '24</h3>
                        <p className="font-body-lg text-body-lg text-[var(--color-on-surface-variant)] mb-6">Sektörün öncü isimleriyle buluştuğumuz, yapay zeka ve web3 odaklı büyük zirvemiz.</p>
                        <button className="bg-surface/50 border border-[var(--color-primary)] text-[var(--color-primary)] px-6 py-2 rounded-xl font-label-md text-label-md hover:bg-[var(--color-primary)] hover:text-white transition-colors">Detaylar</button>
                    </div>
                </div>

                {/* Medium Event Card */}
                <div className="md:col-span-2 md:row-span-1 glass-panel-dark rounded-[24px] p-6 flex flex-col justify-center relative overflow-hidden group fade-up" style={{ transitionDelay: '150ms' }}>
                    <div className="relative z-20 flex justify-between items-start">
                        <div>
                            <div className="flex gap-2 mb-3">
                                <span className="bg-primary/20 text-[var(--color-primary)] px-3 py-1 rounded-full font-label-md text-[12px] uppercase">Eğitim</span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm text-[var(--color-on-surface)] mb-2">React & Next.js Bootcamp</h3>
                            <p className="font-body-md text-body-md text-[var(--color-on-surface-variant)]">6 haftalık yoğun frontend eğitimi tamamlandı.</p>
                        </div>
                        <div className="w-16 h-16 bg-[var(--color-surface-container)] rounded-2xl flex flex-col items-center justify-center text-[var(--color-primary)] shadow-inner">
                            <span className="font-headline-sm text-xl leading-none">12</span>
                            <span className="font-label-md text-xs uppercase">Kas</span>
                        </div>
                    </div>
                </div>

                {/* Small Event Cards */}
                <div className="md:col-span-1 md:row-span-1 glass-panel-dark rounded-[24px] p-6 flex flex-col justify-between group fade-up" style={{ transitionDelay: '300ms' }}>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[var(--color-primary)] text-sm">coffee</span>
                    </div>
                    <div>
                        <h3 className="font-headline-sm text-lg font-bold text-[var(--color-on-surface)] mb-2">Code & Coffee</h3>
                        <p className="font-body-md text-sm text-[var(--color-on-surface-variant)]">Haftalık algoritma buluşması.</p>
                    </div>
                </div>

                <div className="md:col-span-1 md:row-span-1 glass-panel-dark rounded-[24px] p-6 flex flex-col justify-between group fade-up" style={{ transitionDelay: '450ms' }}>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[var(--color-primary)] text-sm">rocket_launch</span>
                    </div>
                    <div>
                        <h3 className="font-headline-sm text-lg font-bold text-[var(--color-on-surface)] mb-2">Mezun Paneli</h3>
                        <p className="font-body-md text-sm text-[var(--color-on-surface-variant)]">Sektörden tavsiyeler.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}