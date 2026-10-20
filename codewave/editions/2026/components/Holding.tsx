'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';

const TARGET = new Date('2026-12-08T10:00:00+03:00').getTime();
const LABELS = ['GÜN', 'SAAT', 'DAKİKA', 'SANİYE'];

function calc() {
    const diff = Math.max(TARGET - Date.now(), 0);
    return [
        Math.floor(diff / 86400000),
        Math.floor((diff / 3600000) % 24),
        Math.floor((diff / 60000) % 60),
        Math.floor((diff / 1000) % 60),
    ].map((n) => String(n).padStart(2, '0'));
}

// GEÇİCİ: CODEWAVE 2026 tasarımı yapılana kadar bu sayfa bekleme sayfası olarak durur.
export default function Holding() {
    const [t, setT] = useState(['00', '00', '00', '00']);

    useEffect(() => {
        setT(calc());
        const id = setInterval(() => setT(calc()), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <main className="h26">
            <div className="h26-bg" aria-hidden="true" />
            <div className="h26-wrap">
                <p className="h26-badge"><i /> KTUCEC GURURLA SUNAR</p>
                <h1>
                    <span>CODE</span>
                    <em>WAVE</em>
                    <b>2026</b>
                </h1>
                <p className="h26-lead">
                    Geleceğin yazılım ekosistemi Karadeniz’in en prestijli zirvesinde buluşuyor.
                    Yeni tasarımımız çok yakında burada.
                </p>

                <div className="h26-count">
                    {t.map((v, i) => (
                        <div key={i}>
                            <strong>{v}</strong>
                            <span>{LABELS[i]}</span>
                        </div>
                    ))}
                </div>

                <ul className="h26-info">
                    <li><MapPin size={16} /> 8 Aralık 2026 · 10:00 · KTÜ Prof. Dr. Osman Turan Kültür ve Kongre Merkezi, Trabzon</li>
                </ul>

                <div className="h26-contact">
                    <p>Sponsorluk &amp; İletişim</p>
                    <a href="tel:+905436657210"><Phone size={16} /> +90 (543) 665 72 10</a>
                    <a href="mailto:turkalinehir@gmail.com"><Mail size={16} /> turkalinehir@gmail.com</a>
                    <a href="mailto:ktucec@ceng.ktu.edu.tr"><Mail size={16} /> ktucec@ceng.ktu.edu.tr</a>
                </div>

                <a className="h26-link" href="/2025">
                    CODEWAVE 2025’e göz at <ArrowUpRight size={16} />
                </a>
            </div>
        </main>
    );
}
