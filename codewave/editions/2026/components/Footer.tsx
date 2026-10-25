'use client';
import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CONTACT, PHOTO_CREDITS, SOCIALS } from '@/editions/2026/event';
import { useLang } from './i18n/LanguageProvider';
import Magnetic from './fx/Magnetic';

// Kapanış: dış hatlı dev CODEWAVE; gradyan dolgu yalnızca imlecin taşıdığı ışık halkasında görünür.
// Dokunmatik cihazda halka ortada sabit durur.
export default function Footer() {
    const { d, lang } = useLang();
    const word = useRef<HTMLDivElement>(null);

    const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const el = word.current;
        if (!el || e.pointerType === 'touch') return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--sx', `${e.clientX - r.left}px`);
        el.style.setProperty('--sy', `${e.clientY - r.top}px`);
    };

    return (
        <footer className="relative overflow-hidden border-t border-[var(--line)] px-[var(--m)] pt-20 pb-8">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12" data-io-group>
                <div className="lg:col-span-3" data-io="rise">
                    <p className="kicker">{d.footerEvent}</p>
                    <p className="mt-4 text-ink">CODEWAVE 2026</p>
                    <p className="mono mt-1 text-sm text-mute">{lang === 'TR' ? '08.12.2026 · 10:00' : '08.12.2026 · 10:00 GMT+3'}</p>
                    <p className="mt-1 text-sm text-mute">Osman Turan Kongre Merkezi, Trabzon</p>
                </div>
                <nav className="lg:col-span-3" aria-label={d.footerPage} data-io="rise">
                    <p className="kicker">{d.footerPage}</p>
                    <ul className="mt-2" role="list">
                        {[
                            ['#konusmacilar', d.navSpeakers],
                            ['#bilet', d.navTicket],
                            ['#ulasim', d.navVenue],
                        ].map(([href, text]) => (
                            <li key={href}>
                                <a className="nav-link inline-flex min-h-11 items-center" href={href}>
                                    {text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="lg:col-span-3" data-io="rise">
                    <p className="kicker">{d.footerFollow}</p>
                    <ul className="mt-2" role="list">
                        {SOCIALS.map((s) => (
                            <li key={s.label}>
                                <a className="nav-link inline-flex min-h-11 items-center" href={s.href} target="_blank" rel="noopener noreferrer">
                                    {s.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="lg:col-span-3" data-io="rise">
                    <p className="kicker">{d.footerContact}</p>
                    <ul className="mt-2" role="list">
                        <li>
                            <a className="nav-link inline-flex min-h-11 items-center normal-case" href={`mailto:${CONTACT.email}`}>
                                {CONTACT.email}
                            </a>
                        </li>
                        <li>
                            <a className="nav-link inline-flex min-h-11 items-center" href={`tel:${CONTACT.phone}`}>
                                {CONTACT.phoneDisplay}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mt-14" data-io="scale">
                <Magnetic>
                    <a className="btn btn-ghost" href="/2025" data-cursor="2025">
                        <span>{d.footer2025}</span>
                        <ArrowUpRight className="arrow" size={18} aria-hidden="true" />
                    </a>
                </Magnetic>
            </div>

            <div ref={word} onPointerMove={onMove} className="relative mt-16 select-none" aria-hidden="true" data-io="tilt">
                <p className="text-center text-[21.5vw] leading-[0.78] font-thin tracking-[-0.08em] text-transparent [-webkit-text-stroke:1px_rgb(150_180_225/0.25)]">CODEWAVE</p>
                <p className="spot grad-text absolute inset-0 text-center text-[21.5vw] leading-[0.78] font-thin tracking-[-0.08em]">CODEWAVE</p>
            </div>

            <div className="mt-10 grid gap-2 text-xs text-faint" data-io="blur">
                <p>© 2026 KTÜCEC · {d.footerLegal}</p>
                <p className="leading-relaxed">
                    {d.footerCredits}:{' '}
                    {PHOTO_CREDITS.map((c, i) => (
                        <span key={c.href}>
                            {i > 0 && ' · '}
                            <a href={c.href} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line-hi)] hover:text-mute">
                                {c.label}
                            </a>
                            , {c.author}, {c.licence}
                        </span>
                    ))}
                </p>
            </div>
        </footer>
    );
}
