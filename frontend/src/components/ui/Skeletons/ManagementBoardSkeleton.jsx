export default function ManagementBoardSkeleton() {
    return (
        <section className="pt-16 md:pt-24 relative px-margin-mobile md:px-margin-desktop">
            {/* Arka Plan Dekorasyonu */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] right-[5%] w-[400px] h-[400px] bg-primary-container/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative">
                <div className="flex items-center gap-3 md:gap-4 mb-10 md:mb-16 px-2">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner shrink-0">
                        <span className="material-symbols-outlined text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            diversity_3
                        </span>
                    </div>
                    <div>
                        <h2 className="font-headline-md text-2xl md:text-3xl text-on-surface font-bold tracking-tight">
                            Yönetim Kadromuz
                        </h2>
                        <p className="font-body-md text-on-surface-variant text-sm mt-1">
                            Yükleniyor, lütfen bekleyin...
                        </p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest/50 backdrop-blur-md rounded-[32px] md:rounded-[40px] pt-10 pb-16 sm:pt-16 sm:pb-20 relative border border-outline-variant/30 shadow-2xl shadow-black/5 overflow-hidden">
                    <div className="relative z-10 px-6 sm:px-10 md:px-16 animate-pulse">
                        <div className="relative flex flex-col items-center">
                            {/* President Skeleton */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-surface-container-highest mb-4"></div>
                                <div className="h-6 md:h-8 w-48 bg-surface-container-highest rounded-md mb-3"></div>
                                <div className="h-5 w-32 bg-primary/20 rounded-full"></div>
                            </div>

                            {/* VPs Skeleton */}
                            <div className="flex flex-wrap justify-center gap-8 md:gap-16 relative z-20 mt-16">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex flex-col items-center text-center">
                                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-surface-container-highest mb-4 rotate-3"></div>
                                        <div className="h-5 md:h-6 w-36 bg-surface-container-highest rounded-md mb-2"></div>
                                        <div className="h-4 w-24 bg-primary/20 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Board Members Skeleton */}
                        <div className="mt-20 md:mt-28 relative w-full flex flex-col items-center">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-md h-[1px] bg-gradient-to-r from-transparent via-outline-variant/50 to-transparent"></div>
                            <div className="h-6 w-48 bg-surface-container-highest rounded-full mt-8 mb-10"></div>

                            <div className="flex gap-4 md:gap-6 overflow-hidden w-full md:w-[75%] lg:w-[60%] mx-auto justify-center">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-[140px] md:w-[185px] shrink-0">
                                        <div className="aspect-square rounded-2xl bg-surface-container-highest mb-3"></div>
                                        <div className="h-4 w-3/4 bg-surface-container-highest rounded-md mx-auto mb-2"></div>
                                        <div className="h-3 w-1/2 bg-primary/20 rounded-md mx-auto"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}