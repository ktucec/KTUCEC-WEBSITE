'use client';
import { createElement } from 'react';
import { Globe2, Radio, Users, Zap, CircleUserRound, Play, Mail } from 'lucide-react';
import { useCodewave } from '@/components/context/CodewaveContext';

export default function Navbar() {
    const { lang, setLang, active, nav, d } = useCodewave();
    return (
        <>
            <header className="nav nav-A">
                <div className="brand">CW<span>26</span></div>
                <button className="lang" onClick={() => setLang(lang === 'TR' ? 'EN' : 'TR')}>
                    <Globe2 size={18} />{lang}
                </button>
                <div className="navlinks">
                    {d.nav.map((n, i) => (
                        <button key={n} className={active === i ? 'active' : ''} onClick={() => nav(i)}>
                            <span>0{i + 1}</span>{n}
                        </button>
                    ))}
                </div>
            </header>

            {/* Mobilde sol üstte sabit, sadece ikonlu dil butonu */}
            <button
                className="mobile-lang-btn"
                onClick={() => setLang(lang === 'TR' ? 'EN' : 'TR')}
                aria-label="Change language"
            >
                <Globe2 size={18} />
                <small>{lang}</small>
            </button>

            <div className="mobile-dock">
                {d.nav.map((n, i) => (
                    <button key={n} onClick={() => nav(i)} className={active === i ? 'active' : ''}>
                        {createElement([Radio, Users, Zap, CircleUserRound, Play, Mail][i], { size: 20 })}
                        <span>{n}</span>
                    </button>
                ))}
            </div>
        </>
    );
}