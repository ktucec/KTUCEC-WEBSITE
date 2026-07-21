import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full py-8 md:py-12 bg-surface-container-lowest border-t border-outline-variant/10 mt-12 md:mt-24 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left px-gutter max-w-container-max mx-auto gap-6 md:gap-8">
                {/* Logo */}
                <div className="font-display-lg text-xl sm:text-2xl md:text-headline-sm font-bold text-primary">
                    KTUCEC
                </div>

                {/* Footer Links */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                    <Link
                        href="#"
                        className="text-secondary hover:text-primary transition-colors font-body-md text-xs sm:text-sm md:text-body-md hover:opacity-80 duration-200"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        href="#"
                        className="text-secondary hover:text-primary transition-colors font-body-md text-xs sm:text-sm md:text-body-md hover:opacity-80 duration-200"
                    >
                        Terms of Service
                    </Link>
                    <Link
                        href="#"
                        className="text-secondary hover:text-primary transition-colors font-body-md text-xs sm:text-sm md:text-body-md hover:opacity-80 duration-200"
                    >
                        Contact
                    </Link>
                </div>

                {/* Copyright */}
                <div className="font-body-md text-xs sm:text-sm md:text-body-md text-secondary">
                    © {new Date().getFullYear()} KTUCEC. Engineering the Future.
                </div>
            </div>
        </footer>
    );
}