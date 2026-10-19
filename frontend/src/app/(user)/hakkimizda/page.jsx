"use client";

import { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/ui/PageHeader';
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
            <div className="px-5 sm:px-gutter max-w-container-max mx-auto">
                <PageHeader
                    crumb="Hakkımızda"
                    lines={["Birlikte üreten", "bir topluluk."]}
                    ghost="Biz"
                    description="KTÜ Bilgisayar Mühendisliği Kulübü, geleceği bugünden tasarlayan mühendislerin, geliştiricilerin ve teknoloji meraklılarının buluşma noktası."
                />

                {/* Değerlerimiz */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 reveal" aria-label="Değerlerimiz">
                    <AboutCard
                        icon="engineering"
                        title="Teknik derinlik"
                        description="Güncel teknolojileri, endüstri standartlarındaki projelerle deneyimliyoruz."
                    />
                    <AboutCard
                        icon="groups"
                        title="Güçlü topluluk"
                        description="Akademi ile sektör arasında köprü kurup üyelerimize gerçek bir çevre kazandırıyoruz."
                        customClass="md:translate-y-8"
                    />
                    <AboutCard
                        icon="rocket_launch"
                        title="Sürekli deneme"
                        description="Yapay zekadan gömülü sistemlere, yeni bir şey öğrenmekten çekinmiyoruz."
                    />
                </section>

                {/* Uzun metin: solda yapışkan başlık, sağda paragraflar */}
                <section className="mt-28 md:mt-40 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-16">
                    <div className="lg:sticky lg:top-32 self-start reveal">
                        <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-[-0.045em] leading-[0.95] text-ink" style={{ fontStretch: "85%" }}>
                            Neden varız?
                        </h2>
                        <div className="mt-5 h-[2px] w-24 bg-brand" aria-hidden="true" />
                    </div>
                    <div className="space-y-6 text-muted text-lg leading-relaxed reveal">
                        <p className="font-display text-2xl md:text-[1.9rem] leading-[1.25] font-semibold tracking-[-0.02em] text-ink">
                            Teknolojiye gönül vermiş, inovasyonu ve gelişimi odağına alan bir öğrenci topluluğuyuz.
                        </p>
                        <p>
                            Kurulduğumuz günden beri üyelerimizin yalnızca teorik bilgiyle yetinmeyip sektörün ihtiyaç duyduğu pratik
                            tecrübeyi de kazanabilmesi için çalışıyoruz.
                        </p>
                        <p>
                            Yazılım geliştirmeden siber güvenliğe, yapay zekadan oyun tasarımına kadar geniş bir yelpazede projeler yürütüyor,
                            teknik eğitimler ve hackathonlarla sınırları zorluyoruz. Amacımız; her üyenin yeteneğini keşfedebileceği,
                            özgürce fikir üretip hayata geçirebileceği destekleyici bir ortam kurmak.
                        </p>
                        <p>
                            Akademi ile iş dünyası arasında köprü kurarak öğrencilerimizin mezun olmadan sektörel ağlarını oluşturmasına
                            ve kariyerlerine bir adım önde başlamasına yardım ediyoruz. Sadece kod yazmıyoruz; birbirimizden öğrenerek,
                            paylaşarak ve üreterek geleceği birlikte kuruyoruz.
                        </p>
                    </div>
                </section>

                {/* Misyon ve vizyon */}
                <section className="mt-28 md:mt-40 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
                    <div className="relative h-[320px] sm:h-[420px] md:h-[500px] reveal">
                        <div className="absolute top-0 left-0 w-4/5 h-4/5 rounded-[28px] overflow-hidden shadow-2xl rotate-3 hover:rotate-0 hover:scale-[1.02] transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-line">
                            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkIT1YthraRbZ66BsINxW2v17lupuESWwjrsJ9xGU5ufI5VWN-Rn2Biv5pF3GaQXFx00Q3_tHUxfVeNxU3ULoSODV8BeTXca9oYxjZna3jEsivJRU_QG2ncPirsnwCQuSvhxUe5URo2G1w6sIBDcmZ9CRx48xx_ZvvXzGdGB8DMoFHjx-nY8Ob-G2re7hjCuQmje-dMNAqf6EiHjFGwc1GVxcPgjeYOL_FTx44DyRTyXpCuxsu5bDic1UIawPQD1gU1F7oo-Yoce_v" alt="Kulüp laboratuvarında birlikte çalışan öğrenciler" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3/5 h-3/5 rounded-[24px] overflow-hidden -rotate-6 hover:rotate-0 hover:scale-[1.03] transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] p-2 bg-card border border-line shadow-2xl">
                            <img className="w-full h-full object-cover rounded-[18px] bg-line" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcNKU_g1s1h5CoyMhWmG-S_TLvaRo7yPSYm3d5KUe2x3OCnDX2S7UOIHgcbZeiu_gEbDvSeZt421aJeuk3Hh-t7Uw4TypI-IOJxLvMN_QWPos8w3rH8w56X3fEz7L8hx8vcYuWuFKrADKQHFM-yjlX105BTlLk2Iolc7C5yOLFuvtjGmjUUJ1VGbzAFbMZnme71iAYcgm2vHzuEvojtdMetmpovKa_gYEm3zjD2RRdbEpIhdk_wIpMZqGpRyECVnkLz3as6UrgRDFv" alt="Elektronik kart üzerinde çalışma" />
                        </div>
                    </div>

                    <div className="space-y-12 reveal">
                        <div className="group">
                            <h2 className="font-display text-3xl md:text-[2.6rem] font-extrabold tracking-[-0.04em] text-ink flex items-center gap-3">
                                <span className="ping-dot" aria-hidden="true" />
                                Misyonumuz
                            </h2>
                            <p className="mt-4 text-lg leading-relaxed text-muted">
                                Bilgisayar mühendisliği öğrencilerine, teorik bilgilerini pratiğe dökebilecekleri dinamik bir ortam sağlamak.
                                Teknolojik gelişmeleri yakından takip ederek üyelerimizi geleceğin mühendisleri olarak yetiştirmek ve yerel
                                çözümlerle küresel değer üretmek.
                            </p>
                        </div>
                        <div>
                            <h2 className="font-display text-3xl md:text-[2.6rem] font-extrabold tracking-[-0.04em] text-ink flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-sea" aria-hidden="true" />
                                Vizyonumuz
                            </h2>
                            <p className="mt-4 text-lg leading-relaxed text-muted">
                                Türkiye&apos;nin en üretken öğrenci topluluklarından biri olarak bilgisayar bilimleri alanında uluslararası
                                başarılara imza atmak; teknolojinin etik ve sürdürülebilir gelişimine yön veren, projeleriyle ilham veren
                                bir topluluk olmak.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Sayılar: eğik kırmızı bant */}
            <section className="relative mt-28 md:mt-40 py-6" aria-label="Sayılarla KTUCEC">
                <div className="absolute inset-x-0 inset-y-0 bg-brand -skew-y-2" aria-hidden="true" />
                <div className="relative max-w-container-max mx-auto px-5 sm:px-gutter py-14 md:py-20 grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-6 text-white reveal">
                    {[
                        { target: 500, suffix: "+", label: "Aktif üye" },
                        { target: 25, suffix: "+", label: "Yıllık etkinlik" },
                        { target: 12, suffix: "", label: "Aktif proje" },
                        { target: 15, suffix: "", label: "Sektör ortağı" },
                    ].map((s) => (
                        <div key={s.label} className="group">
                            <div className="font-display text-6xl md:text-[5.5rem] font-extrabold leading-none tracking-[-0.05em] tabular-nums transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-2 group-hover:-rotate-3" style={{ fontStretch: "80%" }}>
                                <AnimatedCounter target={s.target} suffix={s.suffix} />
                            </div>
                            <div className="mt-3 text-white/80 text-base md:text-lg">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sponsorlar */}
            <section className="py-28 md:py-36 overflow-hidden">
                <div className="max-w-container-max mx-auto px-5 sm:px-gutter mb-12 reveal">
                    <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-[-0.045em] text-ink" style={{ fontStretch: "85%" }}>
                        Bize destek olanlar
                    </h2>
                    <p className="mt-3 text-muted text-lg">Etkinliklerimizi mümkün kılan sponsorlarımıza teşekkür ederiz.</p>
                </div>

                <div className="relative reveal [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
                    <SponsorTicker logos={sponsorLogos} />
                </div>
            </section>
        </main>
    );
}
