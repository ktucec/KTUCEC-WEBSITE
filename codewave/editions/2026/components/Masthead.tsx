import { T } from './i18n/LanguageProvider';
import LangToggle from './LangToggle';
import Magnetic from './fx/Magnetic';

// Kahramanın üstüne oturan ince şerit: marka solda, mono bağlantılar ve tek eylem sağda. Sabit değil;
// kaydırınca yerini yüzen bilet şeridi alır.
export default function Masthead({ salesOpen }: { salesOpen: boolean }) {
    return (
        <header className="absolute inset-x-0 top-0 z-30 flex items-center gap-4 px-[var(--m)] pt-5">
            <a className="skip" href="#icerik">
                <T k="skip" />
            </a>
            <a className="mr-auto flex items-baseline gap-3 no-underline" href="/#top" aria-label="CODEWAVE 2026, KTÜCEC">
                <span className="text-lg font-medium tracking-[-0.03em] text-ink">CODEWAVE</span>
                <span className="mono hidden text-[0.6875rem] tracking-[0.2em] text-faint min-[380px]:inline">KTÜCEC</span>
            </a>
            <nav className="hidden items-center gap-8 lg:flex" aria-label="CODEWAVE 2026">
                <a className="nav-link" href="/#konusmacilar">
                    <T k="navSpeakers" />
                </a>
                <a className="nav-link" href="/#bilet">
                    <T k="navTicket" />
                </a>
                <a className="nav-link" href="/#ulasim">
                    <T k="navVenue" />
                </a>
            </nav>
            <LangToggle />
            <Magnetic>
                <a className="btn btn-ghost btn-sm" href="/#bilet">
                    <T k={salesOpen ? 'buy' : 'buySoon'} />
                </a>
            </Magnetic>
        </header>
    );
}
