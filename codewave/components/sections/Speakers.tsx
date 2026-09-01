'use client';
import { useCodewave } from '@/components/context/CodewaveContext';
import Reveal from '@/components/ui/Reveal';

export default function Speakers() {
    const { d, lang } = useCodewave();

    // Rollerde dil desteği, bağımsız görseller ve linkedin link alanları eklendi
    const speakerData = [
        {
            name: 'Mustafa Mert Kısa',
            role: lang === 'TR' ? 'Backend Geliştirici' : 'Backend Developer',
            company: 'Letgo',
            image: '/codewave/mustafamertkisa.jpeg',
            linkedin: 'https://www.linkedin.com/in/mustafamertkisa/'
        },
        {
            name: 'Muratcan İğdeli',
            role: lang === 'TR' ? 'Yapay Zekâ ve Üniversitede Girişimcilik' : 'Artificial Intelligence and Entrepreneurship in Universities',
            company: 'VC Ally',
            image: '/codewave/muratcanigdeli.jpeg',
            linkedin: 'https://www.linkedin.com/in/muratcanigdeli/'
        },
        {
            name: 'Metehan Bulut',
            role: lang === 'TR' ? 'Siber Güvenlik Uzmanı' : 'Cybersecurity Expert',
            company: 'CTI Academy',
            image: '/codewave/metehanbulut.jpeg',
            linkedin: 'https://www.linkedin.com/in/metehanbulut/'
        },
        {
            name: 'Doğukaan Kılıçarslan',
            role: lang === 'TR' ? 'Kıdemli iOs Yazılım Mühendisi' : 'Senior iOS Software Engineer',
            company: 'Migros One',
            image: '/codewave/dogukaankilicarslan.jpeg',
            linkedin: 'https://www.linkedin.com/in/dogukaan-kilicarslan/'
        }
    ];

    return (
        <section id="speakers" className="section">
            <Reveal>
                <p className="label">03 / THE VOICES</p>
                <h2 className="speakers-heading">{d.speakers}</h2>
            </Reveal>

            <div className="speakers">
                {speakerData.map((s, i) => (
                    <Reveal key={s.name}>
                        <article className="speaker-card group">
                            {/* Premium 1:1 Kare Resim Alanı */}
                            <div className="portrait-container">
                                <div
                                    className="portrait-bg"
                                    style={{ backgroundImage: `url(${s.image})` }}
                                />

                                <div className="portrait-overlay">
                                    <a
                                        href={s.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-btn"
                                        aria-label={`${s.name} LinkedIn Profile`}
                                    >
                                        {/* Lucide paketi hatasını atlamak için Native SVG LinkedIn İkonu */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                            <rect width="4" height="12" x="2" y="9" />
                                            <circle cx="4" cy="4" r="2" />
                                        </svg>
                                    </a>
                                </div>

                                <div className="portrait-border" />
                            </div>

                            {/* Premium Fontlu Konuşmacı Bilgileri */}
                            <div className="speaker-info">
                                <p className="label">0{i + 1} / {lang === 'TR' ? 'KONUŞMACI' : 'SPEAKER'}</p>
                                <h3 className="speaker-name">{s.name}</h3>
                                <span className="speaker-role">{s.role}</span>
                                <small className="speaker-company">{s.company}</small>
                            </div>
                        </article>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}