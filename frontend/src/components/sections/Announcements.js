"use client";
import Link from 'next/link';

export default function Announcements() {
    return (
        <section className="pt-20" id="duyurular">
            <div className="flex items-center gap-4 mb-12 fade-up">
                <span className="material-symbols-outlined text-[var(--color-primary)] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                <h2 className="font-headline-md text-headline-md text-[var(--color-on-surface)]">Son Duyurular</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="glass-panel-dark rounded-[24px] p-8 hover:scale-[1.02] transition-transform duration-300 group fade-up" style={{ transitionDelay: '100ms' }}>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-[var(--color-primary)]">terminal</span>
                    </div>
                    <div className="inline-block bg-primary/10 text-[var(--color-primary)] font-label-md text-[12px] uppercase px-3 py-1 rounded-full mb-4">Yeni</div>
                    <h3 className="font-headline-sm text-headline-sm text-[var(--color-on-surface)] mb-4">Güz Dönemi Proje Başvuruları Başladı</h3>
                    <p className="font-body-md text-body-md text-[var(--color-on-surface-variant)] mb-6">Yapay zeka ve siber güvenlik alanındaki yeni projelerimiz için ekip arkadaşları arıyoruz.</p>
                    <Link href="#" className="inline-flex items-center text-[var(--color-primary)] font-label-md text-label-md hover:underline group-hover:gap-2 transition-all">
                        İncele <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                    </Link>
                </div>

                {/* Card 2 */}
                <div className="glass-panel-dark rounded-[24px] p-8 hover:scale-[1.02] transition-transform duration-300 group fade-up" style={{ transitionDelay: '200ms' }}>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-[var(--color-primary)]">groups</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-[var(--color-on-surface)] mb-4">Genel Kurul Toplantısı</h3>
                    <p className="font-body-md text-body-md text-[var(--color-on-surface-variant)] mb-6">Yönetim kurulu seçimi ve dönem planlaması için tüm üyelerimizin katılımı beklenmektedir.</p>
                    <Link href="#" className="inline-flex items-center text-[var(--color-primary)] font-label-md text-label-md hover:underline group-hover:gap-2 transition-all">
                        İncele <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                    </Link>
                </div>

                {/* Card 3 */}
                <div className="glass-panel-dark rounded-[24px] p-8 hover:scale-[1.02] transition-transform duration-300 group fade-up" style={{ transitionDelay: '300ms' }}>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-[var(--color-primary)]">code</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-[var(--color-on-surface)] mb-4">Hackathon Kayıtları</h3>
                    <p className="font-body-md text-body-md text-[var(--color-on-surface-variant)] mb-6">Bahar dönemi büyük hackathon etkinliğimiz için ön kayıtlar açıldı. Takımını kur!</p>
                    <Link href="#" className="inline-flex items-center text-[var(--color-primary)] font-label-md text-label-md hover:underline group-hover:gap-2 transition-all">
                        İncele <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}