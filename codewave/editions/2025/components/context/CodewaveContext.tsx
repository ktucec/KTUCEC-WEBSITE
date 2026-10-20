'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Sayfadaki bölüm kimlikleri — Navbar ile aynı sırada.
export const SECTION_IDS = ['hero', 'about', 'impact', 'speakers', 'gallery', 'contact'];

const t = {
    TR: {
        nav: ['Ana Sayfa', 'Biz Kimiz?', 'Başarılarımız', 'Konuşmacılar', 'Galeri', 'İletişim'],
        badge: 'KTUCEC · İLK DALGA',
        title: 'Geleceğin yazılım ekosistemi, Karadeniz’in en prestijli zirvesinde buluştu.',
        explore: 'Zirveyi Keşfet',
        nextEdition: 'CODEWAVE 2026’ya geç',
        scrollDiscover: 'KEŞFETMEK İÇİN KAYDIRIN',
        heroStats: ['KATILIMCI', 'TEKNOLOJİ OTURUMU', 'DESTEKÇİ'],
        about: 'Biz Kimiz?',
        aboutText: 'KTÜ Bilgisayar Mühendisliği Öğrenci Kulübü (KTUCEC), Karadeniz Teknik Üniversitesi’nin en köklü ve aktif öğrenci topluluklarından biridir. 2006 yılında kurulmuş olan kulübümüz; teknolojiye ve mühendisliğe ilgi duyan tüm öğrencilere hitap eden resmi bir öğrenci topluluğudur. Her yıl artan üye sayımız ve çeşitlenen faaliyetlerimizle, üniversitemizde teknoloji, inovasyon ve girişimcilik alanında öncü bir rol üstleniyoruz.',
        stats: ['Toplam Üye', 'Toplam Etkinlik', 'Geliştirilen Proje', 'Toplam Ortak'],
        whatIsText: 'Bilgisayar ve yazılım ekosistemine katılmaya hazırlanan yetenekleri sektörün öncü profesyonelleriyle bir araya getiren prestijli bir zirve.',
        firstWaveTitle: 'KATILIMCI',
        firstWaveText: 'İlk zirvemizde bölgesel çapta büyük bir etki yarattık.',
        firstWaveMetrics: ['KATILIMCI', 'TEKNOLOJİ OTURUMU', 'ORGANİK BÜYÜME'],
        impactHeading: ['GENEL OLARAK', 'BİZ'],
        whatIsTitle: ['CODEWAVE', 'NEDİR?'],
        speakers: '2025 zirvesi ilham veren konuşmacılarımız',
        speaker: 'KONUŞMACI',
        sponsors: 'Bize ilk yılımızda inanan değerli destekçilerimiz',
        gallery: 'Codewave atmosferi ve unutulmaz anlar',
        expand: 'BÜYÜT',
        swipe: '← Kaydırarak Geçiş Yapın →',
        contact: 'Bize Ulaşın',
        contactDesc: 'Sorularınız, iş birlikleri ve önerileriniz için KTUCEC ile iletişime geçebilirsiniz.',
        followUs: 'Bizi takip edin',
        nextWave: 'SIRADAKİ DALGA',
        nextWaveTitle: ['CODEWAVE', '2026'],
        nextWaveText: 'CODEWAVE her yıl yeni bir temayla geri dönüyor. Sıradaki zirveyi görmek için 2026 sayfasına geçin.',
        nextWaveCta: '2026 sayfasına git',
    },
    EN: {
        nav: ['Home', 'About Us', 'Impact', 'Speakers', 'Gallery', 'Contact'],
        badge: 'KTUCEC · FIRST WAVE',
        title: 'The future of software gathered at the Black Sea’s most prestigious summit.',
        explore: 'Explore Summit',
        nextEdition: 'Go to CODEWAVE 2026',
        scrollDiscover: 'SCROLL TO DISCOVER',
        heroStats: ['PARTICIPANTS', 'TECH SESSIONS', 'SUPPORTERS'],
        about: 'Who Are We?',
        aboutText: 'KTU Computer Engineering Student Club (KTUCEC) is one of the oldest and most active student communities at Karadeniz Technical University. Founded in 2006, our official student community welcomes everyone interested in technology and engineering. With a growing membership and diverse programs, we lead technology, innovation and entrepreneurship on campus.',
        stats: ['Total Members', 'Total Events', 'Completed Projects', 'Global Partners'],
        whatIsText: 'A prestigious summit connecting emerging software talent with leading industry professionals.',
        firstWaveTitle: 'PARTICIPANTS',
        firstWaveText: 'Our first summit created a major regional impact.',
        firstWaveMetrics: ['PARTICIPANTS', 'TECH SESSIONS', 'ORGANIC GROWTH'],
        impactHeading: ['OVERALL,', 'WE'],
        whatIsTitle: ['WHAT IS', 'CODEWAVE?'],
        speakers: 'Inspiring speakers from the 2025 summit',
        speaker: 'SPEAKER',
        sponsors: 'Valuable supporters who believed in us from year one',
        gallery: 'The Codewave atmosphere and unforgettable moments',
        expand: 'EXPAND',
        swipe: '← Swipe to Navigate →',
        contact: 'Get in Touch',
        contactDesc: 'Feel free to contact KTUCEC for questions, partnerships and suggestions.',
        followUs: 'Follow us',
        nextWave: 'NEXT WAVE',
        nextWaveTitle: ['CODEWAVE', '2026'],
        nextWaveText: 'CODEWAVE returns every year with a brand-new theme. Head to the 2026 page to see the next summit.',
        nextWaveCta: 'Go to the 2026 page',
    },
};

type Lang = 'TR' | 'EN';

interface ContextProps {
    lang: Lang;
    setLang: (l: Lang) => void;
    active: number;
    setActive: (a: number) => void;
    nav: (i: number) => void;
    d: typeof t['TR'];
}

const CodewaveContext = createContext<ContextProps | undefined>(undefined);

const LANG_STORAGE_KEY = 'cw-lang';

export function CodewaveProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('TR');
    const [active, setActive] = useState(0);
    const d = t[lang];

    // Sayfa ilk yüklendiğinde localStorage'dan mevcut dili oku (client-only, hydration-safe)
    useEffect(() => {
        const saved = localStorage.getItem(LANG_STORAGE_KEY) as Lang | null;
        if (saved === 'TR' || saved === 'EN') {
            setLangState(saved);
        }
    }, []);

    // Dil değiştiğinde state'i ve localStorage'ı birlikte güncelle
    const setLang = (l: Lang) => {
        setLangState(l);
        localStorage.setItem(LANG_STORAGE_KEY, l);
    };

    const nav = (i: number) => {
        setActive(i);
        document.getElementById(SECTION_IDS[i])?.scrollIntoView({ behavior: 'smooth' });
    };

    // Kaydırırken aktif bölümü takip et (nav ve mobil dock buna göre vurgulanır)
    useEffect(() => {
        const els = SECTION_IDS.map((id) => document.getElementById(id));
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActive(SECTION_IDS.indexOf(e.target.id));
                });
            },
            { rootMargin: '-45% 0px -50% 0px' }
        );
        els.forEach((el) => el && io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <CodewaveContext.Provider value={{ lang, setLang, active, setActive, nav, d }}>
            {children}
        </CodewaveContext.Provider>
    );
}

export const useCodewave = () => {
    const context = useContext(CodewaveContext);
    if (!context) throw new Error('useCodewave must be used within CodewaveProvider');
    return context;
};
