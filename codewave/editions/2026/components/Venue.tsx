'use client';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { CONTACT, EVENT } from '@/editions/2026/event';
import { useLang } from './i18n/LanguageProvider';
import SplitHeading from './fx/SplitHeading';
import campusWalk from '@/public/editions/2026/place/ktu-kampus-yol.jpg';
import campusPuddle from '@/public/editions/2026/place/ktu-kampus-yansima.jpg';
import campusBloom from '@/public/editions/2026/place/ktu-kampus-bahar.jpg';

// Yer ve iletişim: üç kampüs fotoğrafı perde gibi açılır; adres ve iletişim ince, büyük satırlar.
export default function Venue() {
    const { d } = useLang();

    const rows = [
        { href: EVENT.venue.mapsUrl, text: EVENT.venue.short, meta: d.venueDirections, external: true },
        { href: undefined, text: `${EVENT.venue.campus}, ${EVENT.venue.city}`, meta: 'TR-61' },
        { href: `tel:${CONTACT.phone}`, text: CONTACT.phoneDisplay, meta: d.venuePhoneLabel },
        { href: `mailto:${CONTACT.email}`, text: d.venueWrite, meta: CONTACT.email },
    ];

    return (
        <section id="ulasim" className="relative overflow-x-clip px-[var(--m)] py-28 lg:py-40" aria-labelledby="venue-title">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-6">
                <div className="lg:col-span-5">
                    <p className="kicker" data-io="clip-x">{d.navVenue}</p>
                    <SplitHeading as="h2" id="venue-title" className="h2 mt-5" text={d.venueTitle} />
                </div>
                <div className="venue-photos grid grid-cols-3 gap-2 lg:col-span-7" data-io-group>
                    {[
                        { src: campusWalk, alt: d.venuePhotoA },
                        { src: campusBloom, alt: d.venuePhotoC },
                        { src: campusPuddle, alt: d.venuePhotoB },
                    ].map((p, i) => (
                        <div key={i} className="venue-photo relative aspect-[3/4] overflow-hidden rounded-[20px] bg-deep" data-io="clip">
                            <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 20vw, 33vw" placeholder="blur" className="duotone object-cover opacity-90 transition-[filter,transform] duration-700 hover:scale-105 hover:filter-none" />
                            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue/40 to-transparent mix-blend-color" aria-hidden="true" />
                        </div>
                    ))}
                </div>
            </div>

            <ul className="venue-rows mt-16 border-t border-[var(--line)] lg:mt-24" role="list" data-io-group>
                {rows.map((row, ri) => {
                    const inner = (
                        <>
                            <span className="text-[clamp(1.75rem,5vw,4.25rem)] leading-[1.05] font-extralight tracking-[-0.045em] transition-colors duration-500 group-hover:text-green">{row.text}</span>
                            <span className="mono flex shrink-0 items-center gap-2 text-xs tracking-[0.16em] text-mute uppercase">
                                {row.meta}
                                {row.href && <ArrowUpRight size={16} aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />}
                            </span>
                        </>
                    );
                    return (
                        <li key={row.text} className="venue-row border-b border-[var(--line)]" data-io={ri % 2 ? 'right' : 'left'}>
                            {row.href ? (
                                <a
                                    href={row.href}
                                    {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                    className="group relative flex flex-col gap-2 py-6 no-underline sm:flex-row sm:items-center sm:justify-between sm:py-8"
                                >
                                    <span className="absolute inset-x-0 bottom-[-1px] h-px origin-left scale-x-0 bg-gradient-to-r from-blue to-green transition-transform duration-700 group-hover:scale-x-100" aria-hidden="true" />
                                    {inner}
                                </a>
                            ) : (
                                <div className="flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between sm:py-8">{inner}</div>
                            )}
                        </li>
                    );
                })}
            </ul>

            <p className="mt-8 text-[0.9375rem] text-mute" data-io="blur">
                {d.sponsorLine}:{' '}
                <a href={`mailto:${CONTACT.sponsorEmail}`} className="text-ink underline decoration-green/60">
                    {CONTACT.sponsorEmail}
                </a>
            </p>
        </section>
    );
}
