export default function AnnouncementCardSkeleton({ index = 0 }) {
    return (
        <div className="fade-up h-full" style={{ transitionDelay: `${index * 90}ms` }}>
            <div className="surface-card rounded-[26px] p-6 md:p-7 flex flex-col h-full min-h-[280px] animate-pulse">
                <div className="flex items-baseline gap-2.5">
                    <div className="h-11 w-14 rounded-lg bg-line" />
                    <div className="h-3.5 w-24 rounded bg-line" />
                </div>
                <div className="mt-6 h-6 w-4/5 rounded bg-line" />
                <div className="mt-4 space-y-2">
                    <div className="h-3.5 w-full rounded bg-line/70" />
                    <div className="h-3.5 w-full rounded bg-line/70" />
                    <div className="h-3.5 w-2/3 rounded bg-line/70" />
                </div>
                <div className="mt-auto pt-6 flex items-center justify-between">
                    <div className="h-3.5 w-24 rounded bg-line" />
                    <div className="h-10 w-10 rounded-full bg-line" />
                </div>
            </div>
        </div>
    );
}
