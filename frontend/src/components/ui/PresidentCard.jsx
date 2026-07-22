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

export default function PresidentCard({ manager, isVisible }) {
    if (!manager) return null;

    return (
        <div
            className="mb-animated-card relative z-20 flex flex-col items-center text-center"
            ref={(el) => { if (el && isVisible) el.classList.add("mb-visible"); }}
            style={{ animationDelay: "0ms" }}
        >
            <div className="relative mb-6">
                <div className="mb-pulse-bg absolute inset-0 bg-primary/30 rounded-full blur-xl pointer-events-none"></div>

                <div className="mb-float relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-gradient-to-b from-primary via-primary-container to-surface-container-lowest shadow-2xl shadow-primary/20">
                    <div className="w-full h-full rounded-full overflow-hidden bg-surface flex items-center justify-center border-4 border-surface relative">
                        {manager.profileUrl ? (
                            <img
                                src={getFullImageUrl(manager.profileUrl)}
                                alt={manager.nameSurname}
                                className="w-full h-full object-cover"
                                draggable={false}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                                <span className="font-headline-md text-3xl md:text-5xl text-white font-bold tracking-wider drop-shadow-md">
                                    {getInitials(manager.nameSurname)}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="absolute -bottom-2 right-2 w-10 h-10 rounded-full bg-surface border-2 border-primary/20 flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            workspace_premium
                        </span>
                    </div>
                </div>
            </div>
            <h3 className="font-headline-sm text-2xl md:text-3xl text-on-surface font-extrabold tracking-tight">
                {manager.nameSurname}
            </h3>
            <span className="mt-2.5 bg-primary text-white px-5 py-1.5 rounded-full font-label-md text-xs md:text-sm uppercase tracking-widest shadow-md shadow-primary/30">
                Kulüp Başkanı
            </span>
        </div>
    );
}