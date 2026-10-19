"use client";

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const navLinks = [
    { href: '/', label: 'Anasayfa' },
    { href: '/duyurular', label: 'Duyurular' },
    { href: '/etkinlikler', label: 'Etkinlikler' },
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/iletisim', label: 'İletişim' },
];

function isActivePath(pathname, href) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
}

function CodewaveButton({ className = "" }) {
    return (
        <Link
            href="https://codewave.ktucec.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`codewave-button group !py-2.5 !px-5 !text-[13px] ${className}`}
        >
            <span className="codewave-bg"></span>
            <span className="codewave-shine"></span>
            <span className="codewave-glass"></span>
            <span className="codewave-text">
                CODEWAVE 2026
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </span>
        </Link>
    );
}

export default function Navbar() {
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const isEventsPage = pathname === '/etkinlikler';

    const [scrollY, setScrollY] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

    const linkRefs = useRef([]);
    const pillRef = useRef(null);

    // Etkinlikler sayfasında aşağı kayınca navbar gizlenir, yukarı kayınca geri gelir (mevcut davranış)
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
                    if (accumulatedDown >= 70) setIsVisible(false);
                } else if (delta < 0) {
                    accumulatedDown = 0;
                    accumulatedUp += Math.abs(delta);
                    if (accumulatedUp >= 40) setIsVisible(true);
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
        setIsMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    useEffect(() => {
        if (!isMenuOpen) return;
        const onKey = (e) => e.key === 'Escape' && setIsMenuOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isMenuOpen]);

    // Ana sayfanın en üstünde (koyu hero'nun üzerinde) şeffaf ve beyaz yazılı
    const isOverHero = isHomePage && scrollY < 80;

    const activeIndex = navLinks.findIndex((l) => isActivePath(pathname, l.href));
    const targetIndex = hoverIndex ?? activeIndex;

    // Kayan kırmızı gösterge: üzerine gelinen ya da aktif linkin altına kayar
    const measure = useCallback(() => {
        const el = linkRefs.current[targetIndex];
        const pill = pillRef.current;
        if (!el || !pill || targetIndex < 0) {
            setIndicator((prev) => ({ ...prev, visible: false }));
            return;
        }
        const pr = pill.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        setIndicator({ left: r.left - pr.left, width: r.width, visible: true });
    }, [targetIndex]);

    useLayoutEffect(() => {
        measure();
    }, [measure, pathname]);

    useEffect(() => {
        window.addEventListener('resize', measure);
        document.fonts?.ready.then(measure);
        return () => window.removeEventListener('resize', measure);
    }, [measure]);

    const headerHidden = isEventsPage && !isVisible;

    return (
        <>
            <header
                className={`fixed top-0 inset-x-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${headerHidden ? '-translate-y-[120%]' : 'translate-y-0'}`}
            >
                <div className={`mx-auto max-w-container-max px-3 sm:px-gutter transition-[padding] duration-500 ${isOverHero ? 'pt-5' : 'pt-3'}`}>
                    <div
                        className={`flex items-center justify-between gap-4 h-16 pl-3 pr-2 sm:pl-4 rounded-full transition-all duration-500 ${isOverHero
                            ? 'bg-transparent border border-transparent'
                            : 'surface-glass'
                            }`}
                    >
                        {/* Logo: simge 180° simetrik, üzerine gelince döner */}
                        <Link href="/" className="group flex items-center gap-2.5 shrink-0" aria-label="KTÜCEC ana sayfa">
                            <Image
                                src="/logo.png"
                                alt=""
                                width={36}
                                height={36}
                                priority
                                className="rounded-full transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-180"
                            />
                            <span className={`font-display text-[1.35rem] font-extrabold tracking-[-0.04em] transition-colors duration-500 ${isOverHero ? 'text-white' : 'text-ink'}`} style={{ fontStretch: '80%' }}>
                                KTUCEC
                            </span>
                        </Link>

                        {/* Masaüstü menü */}
                        <nav
                            ref={pillRef}
                            className="nav-pill hidden lg:flex"
                            onMouseLeave={() => setHoverIndex(null)}
                            aria-label="Ana menü"
                        >
                            <span
                                className="nav-indicator"
                                style={{ left: indicator.left, width: indicator.width, opacity: indicator.visible ? 1 : 0 }}
                                aria-hidden="true"
                            />
                            {navLinks.map((link, i) => {
                                const lit = i === targetIndex;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        ref={(el) => (linkRefs.current[i] = el)}
                                        onMouseEnter={() => setHoverIndex(i)}
                                        onFocus={() => setHoverIndex(i)}
                                        onBlur={() => setHoverIndex(null)}
                                        aria-current={i === activeIndex ? 'page' : undefined}
                                        className={`nav-link ${lit ? 'text-white' : isOverHero ? 'text-white/85' : 'text-ink/75'}`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <ThemeToggle className={isOverHero ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-ink/5'} />
                            <div className="hidden lg:block"><CodewaveButton /></div>
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className={`lg:hidden grid place-items-center w-11 h-11 rounded-full transition-colors ${isOverHero ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-ink/5'}`}
                                aria-label="Menüyü aç"
                                aria-expanded={isMenuOpen}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                                    <line x1="4" y1="8" x2="20" y2="8" />
                                    <line x1="9" y1="16" x2="20" y2="16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobil tam ekran menü: kırmızı perde aşağıdan yukarı açılır, linkler sırayla gelir */}
            <div
                className={`fixed inset-0 z-[70] lg:hidden ${isMenuOpen ? 'menu-open pointer-events-auto' : 'pointer-events-none'}`}
                aria-hidden={!isMenuOpen}
            >
                <div
                    className="absolute inset-0 bg-brand transition-[clip-path] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
                    style={{ clipPath: isMenuOpen ? 'circle(150% at calc(100% - 44px) 44px)' : 'circle(0% at calc(100% - 44px) 44px)' }}
                />
                <div
                    className="absolute inset-0 bg-paper transition-[clip-path] duration-700 delay-100 ease-[cubic-bezier(0.65,0,0.35,1)]"
                    style={{ clipPath: isMenuOpen ? 'circle(150% at calc(100% - 44px) 44px)' : 'circle(0% at calc(100% - 44px) 44px)' }}
                />

                <div className={`relative h-full flex flex-col px-6 pt-5 pb-8 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 delay-200' : 'opacity-0 invisible'}`}>
                    <div className="flex items-center justify-between h-16">
                        <span className="font-display text-[1.35rem] font-extrabold tracking-[-0.04em] text-ink" style={{ fontStretch: '80%' }}>KTUCEC</span>
                        <div className="flex items-center gap-1">
                            <ThemeToggle className="text-ink hover:bg-ink/5" />
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="grid place-items-center w-11 h-11 rounded-full text-ink hover:bg-ink/5 transition-transform duration-500 hover:rotate-90"
                                aria-label="Menüyü kapat"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <nav className="flex flex-col mt-8 gap-1" aria-label="Mobil menü">
                        {navLinks.map((link, i) => {
                            const active = i === activeIndex;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    tabIndex={isMenuOpen ? 0 : -1}
                                    className={`mobile-link group flex items-baseline gap-3 py-2 font-display font-extrabold tracking-[-0.04em] text-[2.6rem] leading-none ${active ? 'text-brand' : 'text-ink'}`}
                                    style={{ transitionDelay: isMenuOpen ? `${250 + i * 70}ms` : '0ms', fontStretch: '80%' }}
                                >
                                    <span className="transition-transform duration-300 group-active:translate-x-2">{link.label}</span>
                                    {active && <span className="ping-dot translate-y-[-0.4rem]" aria-hidden="true" />}
                                </Link>
                            );
                        })}
                    </nav>

                    <div
                        className="mobile-link mt-auto"
                        style={{ transitionDelay: isMenuOpen ? `${250 + navLinks.length * 70}ms` : '0ms' }}
                    >
                        <CodewaveButton className="w-full !py-3.5" />
                    </div>
                </div>
            </div>
        </>
    );
}
