import Marquee from "./Marquee";

const topics = ["Yazılım", "Gömülü sistemler", "Yapay zeka", "Siber güvenlik", "Hackathon", "Web", "Mobil", "CODEWAVE"];
const verbs = ["Öğren", "Üret", "Paylaş", "Tanış", "Yarış", "Eğlen"];

// Hero'nun altında birbirini kesen iki kayan bant
export default function TopicBands() {
    return (
        <section className="relative z-10 -mt-10 md:-mt-14 mb-4 h-[190px] md:h-[250px] overflow-hidden pointer-events-none select-none" aria-label="İlgi alanlarımız">
            <div className="absolute inset-x-[-5%] top-[52%] -rotate-[2deg] bg-ink text-paper py-3 md:py-4 shadow-xl">
                <Marquee
                    items={verbs}
                    reverse
                    baseSpeed={0.4}
                    separator="/"
                    itemClassName="font-display font-semibold text-xl md:text-2xl tracking-[-0.02em]"
                />
            </div>
            <div className="absolute inset-x-[-5%] top-[14%] rotate-[2deg] bg-brand text-white py-3.5 md:py-5 shadow-[0_20px_50px_-20px_rgba(215,20,26,0.6)]">
                <Marquee
                    items={topics}
                    itemClassName="font-display font-extrabold text-2xl md:text-[2.4rem] tracking-[-0.035em]"
                />
            </div>
        </section>
    );
}
