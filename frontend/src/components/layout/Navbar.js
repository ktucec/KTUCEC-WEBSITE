import Link from 'next/link';

export default function Navbar() {
    return (
        <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-md border-b border-white/40 shadow-sm transition-all duration-300">
            <div className="flex justify-between items-center h-20 px-gutter max-w-container-max mx-auto">
                <Link
                    href="/"
                    className="font-display-lg text-headline-sm font-black text-primary tracking-tighter hover:scale-105 active:scale-95 transition-transform"
                >
                    KTUCEC
                </Link>
                <nav className="hidden md:flex gap-8">
                    <Link href="#duyurular" className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-medium hover:text-primary transition-colors hover:bg-white/10 px-3 py-2 rounded-md">
                        Duyurular
                    </Link>
                    <Link href="#etkinlikler" className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-medium hover:text-primary transition-colors hover:bg-white/10 px-3 py-2 rounded-md">
                        Etkinlikler
                    </Link>
                    <Link href="#bizkimiz" className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-medium hover:text-primary transition-colors hover:bg-white/10 px-3 py-2 rounded-md">
                        Biz Kimiz
                    </Link>
                </nav>
                <button className="hidden md:block bg-primary-container text-white px-6 py-2 rounded-xl font-label-md text-label-md uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-primary-container/20 hover:scale-105 active:scale-95">
                    Join Us
                </button>
                <button className="md:hidden text-primary">
                    <span className="material-symbols-outlined text-3xl">menu</span>
                </button>
            </div>
        </header>
    );
}