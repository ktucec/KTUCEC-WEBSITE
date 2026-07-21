export default function AnnouncementCard({ id, title, description, date, index, onClick }) {
    return (
        <article
            className="fade-up group cursor-pointer"
            style={{ transitionDelay: `${index * 100}ms` }}
            onClick={onClick}
        >
            <div className="glass-panel-dark rounded-[20px] md:rounded-[24px] p-5 sm:p-6 md:p-8 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-primary/10 border border-white/40 group-hover:border-primary/30 flex flex-col h-full">

                <div className="flex-grow">
                    <div className="flex items-center gap-1.5 md:gap-2 text-primary/80 font-label-md text-[11px] md:text-[12px] mb-2.5 md:mb-3">
                        <span className="material-symbols-outlined text-[14px] md:text-[16px]">calendar_today</span>
                        {date}
                    </div>
                    <h3 className="font-headline-sm text-base sm:text-lg md:text-[20px] leading-tight text-on-surface mb-2.5 md:mb-4 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="text-on-surface-variant font-body-md text-xs sm:text-sm md:text-base leading-relaxed line-clamp-3">
                        {description}
                    </p>
                </div>

                <div className="mt-4 pt-4 md:mt-6 md:pt-6 border-t border-outline-variant/20 flex items-center text-primary font-label-md text-[12px] md:text-[13px] uppercase tracking-wider group-hover:gap-2 transition-all">
                    Detayları Gör <span className="material-symbols-outlined text-[16px] md:text-[18px] ml-1">arrow_forward</span>
                </div>
            </div>
        </article>
    );
}