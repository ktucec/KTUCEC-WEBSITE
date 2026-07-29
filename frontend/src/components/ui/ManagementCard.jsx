"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const FALLBACK_GRADIENTS = [
    "from-primary/30 to-primary-container/40",
    "from-primary-container/40 to-primary/20",
    "from-primary/20 to-surface-container-highest",
    "from-primary-container/30 to-primary/30",
];

function getInitials(name) {
    if (!name) return "";
    return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

function getFullImageUrl(url) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function getRoleInfo(manager) {
    const role = manager.managerRole;
    if (role == 1 || role === "President" || role === "Admin") {
        return { label: "Başkan", tier: "president" };
    }
    if (role == 2 || role === "VicePresident") {
        return { label: "Başkan Yardımcısı", tier: "vp" };
    }
    return { label: "Yönetim Kurulu Üyesi", tier: "member" };
}

export default function ManagementCard({ manager, index = 0, isVisible = false, animationDelayMs = 0 }) {
    const { label, tier } = getRoleInfo(manager);
    const isPresident = tier === "president";
    const isVp = tier === "vp";

    return (
        <div
            className={`mb-animated-card ${isVisible ? "mb-visible" : ""} group relative rounded-[20px] p-[1px] transition-colors duration-500 ${isPresident
                    ? "bg-gradient-to-b from-primary/60 to-primary/10"
                    : isVp
                        ? "bg-gradient-to-b from-primary/35 to-transparent"
                        : "bg-gradient-to-b from-outline-variant/40 to-transparent hover:from-primary/40"
                }`}
            style={{ animationDelay: `${animationDelayMs}ms` }}
        >
            <div className="h-full bg-surface-container-lowest/90 backdrop-blur-md rounded-[19px] overflow-hidden flex flex-col shadow-sm group-hover:shadow-xl group-hover:shadow-primary/10">

                <div className="p-2 pb-0">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container">
                        {manager.profileUrl ? (
                            <img
                                src={getFullImageUrl(manager.profileUrl)}
                                alt={manager.nameSurname}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                draggable={false}
                            />
                        ) : (
                            <div
                                className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length]} group-hover:scale-105 transition-transform duration-700 ease-out`}
                            >
                                <span className="font-headline-sm text-2xl md:text-3xl text-on-surface/60 font-bold mix-blend-overlay">
                                    {getInitials(manager.nameSurname)}
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                </div>

                <div className="p-3 md:p-4 text-center flex-1 flex flex-col justify-center bg-gradient-to-b from-transparent to-surface-container-lowest">
                    <p
                        className={`font-body-md text-sm text-on-surface leading-tight group-hover:text-primary transition-colors ${isPresident ? "font-bold" : "font-semibold"
                            }`}
                    >
                        {manager.nameSurname}
                    </p>
                    <p className="mt-1.5 text-[9px] md:text-[10px] text-on-surface-variant font-label-md uppercase tracking-[0.15em]">
                        {label}
                    </p>
                </div>

            </div>
        </div>
    );
}