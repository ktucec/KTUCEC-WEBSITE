'use client';
import { useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';
import { useLang } from './i18n/LanguageProvider';

// Kahramandaki "Bilet al" düğmesi ekranın üstüne doğru çıkıp görünmez olunca sağ üstte küçük bir bilet düğmesi belirir
// (fiyatsız). Yukarı çıkıp kahraman düğmesi tekrar görününce kaybolur. Bilet bölümü ya da alt bilgi görünürken de
// çıkmaz; orada zaten bilet alma alanı var.
export default function FloatingTicketButton({ salesOpen }: { salesOpen: boolean }) {
    const { d } = useLang();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const cta = document.getElementById('hero-buy');
        const blockers = [document.getElementById('bilet'), document.querySelector('footer')].filter(Boolean) as Element[];
        if (!cta) return;

        let passed = false;
        const blocked = new Set<Element>();
        const sync = () => setVisible(passed && blocked.size === 0);

        // Düğme yalnızca yukarıdan çıktıysa (aşağı kaydırıldıysa) sayılır; ilk ekranda altta kalan düğme için çıkmaz.
        const ctaIo = new IntersectionObserver(([e]) => {
            passed = !e.isIntersecting && e.boundingClientRect.top < 0;
            sync();
        });
        const blockIo = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (e.isIntersecting) blocked.add(e.target);
                else blocked.delete(e.target);
            }
            sync();
        });
        ctaIo.observe(cta);
        blockers.forEach((el) => blockIo.observe(el));
        return () => {
            ctaIo.disconnect();
            blockIo.disconnect();
        };
    }, []);

    const label = salesOpen ? d.buy : d.buySoon;
    return (
        <a className={`btn btn-primary btn-sm float-buy${visible ? ' is-visible' : ''}`} href="#bilet" inert={!visible} aria-label={label} data-cursor={label}>
            <Ticket size={18} aria-hidden="true" />
            <span className="float-buy-label">{label}</span>
        </a>
    );
}
