"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import AnnouncementCard from '@/components/ui/AnnouncementCard';
import AnnouncementModal from '@/components/ui/AnnouncementModal';

export default function AnnouncementsPage() {
    useScrollAnimation();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const announcements = [
        {
            id: 1,
            date: "14 Mart 2024",
            title: "Google Hash Code 2024 Hub Duyurusu",
            description: "KTU Bilgisayar Mühendisliği olarak bu yıl da Google Hash Code için resmi hub oluyoruz. Kayıtlar ve detaylar için web sitemizi ziyaret edin. Bu süreçte takım kurma ve çalışma ortamları hakkında kulüp odamızda rehberlik sağlanacaktır."
        },
        {
            id: 2,
            date: "12 Mart 2024",
            title: "Büyük Şirketlerde Staj Arayışı Semineri",
            description: "FAANG ve yerli teknoloji devlerinde staj süreci nasıl işler? CV hazırlama ve teknik mülakat teknikleri üzerine konuşuyoruz."
        },
        {
            id: 3,
            date: "10 Mart 2024",
            title: "Python ile Veri Bilimi Atölyesi",
            description: "Temel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindeTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerindTemel kütüphanelerden başlayarak gerçek dünya veri setleri üzerind analiz yapacağımız 4 haftalık yoğunlaştırılmış eğitim serisi."
        },
        {
            id: 4,
            date: "05 Mart 2024",
            title: "Open Source Katkı Rehberi Yayında",
            description: "Açık kaynak dünyasına ilk adımınızı nasıl atarsınız? Topluluğumuzun hazırladığı kapsamlı GitHub rehberine göz atın."
        },
        {
            id: 5,
            date: "01 Mart 2024",
            title: "Yeni Dönem Tanışma Toplantısı",
            description: "Bahar dönemine hızlı bir giriş yapıyoruz. Yeni projelerimizi ve hedeflerimizi konuşmak üzere herkesi bekliyoruz."
        },
        {
            id: 6,
            date: "25 Şubat 2024",
            title: "Siber Güvenlikte Kariyer Basamakları",
            description: "White-hat hacking dünyasına giriş yapacaklar için yol haritası. Sertifikalar, araçlar ve uygulama alanları üzerine detaylı rehber."
        }
    ];


    useEffect(() => {
        const idParam = searchParams.get('id');
        if (idParam) {
            const found = announcements.find(a => a.id === Number(idParam));
            if (found) {
                setSelectedAnnouncement(found);
                setIsModalOpen(true);
            }
        }
    }, [searchParams]);

    const handleOpenModal = (announcement) => {
        setSelectedAnnouncement(announcement);
        setIsModalOpen(true);
        router.replace(`/duyurular?id=${announcement.id}`, { scroll: false });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedAnnouncement(null), 300);
        router.replace('/duyurular', { scroll: false });
    };

    return (
        <>
            <main className="pt-32 pb-24 px-gutter max-w-container-max mx-auto relative z-10">
                {/* Hero / Breadcrumb Section */}
                <section className="mb-12">
                    <nav className="flex items-center flex-wrap gap-1.5 md:gap-2 text-on-surface-variant/60 font-label-md text-xs md:text-label-md mb-3 md:mb-4 uppercase tracking-widest">
                        <Link href="/" className="hover:text-primary transition-colors">
                            Ana Sayfa
                        </Link>
                        <span className="material-symbols-outlined text-[12px] md:text-[14px] shrink-0">
                            chevron_right
                        </span>
                        <span className="text-primary font-bold">
                            Duyurular
                        </span>
                    </nav>
                    <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary mb-6">Duyurular</h1>
                    <p className="font-size-10 font-body-lg md:text-body-lg  text-on-surface-variant max-w-2xl">
                        Bilgisayar Mühendisliği topluluğumuzdan en güncel haberler, teknik makaleler ve kariyer fırsatları.
                    </p>
                </section>

                {/* Filtering System */}
                <section className="fade-up mb-10 md:mb-16">
                    <div className="glass-panel p-5 sm:p-6 md:p-8 rounded-[20px] md:rounded-[24px] shadow-sm flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-6 border-white/60">
                        <div className="w-full md:w-auto flex-1">
                            <label className="block font-label-md text-xs md:text-label-md text-on-surface-variant mb-1.5 md:mb-2 uppercase tracking-wider">
                                Başlangıç Tarihi
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full bg-white/50 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 md:px-4 md:py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-body-md text-sm md:text-base text-on-surface"
                                    type="date"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex-1">
                            <label className="block font-label-md text-xs md:text-label-md text-on-surface-variant mb-1.5 md:mb-2 uppercase tracking-wider">
                                Bitiş Tarihi
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full bg-white/50 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 md:px-4 md:py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-body-md text-sm md:text-base text-on-surface"
                                    type="date"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-auto">
                            <button className="w-full bg-primary text-white px-8 md:px-10 py-3 md:py-3.5 rounded-xl font-label-md text-xs md:text-label-md uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer">
                                <span className="material-symbols-outlined text-[18px] md:text-[20px]">filter_list</span>
                                Filtrele
                            </button>
                        </div>
                    </div>
                </section>

                {/* Announcements List Componentized */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {announcements.map((item, index) => (
                        <AnnouncementCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            description={item.description}
                            date={item.date}
                            index={index}
                            onClick={() => handleOpenModal(item)}
                        />
                    ))}
                </section>

                {/* Pagination */}
                <nav className="mt-10 md:mt-20 flex justify-center items-center gap-1.5 sm:gap-2">
                    <button className="glass-panel w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all">
                        <span className="material-symbols-outlined text-sm sm:text-base md:text-xl">chevron_left</span>
                    </button>

                    <button className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center bg-primary text-white font-bold text-xs sm:text-sm md:text-base shadow-lg shadow-primary/20">
                        1
                    </button>

                    <button className="glass-panel w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all text-xs sm:text-sm md:text-base">
                        2
                    </button>

                    <button className="glass-panel w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all text-xs sm:text-sm md:text-base">
                        3
                    </button>

                    <span className="px-1 sm:px-2 text-on-surface-variant text-xs sm:text-sm select-none">...</span>

                    <button className="glass-panel w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all">
                        <span className="material-symbols-outlined text-sm sm:text-base md:text-xl">chevron_right</span>
                    </button>
                </nav>
            </main>

            {/* Modal Component*/}
            <AnnouncementModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                announcement={selectedAnnouncement}
            />
        </>
    );
}