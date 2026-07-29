export default function ManagementBoardSkeleton() {
    const placeholders = Array.from({ length: 10 });

    return (
        <section className="pt-16 md:pt-24 relative" id="yonetim">
            <div className="max-w-7xl mx-auto relative">

                <div className="flex items-center gap-3 md:gap-4 mb-10 md:mb-16 px-2">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high animate-pulse shrink-0"></div>
                    <div className="flex flex-col gap-2">
                        <div className="h-6 md:h-7 w-48 md:w-56 rounded-md bg-surface-container-high animate-pulse"></div>
                        <div className="h-4 w-64 rounded-md bg-surface-container-high/70 animate-pulse"></div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest/50 backdrop-blur-md rounded-[32px] md:rounded-[40px] py-10 md:py-16 relative border border-outline-variant/30 shadow-2xl shadow-black/5 overflow-hidden">
                    <div className="relative z-10 px-6 sm:px-10 md:px-14">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7">
                            {placeholders.map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-[20px] p-[1px] bg-gradient-to-b from-outline-variant/30 to-transparent"
                                >
                                    <div className="h-full bg-surface-container-lowest/90 rounded-[19px] overflow-hidden flex flex-col shadow-sm">
                                        <div className="p-2 pb-0">
                                            <div className="aspect-square rounded-2xl bg-surface-container-high animate-pulse"></div>
                                        </div>
                                        <div className="p-3 md:p-4 flex flex-col items-center gap-2">
                                            <div className="h-3.5 w-3/4 rounded bg-surface-container-high animate-pulse"></div>
                                            <div className="h-2.5 w-1/2 rounded bg-surface-container-high/70 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}