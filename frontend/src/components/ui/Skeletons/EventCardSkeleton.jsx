export default function EventCardSkeleton({ index = 0, total = 4 }) {
    const getCardSpanClass = (idx, tot) => {
        if (tot === 1) return "md:col-span-4 md:row-span-2 min-h-[360px]";
        if (tot === 2) return "md:col-span-2 md:row-span-2 min-h-[320px]";
        if (tot === 3) {
            if (idx === 0) return "md:col-span-2 md:row-span-2 min-h-[320px]";
            return "md:col-span-2 md:row-span-1 min-h-[220px]";
        }
        if (idx === 0) return "md:col-span-2 md:row-span-2 min-h-[320px]";
        if (idx === 1) return "md:col-span-2 md:row-span-1 min-h-[220px]";
        return "md:col-span-1 md:row-span-1 min-h-[220px]";
    };

    return (
        <div
            className={`${getCardSpanClass(index, total)} bg-surface-container-low/40 rounded-[20px] md:rounded-[24px] p-5 sm:p-6 md:p-8 flex flex-col justify-between border border-outline-variant/20 animate-pulse relative overflow-hidden`}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="w-20 h-6 bg-surface-container-high/60 rounded-full"></div>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-surface-container-high/60 rounded-xl md:rounded-2xl shrink-0"></div>
            </div>

            <div className="space-y-3">
                <div className="h-6 bg-surface-container-high/60 rounded-lg w-3/4"></div>
                <div className="h-4 bg-surface-container-high/40 rounded-lg w-full"></div>
                <div className="h-4 bg-surface-container-high/40 rounded-lg w-2/3"></div>
            </div>
        </div>
    );
}