'use client';
import { createElement } from 'react';
import { Globe2, Radio, Users, Zap, CircleUserRound, Mail } from 'lucide-react';
import { useCodewave } from '@/editions/2025/components/context/CodewaveContext';

const ICONS = [Radio, Users, Zap, CircleUserRound, Zap, Mail];

export default function Navbar() {
    const { lang, setLang, active, nav, d } = useCodewave();
    const toggle = () => setLang(lang === 'TR' ? 'EN' : 'TR');
    return (
        <>
            <header className="nav nav-A">
                <div className="brand">CW<span>25</span></div>
                <button className="lang" onClick={toggle}>
                    <Globe2 size={18} /><em className="t">{lang}</em>
                </button>
                <div className="navlinks">
                    {d.nav.map((n, i) => (
                        <button key={n} className={active === i ? 'active' : ''} onClick={() => nav(i)}>
                            <span>0{i + 1}</span><em className="t">{n}</em>
                        </button>
                    ))}
                </div>
            </header>

            {/* Mobilde sol üstte sabit, sadece ikonlu dil butonu */}
            <button className="mobile-lang-btn" onClick={toggle} aria-label="Change language">
                <Globe2 size={18} />
                <small>{lang}</small>
            </button>

            <div className="mobile-dock">
                {d.nav.map((n, i) => (
                    <button key={n} onClick={() => nav(i)} className={active === i ? 'active' : ''} aria-label={n}>
                        {createElement(ICONS[i], { size: 20 })}
                        <span>{n}</span>
                    </button>
                ))}
            </div>
        </>
    );
}
