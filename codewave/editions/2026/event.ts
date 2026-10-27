// CODEWAVE 2026 — bu edisyonun tek doğruluk kaynağı (tarih, mekân, bilet, konuşmacılar, iletişim).
// Sayfadaki her tarih, fiyat ve isim buradan okunur; başka dosyada tekrar tanımlanmaz.

export const EVENT = {
    name: 'CODEWAVE 2026',
    // Türkiye saati (UTC+03:00). Geri sayım, satışın kapanması ve yapılandırılmış veri bunu kullanır.
    startsAt: '2026-12-08T09:00:00+03:00',
    // Bitiş saati henüz açıklanmadı; gün bitene kadar "sürüyor", sonrasında "tamamlandı" gösterilir.
    dayEndsAt: '2026-12-09T00:00:00+03:00',
    venue: {
        name: 'KTÜ Prof. Dr. Osman Turan Kültür ve Kongre Merkezi',
        short: 'Osman Turan Kongre Merkezi',
        campus: 'KTÜ Kanuni Kampüsü',
        city: 'Trabzon',
        mapsUrl:
            'https://www.google.com/maps/search/?api=1&query=' +
            encodeURIComponent('KTÜ Prof. Dr. Osman Turan Kültür ve Kongre Merkezi, Trabzon'),
    },
    siteUrl: 'https://codewave.ktucec.com',
} as const;

// Bilet fiyatını değiştirmek için bu değeri güncelleyin (Shopier'deki herkese açık bilet ürününün fiyatı da aynı olmalı).
// Sunucu ödeme tutarını da buradan hesaplar; tarayıcıdan gelen fiyata asla güvenilmez.
export const TICKET = {
    price: 161,
    currency: 'TRY',
} as const;

// edu.tr e-posta onayıyla kazanılan tek seferlik öğrenci indirimi. İndirimi değiştirmek için yalnızca burayı güncelleyin:
//  - { type: 'percent', value: 20 } → bilet fiyatından %20 düşülür
//  - { type: 'fixed', value: 30 }   → bilet fiyatından 30 TL düşülür
// Sunucu ödeme tutarını da buradan hesaplar. İndirim fiyatı en fazla 1 TL'ye kadar indirebilir.
// Şu an (geçici): 20 TL bilet, indirimli fiyat 18 TL (20 - 2). Bilet fiyatı değişirse indirimli fiyat da kayar; value'yu yeniden hesaplayın.
export const STUDENT_DISCOUNT: { type: 'percent' | 'fixed'; value: number } = {
    type: 'fixed',
    value: 41,
};

export const CONTACT = {
    email: 'ktucec@ceng.ktu.edu.tr',
    sponsorEmail: 'turkalinehir@gmail.com',
    phone: '+905436657210',
    phoneDisplay: '+90 543 665 72 10',
} as const;

export const SOCIALS = [
    { label: 'Instagram', href: 'https://www.instagram.com/ktucec' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ktucec' },
    { label: 'X', href: 'https://twitter.com/ktucec' },
] as const;

// Konuşmacılar. Gerçek fotoğraf geldiğinde dosyayı public/editions/2026/speakers/ altına koyup
// photo alanını doldurun (ör. '/editions/2026/speakers/taner-saydam.jpg'). Kare olmayan fotoğraflar da
// 1:1 alana kırpılır; yüz kadrajın üstündeyse photoPosition ile ayarlanabilir (varsayılan 'center 30%').
export type Speaker = {
    name: string;
    title: string;
    company?: string;
    photo?: string;
    photoPosition?: string;
    // true: photo, test amaçlı sentetik bir örnek görseldir (kişinin fotoğrafı değil). Gerçek fotoğraf
    // eklenince bu alanı silin; o zaman görsele kişinin adıyla alternatif metin verilir.
    sample?: boolean;
};

// Fotoğraflar: public/editions/2026/speakers/<ad-soyad>.jpg. Bir fotoğrafı değiştirirken dosyaya yeni bir ad
// verin (ör. emre-savci-2.jpg) ve photo yolunu güncelleyin: next/image küçültülmüş kopyaları dosya adına göre
// önbelleğe alır, aynı adla üzerine yazılan dosya bu yüzden sitede hemen görünmez.
export const SPEAKERS: Speaker[] = [
    { name: 'Taner Saydam', title: 'Microsoft MVP', photo: '/editions/2026/speakers/taner-saydam.jpg' },
    { name: 'Barış Atak', title: 'Senior Software Engineer', company: 'Havelsan', photo: '/editions/2026/speakers/baris-atak.jpg' },
    { name: 'Güvenç Eraslan', title: 'Expert Data Engineer', company: 'Pegasus Airlines', photo: '/editions/2026/speakers/guvenc-eraslan.jpg' },
    { name: 'Emre Savcı', title: 'Tech Lead', company: 'Trendyol Group', photo: '/editions/2026/speakers/emre-savci.jpg' },
    { name: 'Akın Özer', title: 'DevOps Manager', company: 'Hepapi', photo: '/editions/2026/speakers/akin-ozer.jpg' },
];

// Programdaki oturum sayısı. Bilet bölümündeki "oturum başına" tutarı buradan hesaplanır.
export const SESSION_COUNT = 6;

// Programda planlanan konuşmacı sayısı. Kesinleşmeyen koltuklar "yakında" olarak gösterilir.
export const SPEAKER_SEATS = 6;

export const startsAtMs = () => new Date(EVENT.startsAt).getTime();
export const dayEndsAtMs = () => new Date(EVENT.dayEndsAt).getTime();

// Sayfadaki açık lisanslı fotoğrafların künyesi (kaynak kaydı: public/editions/2026/place/credits.json).
export const PHOTO_CREDITS = [
    {
        label: 'Trabzon, ISS047-E-118739',
        author: 'NASA Johnson Space Center',
        licence: 'Public domain',
        href: 'https://commons.wikimedia.org/wiki/File:ISS047-E-118739_-_Trabzon_and_Trabzon_Airport,_Turkey.jpg',
    },
    {
        label: 'Karadeniz Teknik Üniversitesi 02',
        author: 'MirkoS18',
        licence: 'CC BY-SA 4.0',
        href: 'https://commons.wikimedia.org/w/index.php?curid=61936225',
    },
    {
        label: 'Karadeniz Teknik Üniversitesi 04',
        author: 'MirkoS18',
        licence: 'CC BY-SA 4.0',
        href: 'https://commons.wikimedia.org/w/index.php?curid=61936227',
    },
    {
        label: 'Karadeniz Teknik Üniversitesi 05',
        author: 'MirkoS18',
        licence: 'CC BY-SA 4.0',
        href: 'https://commons.wikimedia.org/w/index.php?curid=61936228',
    },
] as const;
