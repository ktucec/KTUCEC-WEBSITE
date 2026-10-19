"use client";

import Link from 'next/link';

const pages = [
    { href: '/duyurular', label: 'Duyurular' },
    { href: '/etkinlikler', label: 'Etkinlikler' },
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/iletisim', label: 'İletişim' },
];

const socials = [
    { href: 'https://instagram.com/ktucec', label: 'Instagram' },
    { href: 'https://www.linkedin.com/in/ktucec/', label: 'LinkedIn' },
    { href: 'mailto:ktucec@ceng.ktu.edu.tr', label: 'E-posta' },
    { href: 'https://codewave.ktucec.com', label: 'CODEWAVE 2026' },
];

export default function Footer() {
    const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <footer className="relative z-10 mt-auto overflow-hidden border-t border-line bg-card">
            <div className="max-w-container-max mx-auto px-5 sm:px-gutter pt-16 md:pt-20">
                <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-12">
                    <div>
                        <p className="font-display text-3xl md:text-[2.6rem] font-extrabold tracking-[-0.04em] leading-[1.02] text-ink max-w-md">
                            Bir sonraki projede seni de görmek isteriz.
                        </p>
                        <Link href="/iletisim" className="btn btn-primary mt-7">
                            Bize yaz
                            <span className="material-symbols-outlined btn-icon text-[20px]" aria-hidden="true">arrow_outward</span>
                        </Link>
                    </div>

                    <nav aria-label="Sayfalar">
                        <p className="text-sm text-muted mb-4">Sayfalar</p>
                        <ul className="space-y-2.5">
                            {pages.map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className="group inline-flex items-center gap-2 text-lg font-semibold text-ink hover:text-brand transition-colors">
                                        <span className="w-0 -mr-2 h-[2px] bg-brand transition-all duration-300 group-hover:w-4 group-hover:mr-0" aria-hidden="true" />
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div>
                        <p className="text-sm text-muted mb-4">Bizi takip et</p>
                        <ul className="space-y-2.5">
                            {socials.map((l) => (
                                <li key={l.href}>
                                    <a
                                        href={l.href}
                                        target={l.href.startsWith('http') ? '_blank' : undefined}
                                        rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                        className="group inline-flex items-center gap-1.5 text-lg font-semibold text-ink hover:text-brand transition-colors"
                                    >
                                        {l.label}
                                        <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">arrow_outward</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Dev logo yazısı: her harf üzerine gelince zıplayıp kırmızıya boyanır */}
                <div className="footer-word mt-16 md:mt-20 -mb-[0.12em] select-none whitespace-nowrap" aria-hidden="true">
                    {'KTUCEC'.split('').map((c, i) => (
                        <span key={i}>{c}</span>
                    ))}
                </div>
            </div>

            <div className="relative border-t border-line bg-card">
                <div className="max-w-container-max mx-auto px-5 sm:px-gutter py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
                    <p>© {new Date().getFullYear()} KTÜ Bilgisayar Mühendisliği Kulübü</p>
                    <button
                        onClick={scrollTop}
                        className="group inline-flex items-center gap-2 font-semibold text-ink hover:text-brand transition-colors cursor-pointer"
                    >
                        Yukarı çık
                        <span className="grid place-items-center w-8 h-8 rounded-full border border-line transition-all duration-300 group-hover:bg-brand group-hover:border-brand group-hover:text-white group-hover:-translate-y-1">
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_upward</span>
                        </span>
                    </button>
                </div>
            </div>
        </footer>
    );
}
