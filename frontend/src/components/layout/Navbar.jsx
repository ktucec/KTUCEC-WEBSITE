"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const isEventsPage = pathname === '/etkinlikler';

    const [scrollY, setScrollY] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        let lastScrollY = window.scrollY;
        let accumulatedDown = 0;
        let accumulatedUp = 0;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollY(currentScrollY);

            if (isEventsPage) {
                const delta = currentScrollY - lastScrollY;

                if (currentScrollY <= 0) {
                    setIsVisible(true);
                    accumulatedDown = 0;
                    accumulatedUp = 0;
                } else if (delta > 0) {
                    accumulatedUp = 0;
                    accumulatedDown += delta;
                    if (accumulatedDown >= 70) {
                        setIsVisible(false);
                    }
                } else if (delta < 0) {
                    accumulatedDown = 0;
                    accumulatedUp += Math.abs(delta);
                    if (accumulatedUp >= 40) {
                        setIsVisible(true);
                    }
                }
                lastScrollY = currentScrollY;
            } else {
                setIsVisible(true);
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isEventsPage]);

    useEffect(() => {
        setIsVisible(true);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const isScrolled = isHomePage ? scrollY > 120 : true;

    const navLinks = [
        { href: '/', label: 'Anasayfa' },
        { href: '/duyurular', label: 'Duyurular' },
        { href: '/etkinlikler', label: 'Etkinlikler' },
        { href: '/hakkimizda', label: 'Hakkımızda' },
        { href: '/iletisim', label: 'İletişim' },
    ];

    return (
        <>
            <header
                className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ease-in-out ${isEventsPage && !isVisible ? '-translate-y-full' : 'translate-y-0'
                    } ${isScrolled
                        ? 'bg-surface/70 backdrop-blur-md border-white/40 shadow-sm'
                        : 'bg-transparent border-transparent shadow-none'
                    }`}
            >
                <div className="flex justify-between items-center h-20 px-gutter max-w-container-max mx-auto w-full">

                    {/* LOGO: Kaydırılmadığında alan kaplamayı bırakır, menünün merkeze oturmasını sağlar */}
                    <Link
                        href="/"
                        className={`font-display-lg text-headline-sm font-black tracking-tighter hover:scale-105 active:scale-95 transition-all duration-700 ease-in-out whitespace-nowrap overflow-hidden ${isScrolled
                                ? 'max-w-[200px] opacity-100 text-primary translate-x-0 mr-auto'
                                : 'max-w-0 opacity-0 -translate-x-5 pointer-events-none'
                            }`}
                    >
                        KTUCEC
                    </Link>

                    {/* MASAÜSTÜ MENÜ VE BUTON (Tek Bir Ortalanmış/Hizalanmış Kapsayıcı) */}
                    <div className={`hidden lg:flex items-center gap-10 transition-all duration-700 ease-in-out ${isScrolled ? '' : 'mx-auto'}`}>
                        <nav className="flex gap-8">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`
                                            font-label-md text-label-md uppercase tracking-wider 
                                            font-medium transition-all duration-300 
                                            px-3 py-2 rounded-md
                                            ${isActive
                                                ? isScrolled
                                                    ? 'bg-white/10 text-primary'
                                                    : 'bg-white/10 text-white'
                                                : isScrolled
                                                    ? 'text-on-surface-variant hover:bg-white/10 hover:text-primary'
                                                    : 'text-white hover:bg-white/10'
                                            }
                                            ${link.href === '/' ? 'hidden xl:block' : ''}
                                        `}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* YENİ CODEWAVE BUTONU (Sadece class'lar var, stiller globals.css'te) */}
                        <Link
                            href="https://codewave.ktucec.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="codewave-button group"
                        >
                            <span className="codewave-bg"></span>
                            <span className="codewave-shine"></span>
                            <span className="codewave-glass"></span>
                            <span className="codewave-text">
                                CODEWAVE 2026
                                <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </span>
                        </Link>
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className={`lg:hidden transition-colors duration-300 ${isScrolled ? 'text-primary' : 'text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-3xl">menu</span>
                    </button>
                </div>
            </header>

            {/* Mobil overlay */}
            <div
                onClick={() => setIsMenuOpen(false)}
                className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            />

            {/* Mobil sidebar */}
            <aside
                className={`fixed top-0 right-0 h-full w-72 max-w-[80%] z-[70] bg-surface shadow-2xl lg:hidden flex flex-col
                transition-transform duration-1000 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex justify-between items-center h-20 px-gutter border-b border-outline-variant shrink-0">
                    <span className="font-display-lg text-headline-sm font-black text-primary tracking-tighter">
                        KTUCEC
                    </span>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-primary hover:rotate-90 transition-transform duration-300"
                        aria-label="Menüyü kapat"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>

                <div className="flex flex-col justify-between h-full p-gutter overflow-y-auto">
                    <nav className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-medium hover:text-primary hover:bg-primary/10 transition-colors px-3 py-3 rounded-md"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* MOBİL SIDEBAR: YENİ CODEWAVE BUTONU */}
                    <Link
                        href="https://codewave.ktucec.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-8 codewave-button group w-full"
                    >
                        <span className="codewave-bg"></span>
                        <span className="codewave-shine"></span>
                        <span className="codewave-glass"></span>
                        <span className="codewave-text">
                            CODEWAVE 2026
                            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </span>
                    </Link>
                </div>
            </aside>
        </>
    );
}