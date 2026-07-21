"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AboutCard from '@/components/ui/AboutCard';
import SponsorTicker from '@/components/ui/SponsorTicker';

function AnimatedCounter({ target, suffix = "" }) {
    const [count, setCount] = useState(0);
    const elementRef = useRef(null);

    useEffect(() => {
        const currentElement = elementRef.current;

        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;

            if (entry.isIntersecting) {
                let startTime = null;
                const duration = 2000;

                function animate(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    setCount(Math.floor(progress * target));

                    if (progress < 1) {
                        window.requestAnimationFrame(animate);
                    }
                }

                window.requestAnimationFrame(animate);

                if (currentElement) {
                    observer.unobserve(currentElement);
                }
            }
        }, { threshold: 0.1 });

        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => observer.disconnect();
    }, [target]);

    return <span ref={elementRef}>{count}{suffix}</span>;
}

export default function AboutPage() {
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const sponsorLogos = [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBRqrD7TwEzFdhvcBCSDgwKE7puyYk8mFs1CbwBhMIkjRvOH1099ZoOWEAJPaQT5yOjPI15gMzygflAFGfDSZO0up4qjbnR1R7Bsz4bC9Rh4c8aWDdAWSsal84HtCyFjtasbL9v3dpSuMBPIIWmXzLbs-7EzR81j5UXLBfz4Wvq-1Bbrg-aSRTZS-ZWYOSzWpiE5an-Cu2oK0ktdNynw3JuP5l-2_DOqvuGIgQ3U81gbXaVVspjm-rgsun_JJm7389WqhlmkUVL4_mC",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCkEJFUQh3-gNY__Q5raYTyXKHpDYHhcMvQEFzTVU0ISQpnejHXAWLUhBZ5d45pOzSdfpSx8PKUeYZ9B2IvW0ZzG4AJ4NsfglmGkfwg6QBrih9cI1ZiUH8Ehg_ijntmELVXacxFnkoHhXK25m5oLWdpOO4CtZKgL47MSqhAeeIFcyocVntC1IM6sGDJOzTiquf2GDLfkfN3kaPfBXojz16W1Zh_Sa_Ol-oTplqpaKIIWdjs-qrrkeibXBIvHGVG9c_3jZvIVXUtBBBD",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAJ9ee_pM5LilWwVAlLDdVaYGrL_XSKPI3lqHlRFgdhSlXTSFSLSy44eSs9sWGvgk0VDvHWU0NJ7txa3NWMw14TZzWgZ-Ww16X0vA-xEJOoXbgFatGyJAH8EDpwS7ze0eGkCOTEDqjEFX4e2xM_pRW2RrEr8FL3mwQosKprkUjFdaYKP6fVtJMqxK-EhbJJZYs0CX-YQAo7XdWa3qcWIv-_ni1N_XzQDg76nqx3YRQ9IIJAcAJrR1N9gyoQ4adeAh-qqN31d7W8ayst",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC-5Vk_Ui5jrcjWi_u9Mhbdofpna5JUQXgp3wBdFyrGjme9JgztTNpSBroGl8wlc7DtdRDkL5WKmFspCdowii2Opo25IjfhR47Uvn1eUM1JZ6dEPIsASBQgAYA1dgeVOfuuBMllSDuMMO2mdeS_9E4RMziCQXqffpFsAN7mNgolokPy6ZX7oLq0yt9qyvWqj08OKcCzYyoyNMzhr0V9dQw7M4lKEohE_KbVzwY-0B4kv1RZ3oGdKxrEaZuOoZ1hSVmWnsCfeq6QjTKu",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuByJ9QHUairepKS09g0eR_DjCFlmCayD2IJcFnmOVImhOg1Z4Jvy9AFSQ6xI0RrU9l7fhhBnsX7nP0fN3-VLeENd60NliYRcq-A_yWimbmYRFmaDDdwepyQUrqaIZJVldxEodDWA0lOOeAGaEfNt5QcTrcAJSCTlSh_N_ntl1g1N4FPEvyMcAP0Ix_fsEE-pjZhDa1Y_QxSp54OAulK6ctKE35znVIHgA6_s5AhBH2RwUlD8yw9B5K85hJCxxM77NC5TnjBuG_6qspI",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCciMU6R6dBNHIpKG6c2FWAR3fSBVrkOnxJB1fkA7_XaguEfOcgX58aZz6NzqIcy3X_g8TmnmHM5Lc3ZS5w3uJ0d3-n8GUm_xiprPDi8kzSEHAKoJopN6sl_f4ySE7jv2SeWyt-xDmOJaybMzw7Gy1ZJe0hQ1eIEXLFFCbLXcUVgwmT4fmI2yx6XCgqdvU9EISpreGRjP_eyRF5LCflgajzJsSA_K7nsPo-h_Ra0VEyFTrJdAc3aCjHoqrxIH9r6G4j1X8yLmjwoVus"
    ];

    return (
        <main className="relative z-10">
            {/* Hero Section */}
            <section className="pt-32 pb-24 px-gutter max-w-container-max mx-auto relative z-10">
                <div className="mb-12">
                    <nav className="flex items-center flex-wrap gap-1.5 md:gap-2 text-on-surface-variant/60 font-label-md text-xs md:text-label-md mb-3 md:mb-4 uppercase tracking-widest">
                        <Link href="/" className="hover:text-primary transition-colors">
                            Ana Sayfa
                        </Link>
                        <span className="material-symbols-outlined text-[12px] md:text-[14px] shrink-0">
                            chevron_right
                        </span>
                        <span className="text-primary font-bold">
                            Hakkımızda
                        </span>
                    </nav>
                    <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary mb-6">Hakkımızda</h1>
                    <p className="font-size-10 font-body-lg md:text-body-lg  text-on-surface-variant max-w-2xl">
                        KTÜ Bilgisayar Mühendisliği Kulübü, geleceği bugünden tasarlayan tutkulu mühendislerin, geliştiricilerin ve teknoloji meraklılarının buluşma noktasıdır.
                    </p>
                </div>

                {/* Bento-style interactive glass panels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-16 max-w-container-max w-full reveal">
                    <AboutCard
                        icon="engineering"
                        title="Teknik Mükemmeliyet"
                        description="En güncel teknolojileri, endüstri standartlarında projelerle deneyimliyoruz."
                    />
                    <AboutCard
                        icon="groups"
                        title="Güçlü Topluluk"
                        description="Akademi ve sektör arasında köprü kurarak, üyelerimize eşsiz bir ağ sağlıyoruz."
                        customClass="bg-primary-container/5"
                    />
                    <AboutCard
                        icon="rocket_launch"
                        title="Sürekli İnovasyon"
                        description="Geleneksel kalıpları yıkarak, yapay zekadan blokzincirine her alanda öncüyüz."
                    />
                </div>
            </section>

            {/* Just Text Section */}
            <section className="py-10 md:py-16 px-margin-mobile md:px-margin-desktop relative z-20">
                <div className="max-w-container-max mx-auto bg-[#F8F9FA]/90 backdrop-blur-md shadow-xl rounded-2xl md:rounded-3xl p-5 sm:p-8 md:p-16 reveal">
                    <div className="space-y-4 md:space-y-6 text-left">
                        <p className="font-body-lg text-md sm:text-base md:text-body-lg text-on-surface-variant leading-relaxed">
                            KTÜ Bilgisayar Mühendisliği Kulübü, teknolojiye gönül vermiş, inovasyon ve gelişimi odak noktasına alan vizyoner bir öğrenci topluluğudur. Kurulduğumuz günden itibaren üyelerimizin yalnızca teorik bilgilerle yetinmeyip, sektörün ihtiyaç duyduğu pratik tecrübeleri de kazanabilmesi için çalışıyoruz.
                        </p>
                        <p className="font-body-lg text-md sm:text-base md:text-body-lg text-on-surface-variant leading-relaxed">
                            Yazılım geliştirmeden siber güvenliğe, yapay zekadan oyun tasarımına kadar geniş bir yelpazede projeler yürütüyor, düzenlediğimiz teknik eğitimler ve hackathon'larla sınırları zorluyoruz. Amacımız, her üyemizin yeteneklerini keşfedebileceği, özgürce fikir üretebileceği ve bu fikirleri hayata geçirebileceği güvenli ve destekleyici bir ekosistem yaratmaktır.
                        </p>
                        <p className="font-body-lg text-md sm:text-base md:text-body-lg text-on-surface-variant leading-relaxed">
                            Akademi ile iş dünyası arasında güçlü bir köprü görevi görerek öğrencilerimizin mezun olmadan önce sektörel ağlarını kurmalarına ve kariyerlerine bir adım önde başlamalarına olanak tanıyoruz. Bizler sadece kod yazmıyor; birbirimizden öğrenerek, paylaşarak ve üreterek geleceği birlikte inşa ediyoruz.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section (Asymmetric & Parallax) */}
            <section className="py-10 md:py-16 px-margin-mobile md:px-margin-desktop relative z-20">
                <div className="max-w-container-max mx-auto bg-[#F8F9FA]/90 backdrop-blur-md shadow-xl rounded-2xl md:rounded-3xl p-5 sm:p-8 md:p-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-24 items-center">
                        {/* Visualization Block */}
                        <div className="relative h-[300px] sm:h-[400px] md:h-[500px] reveal">
                            <div className="absolute top-0 left-0 w-4/5 h-4/5 rounded-xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkIT1YthraRbZ66BsINxW2v17lupuESWwjrsJ9xGU5ufI5VWN-Rn2Biv5pF3GaQXFx00Q3_tHUxfVeNxU3ULoSODV8BeTXca9oYxjZna3jEsivJRU_QG2ncPirsnwCQuSvhxUe5URo2G1w6sIBDcmZ9CRx48xx_ZvvXzGdGB8DMoFHjx-nY8Ob-G2re7hjCuQmje-dMNAqf6EiHjFGwc1GVxcPgjeYOL_FTx44DyRTyXpCuxsu5bDic1UIawPQD1gU1F7oo-Yoce_v" alt="KTUCEC Laboratory Collaboration" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3/5 h-3/5 glass-card rounded-xl overflow-hidden -rotate-6 hover:rotate-0 transition-transform duration-700 p-1.5 sm:p-2">
                                <img className="w-full h-full object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcNKU_g1s1h5CoyMhWmG-S_TLvaRo7yPSYm3d5KUe2x3OCnDX2S7UOIHgcbZeiu_gEbDvSeZt421aJeuk3Hh-t7Uw4TypI-IOJxLvMN_QWPos8w3rH8w56X3fEz7L8hx8vcYuWuFKrADKQHFM-yjlX105BTlLk2Iolc7C5yOLFuvtjGmjUUJ1VGbzAFbMZnme71iAYcgm2vHzuEvojtdMetmpovKa_gYEm3zjD2RRdbEpIhdk_wIpMZqGpRyECVnkLz3as6UrgRDFv" alt="Engineering Precision Hardware" />
                            </div>
                        </div>

                        {/* Content Block */}
                        <div className="space-y-8 sm:space-y-12 md:space-y-16 reveal">
                            <div className="relative pl-4 sm:pl-6 md:pl-8 border-l-2 sm:border-l-4 border-primary">
                                <h2 className="font-headline-md text-2xl md:text-headline-md mb-3 md:mb-6 text-on-surface">
                                    Misyonumuz
                                </h2>
                                <p className="font-body-lg text-sm sm:text-base md:text-body-lg text-on-surface-variant leading-relaxed">
                                    Bilgisayar mühendisliği öğrencilerine, teorik bilgilerini pratiğe dökebilecekleri dinamik bir ekosistem sağlamak. Teknolojik gelişmeleri yakından takip ederek, üyelerimizi geleceğin lider mühendisleri olarak yetiştirmek ve yerel çözümlerle küresel değer üretmektir.
                                </p>
                            </div>
                            <div className="relative pl-4 sm:pl-6 md:pl-8 border-l-2 sm:border-l-4 border-outline-variant">
                                <h2 className="font-headline-md text-2xl md:text-headline-md mb-3 md:mb-6 text-on-surface">
                                    Vizyonumuz
                                </h2>
                                <p className="font-body-lg text-sm sm:text-base md:text-body-lg text-on-surface-variant leading-relaxed">
                                    Türkiye'nin en saygın ve üretken öğrenci topluluğu olarak, bilgisayar bilimleri alanında uluslararası başarılara imza atmak. Teknolojinin etik ve sürdürülebilir gelişimine yön veren, yenilikçi projeleriyle ilham veren bir marka haline gelmek.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-10 sm:py-14 md:py-20 bg-primary-container text-white">
                <div className="max-w-container-max mx-auto px-margin-mobile grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 text-center reveal">
                    <div>
                        <div className="font-display-lg text-3xl sm:text-4xl md:text-headline-md mb-1 md:mb-2 font-bold">
                            <AnimatedCounter target={500} suffix="+" />
                        </div>
                        <div className="font-label-md text-[11px] sm:text-xs md:text-label-md uppercase opacity-80 tracking-wider">
                            Aktif Üye
                        </div>
                    </div>
                    <div>
                        <div className="font-display-lg text-3xl sm:text-4xl md:text-headline-md mb-1 md:mb-2 font-bold">
                            <AnimatedCounter target={25} suffix="+" />
                        </div>
                        <div className="font-label-md text-[11px] sm:text-xs md:text-label-md uppercase opacity-80 tracking-wider">
                            Yıllık Etkinlik
                        </div>
                    </div>
                    <div>
                        <div className="font-display-lg text-3xl sm:text-4xl md:text-headline-md mb-1 md:mb-2 font-bold">
                            <AnimatedCounter target={12} />
                        </div>
                        <div className="font-label-md text-[11px] sm:text-xs md:text-label-md uppercase opacity-80 tracking-wider">
                            Aktif Proje
                        </div>
                    </div>
                    <div>
                        <div className="font-display-lg text-3xl sm:text-4xl md:text-headline-md mb-1 md:mb-2 font-bold">
                            <AnimatedCounter target={15} />
                        </div>
                        <div className="font-label-md text-[11px] sm:text-xs md:text-label-md uppercase opacity-80 tracking-wider">
                            Sektör Ortağı
                        </div>
                    </div>
                </div>
            </section>

            {/* Sponsors Section */}
            <section className="py-32 px-margin-mobile overflow-hidden">
                <div className="max-w-container-max mx-auto text-center mb-16 reveal">
                    <h2 className="font-headline-md text-headline-md text-on-surface">Sponsorlarımız</h2>
                    <div className="w-20 h-1 bg-primary mx-auto mt-4"></div>
                </div>

                {/* Scrolling Ticker Container */}
                <div className='flex justify-center'>
                    <div className="relative w-full lg:w-1/2 overflow-hidden reveal">
                        <SponsorTicker logos={sponsorLogos} />
                    </div>
                </div>
            </section>
        </main>
    );
}