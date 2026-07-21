export default function AnnouncementCardSkeleton({ index = 0 }) {
    return (
        <div
            className="fade-up"
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            <div className="glass-panel-dark rounded-[20px] md:rounded-[24px] p-5 sm:p-6 md:p-8 border border-white/40 flex flex-col h-full animate-pulse">

                <div className="flex-grow">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-2.5 md:mb-3">
                        <div className="w-[14px] h-[14px] md:w-[16px] md:h-[16px] rounded-full bg-outline-variant/30" />
                        <div className="h-3 w-24 rounded bg-outline-variant/30" />
                    </div>

                    <div className="h-5 md:h-6 w-4/5 rounded bg-outline-variant/30 mb-2.5 md:mb-4" />

                    <div className="space-y-2">
                        <div className="h-3 md:h-4 w-full rounded bg-outline-variant/20" />
                        <div className="h-3 md:h-4 w-full rounded bg-outline-variant/20" />
                        <div className="h-3 md:h-4 w-2/3 rounded bg-outline-variant/20" />
                    </div>
                </div>

                <div className="mt-4 pt-4 md:mt-6 md:pt-6 border-t border-outline-variant/20 flex items-center">
                    <div className="h-3 w-28 rounded bg-outline-variant/30" />
                </div>
            </div>
        </div>
    );
}