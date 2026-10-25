'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLang } from './i18n/LanguageProvider';
import SplitHeading from './fx/SplitHeading';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Tanıtım: kaydırdıkça kelime kelime aydınlanan bir açılış cümlesi ve dört cam hücrede dört kısa cevap.
// Kelimeleri React kendisi böler (SplitText değil), bu yüzden dil değişince sorunsuz yeniden çizilir.
export default function About() {
    const { d, lang } = useLang();
    const root = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                gsap.fromTo(
                    '.fill-word',
                    { opacity: 0.16 },
                    { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: '.fill-text', start: 'top 80%', end: 'bottom 45%', scrub: true } },
                );
            });
        },
        { scope: root, dependencies: [lang], revertOnUpdate: true },
    );

    return (
        <section ref={root} className="relative px-[var(--m)] py-28 lg:py-40" aria-labelledby="about-title">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
                <div className="lg:col-span-4">
                    <p className="kicker" data-io="clip-x">CODEWAVE</p>
                    <SplitHeading as="h2" id="about-title" className="h2 mt-5" text={d.aboutTitle} />
                </div>
                <p className="fill-text text-[clamp(1.5rem,3vw,2.6rem)] leading-[1.18] font-light tracking-[-0.035em] lg:col-span-8">
                    {d.aboutLead.split(' ').map((word, i) => (
                        <span key={`${lang}-${i}`} className="fill-word">
                            {word}{' '}
                        </span>
                    ))}
                </p>
            </div>

            <div className="about-grid mt-16 grid gap-3 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4" data-io-group>
                {d.aboutCols.map((col) => (
                    <div key={col.lead} className="about-cell glass glass-edge flex flex-col gap-4 rounded-[22px] p-6" data-io="tilt">
                        <span className="h-px w-10 bg-gradient-to-r from-blue to-green" aria-hidden="true" data-io="draw" data-io-delay="250" />
                        <h3 className="text-lg font-normal tracking-[-0.02em] text-ink">{col.lead.replace(/\.$/, '')}</h3>
                        <p className="text-[0.9375rem] leading-relaxed text-mute">{col.text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
