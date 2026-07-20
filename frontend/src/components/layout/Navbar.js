"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    const [scrollY, setScrollY] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mobil menü açıkken arka plan scroll'unu kilitle
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    // Şeffaf navbar davranışı yalnızca anasayfada geçerli.
    // Diğer sayfalarda navbar her zaman "scrolled" (normal, opak) görünümde kalır.
    const isScrolled = isHomePage ? scrollY > 200 : true;

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
                className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${isScrolled
                    ? 'bg-surface/70 backdrop-blur-md border-white/40 shadow-sm'
                    : 'bg-transparent border-transparent shadow-none'
                    }`}
            >
                <div className="flex justify-between items-center h-20 px-gutter max-w-container-max mx-auto">
                    <Link
                        href="/"
                        className={`font-display-lg text-headline-sm font-black tracking-tighter hover:scale-105 active:scale-95 transition-all duration-300 ${isScrolled ? 'text-primary' : 'text-white'
                            }`}
                    >
                        KTUCEC
                    </Link>

                    <nav className="hidden lg:flex gap-8">
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

                    <button className="hidden lg:block bg-primary-container text-white px-6 py-2 rounded-xl font-label-md text-label-md uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-primary-container/20 hover:scale-105 active:scale-95">
                        Bize Katılın!
                    </button>

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

            {/* Mobil sidebar - sağdan içeri, 1 saniyelik animasyon */}
            <aside
                className={`fixed top-0 right-0 h-full w-72 max-w-[80%] z-[70] bg-surface shadow-2xl lg:hidden
                transition-transform duration-1000 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex justify-between items-center h-20 px-gutter border-b border-outline-variant">
                    <span className="font-display-lg text-headline-sm font-black text-primary tracking-tighter">
                        KTUCEC
                    </span>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-primary"
                        aria-label="Menüyü kapat"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>

                <nav className="flex flex-col gap-2 p-gutter">
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
                    <button className="mt-4 bg-primary-container text-white px-6 py-3 rounded-xl font-label-md text-label-md uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-primary-container/20">
                        Bize Katılın!
                    </button>
                </nav>
            </aside>
        </>
    );
}