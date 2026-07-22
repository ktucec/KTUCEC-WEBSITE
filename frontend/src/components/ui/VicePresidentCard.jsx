"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getInitials(name) {
    if (!name) return "";
    return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

function getFullImageUrl(url) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function VicePresidentCard({ manager, isVisible, index = 0, delayBase = 600 }) {
    if (!manager) return null;

    return (
        <div
            className="mb-animated-card flex flex-col items-center text-center group z-20"
            ref={(el) => { if (el && isVisible) el.classList.add("mb-visible"); }}
            style={{ animationDelay: `${delayBase + index * 150}ms` }}
        >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl p-1 bg-gradient-to-b from-outline-variant/50 to-transparent group-hover:from-primary/50 transition-all duration-500 shadow-xl group-hover:-translate-y-2 group-hover:shadow-primary/20 rotate-3 group-hover:rotate-0">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-surface flex items-center justify-center relative -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    {manager.profileUrl ? (
                        <img
                            src={getFullImageUrl(manager.profileUrl)}
                            alt={manager.nameSurname}
                            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-500"
                            draggable={false}
                        />
                    ) : (
                        <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors duration-300">
                            <span className="font-headline-sm text-3xl md:text-4xl font-bold drop-shadow-sm">
                                {getInitials(manager.nameSurname)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/30 shadow-sm group-hover:border-primary/20 transition-colors">
                <h4 className="font-body-lg text-sm md:text-base text-on-surface font-bold whitespace-nowrap">
                    {manager.nameSurname}
                </h4>
                <p className="mt-0.5 text-[10px] md:text-xs text-primary font-label-md uppercase tracking-wider">
                    Başkan Yardımcısı
                </p>
            </div>
        </div>
    );
}