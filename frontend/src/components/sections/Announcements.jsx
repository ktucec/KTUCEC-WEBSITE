"use client";

import Link from "next/link";
import AnnouncementCard from "../ui/AnnouncementCard";

export default function Announcements() {
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
    ]

    return (
        <section className="pt-12 md:pt-20" id="duyurular">
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12 fade-up">
                <span
                    className="material-symbols-outlined text-primary text-3xl md:text-4xl shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    campaign
                </span>
                <h2 className="font-headline-md text-2xl md:text-headline-md text-(--color-on-surface)">
                    Son Duyurular
                </h2>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {announcements.map((item, index) => (
                    <Link key={item.id} href={`/duyurular?id=${item.id}`} className="block h-full">
                        <AnnouncementCard
                            id={item.id}
                            title={item.title}
                            description={item.description}
                            date={item.date}
                            index={index}
                        />
                    </Link>
                ))}
            </section>
        </section>
    );
}