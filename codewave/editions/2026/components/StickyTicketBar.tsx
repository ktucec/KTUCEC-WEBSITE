'use client';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLang } from './i18n/LanguageProvider';
import LangToggle from './LangToggle';
import Price from './Price';

// Kahraman alanı ekrandan çıkınca görünen ince bilet şeridi: telefonda altta, geniş ekranda üstte.
// Aşağı okurken çekilir, yukarı kaydırınca geri gelir; bilet bölümü ya da alt bilgi görünürken hiç
// çıkmaz. Böylece okunan metnin ve formun üstünü kapatmaz.
export default function StickyTicketBar({ salesOpen }: { salesOpen: boolean }) {
    const { d } = useLang();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const hero = document.getElementById('top');
        const blockers = [document.getElementById('bilet'), document.querySelector('footer')].filter(Boolean) as Element[];
        if (!hero) return;

        let heroGone = false;
        let goingUp = false;
        let lastY = window.scrollY;
        let raf = 0;
        const blocked = new Set<Element>();
        const sync = () => setVisible(heroGone && goingUp && blocked.size === 0);

        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                const y = window.scrollY;
                if (Math.abs(y - lastY) < 8) return; // küçük titremeler yön değiştirmez
                goingUp = y < lastY;
                lastY = y;
                sync();
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        const heroIo = new IntersectionObserver(([e]) => {
            heroGone = !e.isIntersecting;
            sync();
        });
        const blockIo = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (e.isIntersecting) blocked.add(e.target);
                else blocked.delete(e.target);
            }
            sync();
        });
        heroIo.observe(hero);
        blockers.forEach((el) => blockIo.observe(el));
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            heroIo.disconnect();
            blockIo.disconnect();
        };
    }, []);

    return (
        <div className={`ticket-bar glass glass-edge${visible ? ' is-visible' : ''}`} inert={!visible}>
            <a className="mr-auto flex items-baseline gap-2 no-underline" href="#top">
                <span className="text-[0.9375rem] font-medium tracking-[-0.02em] text-ink">CODEWAVE</span>
                <span className="mono hidden text-[0.6875rem] tracking-[0.2em] text-green min-[380px]:inline">2026</span>
            </a>
            <nav className="hidden items-center gap-6 pr-2 lg:flex" aria-label="CODEWAVE 2026">
                <a className="nav-link" href="#konusmacilar">
                    {d.navSpeakers}
                </a>
                <a className="nav-link" href="#ulasim">
                    {d.navVenue}
                </a>
            </nav>
            <LangToggle />
            <a className="btn btn-primary btn-sm" href="#bilet" data-cursor={salesOpen ? d.buy : d.buySoon}>
                <span>{salesOpen ? d.buy : d.buySoon}</span>
                <span className="price">
                    <Price />
                </span>
                <ArrowRight className="arrow" size={16} aria-hidden="true" />
            </a>
        </div>
    );
}
