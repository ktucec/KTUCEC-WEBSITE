'use client';
import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLang } from './i18n/LanguageProvider';
import trabzon from '@/public/editions/2026/place/trabzon-uzaydan.jpg';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Varış: Trabzon (NASA, ISS047-E-118739, kamu malı). Fotoğraf çift tonlu: gece mavisi üzerinde parlaklık,
// üstünden maviden yeşile ince bir ışık. Kaydırınca küçük bir pencereden tam genişliğe açılır.
export default function Destination() {
    const { d } = useLang();
    const root = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add('(prefers-reduced-motion: no-preference)', () => {
                gsap.fromTo(
                    '.dest-frame',
                    { clipPath: 'inset(18% 22% 18% 22% round 40px)' },
                    { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top 15%', scrub: true } },
                );
                gsap.fromTo('.dest-img', { scale: 1.25, yPercent: -4 }, { scale: 1, yPercent: 4, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
            });
        },
        { scope: root },
    );

    return (
        <figure ref={root} className="relative m-0 py-10">
            <div className="dest-frame relative h-[62svh] overflow-hidden bg-deep lg:h-[88svh]">
                <Image src={trabzon} alt={d.destinationAlt} sizes="100vw" placeholder="blur" className="dest-img duotone h-full w-full object-cover object-[50%_62%] opacity-80" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue/45 via-transparent to-green/25 mix-blend-color" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/60" aria-hidden="true" />
                <figcaption className="absolute inset-x-[var(--m)] bottom-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <span className="text-[clamp(2.5rem,7vw,6rem)] leading-[0.9] font-extralight tracking-[-0.06em]" data-io="left">{d.destinationTitle}</span>
                    <span className="mono max-w-sm text-xs leading-relaxed tracking-[0.1em] text-mute uppercase sm:text-right" data-io="right" data-io-delay="150">{d.destinationCaption}</span>
                </figcaption>
            </div>
        </figure>
    );
}
