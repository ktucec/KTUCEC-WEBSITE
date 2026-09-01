'use client';
import { useCodewave } from '@/components/context/CodewaveContext';
import Reveal from '@/components/ui/Reveal';

const baseSponsors = [
    'VESTEL', 'KAIRU', 'ÖĞRENCİ KARİYERİ', 'COLOMBIA COFFEE', 'COFFEE AND STUDY'
];

// Akıcılığı kusursuz yapmak için array'i 4 ile çarpıp tek bir listeye düzleştiriyoruz (flatten).
const extendedSponsors = Array(4).fill(baseSponsors).flat();

export default function Sponsors() {
    const { d } = useCodewave();

    return (
        <section className="marquee-section">
            {/* Sadece Başlık Kısmına Ortalanmış Reveal */}
            <div className="section" style={{ paddingBottom: '0', paddingTop: '80px' }}>
                <Reveal>
                    <p className="label">04 / BACKED BY</p>
                    <h2 className="sponsors-heading">{d.sponsors}</h2>
                </Reveal>
            </div>

            {/* Premium Kayan Bant (Marquee) */}
            <div className="premium-marquee-wrapper">
                {/* Sol ve Sağ Kenardaki Fade (Sis) Efektleri */}
                <div className="marquee-fade-left"></div>
                <div className="marquee-fade-right"></div>

                <div className="premium-marquee-track">
                    <div className="premium-marquee-content">
                        {extendedSponsors.map((sponsor, idx) => (
                            <div key={idx} className="sponsor-badge">
                                <span className="sponsor-name">{sponsor}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}