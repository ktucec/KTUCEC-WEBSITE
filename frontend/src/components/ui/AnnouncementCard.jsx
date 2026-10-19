// Duyuru kartı: solda büyük gün numarası, mouse'u takip eden kırmızı kenar ışığı,
// üzerine gelince yükselir ve ok dairesi dolup döner.
export default function AnnouncementCard({ title, description, date, rawDate, hasLink, index = 0, onClick }) {
    const d = rawDate ? new Date(String(rawDate).replace(" ", "T")) : null;
    const valid = d && !isNaN(d.getTime());
    const day = valid ? d.toLocaleDateString("tr-TR", { day: "2-digit" }) : null;
    const monthYear = valid ? d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }) : date;

    return (
        <article
            className="fade-up group h-full cursor-pointer"
            style={{ transitionDelay: `${index * 90}ms` }}
            onClick={onClick}
        >
            <div className="spot surface-card h-full rounded-[26px] p-6 md:p-7 flex flex-col group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_60px_-30px_rgba(215,20,26,0.35)]">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-baseline gap-2.5">
                        {day && (
                            <span className="font-display text-[3.2rem] font-extrabold leading-[0.8] tracking-[-0.05em] text-brand tabular-nums" style={{ fontStretch: "80%" }}>
                                {day}
                            </span>
                        )}
                        <span className="text-sm text-muted leading-tight capitalize">{monthYear}</span>
                    </div>
                    {hasLink && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sea/10 text-sea px-2.5 py-1 text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">link</span>
                            Bağlantı
                        </span>
                    )}
                </div>

                <h3 className="mt-6 font-display text-xl md:text-[1.4rem] font-bold leading-[1.15] tracking-[-0.02em] text-ink group-hover:text-brand transition-colors duration-300">
                    {title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted line-clamp-3">
                    {description}
                </p>

                <div className="mt-auto pt-6 flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">Devamını oku</span>
                    <span className="grid place-items-center w-10 h-10 rounded-full border border-line text-ink transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:bg-brand group-hover:border-brand group-hover:text-white group-hover:rotate-45">
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_upward</span>
                    </span>
                </div>
            </div>
        </article>
    );
}
