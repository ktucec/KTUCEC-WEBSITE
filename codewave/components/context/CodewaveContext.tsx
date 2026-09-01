'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const t = {
    TR: {
        nav: ['Ana Sayfa', 'Biz Kimiz?', 'Başarılarımız', 'Konuşmacılar', 'Galeri', 'İletişim'],
        badge: 'KTUCEC GURURLA SUNAR',
        title: 'Geleceğin yazılım ekosistemi Karadeniz’in en prestijli zirvesinde buluşuyor.',
        register: 'Hemen Kaydol',
        regClosedNote: '• Başvurular henüz başlamadı',
        explore: 'Zirveyi Keşfet',
        countdownLabels: ['GÜN', 'SAAT', 'DAKİKA', 'SANİYE'],
        scrollDiscover: 'KEŞFETMEK İÇİN KAYDIRIN',
        about: 'Biz Kimiz?',
        aboutText: 'KTÜ Bilgisayar Mühendisliği Öğrenci Kulübü (KTUCEC), Karadeniz Teknik Üniversitesi’nin en köklü ve aktif öğrenci topluluklarından biridir. 2006 yılında kurulmuş olan kulübümüz; teknolojiye ve mühendisliğe ilgi duyan tüm öğrencilere hitap eden resmi bir öğrenci topluluğudur. Her yıl artan üye sayımız ve çeşitlenen faaliyetlerimizle, üniversitemizde teknoloji, inovasyon ve girişimcilik alanında öncü bir rol üstleniyoruz.',
        stats: ['Toplam Üye', 'Toplam Etkinlik', 'Geliştirilen Proje', '25-26 Dönemi Üye', '25-26 Dönemi Etkinlik', 'Toplam Ortak'],
        speakers: '2025 zirvesi ilham veren konuşmacılarımız',
        sponsors: 'Bize ilk yılımızda inanan değerli destekçilerimiz',
        vision: 'Bu yıl bizi neler bekliyor?',
        gallery: 'Codewave atmosferi ve unutulmaz anlar',
        contact: 'Sponsorluk & İletişim Koordinasyon',
        location: 'Etkinlik Alanı',
        firstWaveMetrics: ['KATILIMCI', 'TEKNOLOJİ OTURUMU', 'ORGANİK BÜYÜME'],
        impactHeading: ['GENEL OLARAK', 'BİZ'],
        whatIsTitle: ['CODEWAVE', 'NEDİR?'],
    },
    EN: {
        nav: ['Home', 'About Us', 'Impact', 'Speakers', 'Gallery', 'Contact'],
        badge: 'KTUCEC PROUDLY PRESENTS',
        title: 'The future of software gathers at the Black Sea’s most prestigious summit.',
        register: 'Register Now',
        regClosedNote: '• Applications have not opened yet',
        explore: 'Explore Summit',
        countdownLabels: ['DAYS', 'HOURS', 'MINUTES', 'SECONDS'],
        scrollDiscover: 'SCROLL TO DISCOVER',
        about: 'Who Are We?',
        aboutText: 'KTU Computer Engineering Student Club (KTUCEC) is one of the oldest and most active student communities at Karadeniz Technical University. Founded in 2006, our official student community welcomes everyone interested in technology and engineering. With a growing membership and diverse programs, we lead technology, innovation and entrepreneurship on campus.',
        stats: ['Total Members', 'Total Events', 'Completed Projects', 'Active Term Members', 'Term Events', 'Global Partners'],
        speakers: 'Inspiring speakers from the 2025 summit',
        sponsors: 'Valuable supporters who believed in us from year one',
        vision: 'What awaits us this year?',
        gallery: 'The Codewave atmosphere and unforgettable moments',
        contact: 'Sponsorship & Communications',
        location: 'Event Venue',
        firstWaveMetrics: ['PARTICIPANTS', 'TECH SESSIONS', 'ORGANIC GROWTH'],
        impactHeading: ['OVERALL,', 'WE'],
        whatIsTitle: ['WHAT IS', 'CODEWAVE?'],
    }
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
        document.getElementById(['hero', 'about', 'impact', 'speakers', 'gallery', 'contact'][i])?.scrollIntoView({ behavior: 'smooth' });
    };

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