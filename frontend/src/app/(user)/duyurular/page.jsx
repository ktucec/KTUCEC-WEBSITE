'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import AnnouncementCard from '@/components/ui/AnnouncementCard';
import AnnouncementModal from '@/components/ui/AnnouncementModal';
import AnnouncementCardSkeleton from '@/components/ui/Skeletons/AnnouncementCardSkeleton';
import { getAnnouncements } from '@/services/announcements';
import { formatDate } from '@/lib/formatDate';

function AnnouncementsContent() {
    useScrollAnimation();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [announcements, setAnnouncements] = useState([]);
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    useScrollAnimation([isLoading, filteredAnnouncements, currentPage]);

    useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(window.innerWidth < 768 ? 4 : 6);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let isCancelled = false;

        async function fetchAllAnnouncements() {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getAnnouncements();
                if (!isCancelled) {
                    setAnnouncements(result.data || []);
                    setFilteredAnnouncements(result.data || []);
                    setCurrentPage(1);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError("Duyurular sunucudan çekilirken bir hata oluştu.");
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchAllAnnouncements();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        const idParam = searchParams.get('id');
        if (idParam && announcements.length > 0) {
            const found = announcements.find(a => a.id === Number(idParam));
            if (found) {
                setSelectedAnnouncement(found);
                setIsModalOpen(true);
            }
        }
    }, [searchParams, announcements]);

    const handleFilter = () => {
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            alert("Başlangıç tarihi, bitiş tarihinden sonraki bir tarih olamaz.");
            return;
        }

        const filtered = announcements.filter(item => {
            if (!item.createdAt) return false;

            const itemTime = new Date(item.createdAt).getTime();
            if (isNaN(itemTime)) return false;

            let isValid = true;

            if (startDate) {
                const startObj = new Date(startDate);
                startObj.setHours(0, 0, 0, 0);
                if (itemTime < startObj.getTime()) isValid = false;
            }

            if (endDate) {
                const endObj = new Date(endDate);
                endObj.setHours(23, 59, 59, 999);
                if (itemTime > endObj.getTime()) isValid = false;
            }

            return isValid;
        });

        setFilteredAnnouncements(filtered);
        setCurrentPage(1);
    };

    const handleClearFilter = () => {
        setStartDate('');
        setEndDate('');
        setFilteredAnnouncements(announcements);
        setCurrentPage(1);
    };

    const handleOpenModal = async (announcement) => {
        setIsModalOpen(true);
        setIsModalLoading(true);
        router.replace(`/duyurular?id=${announcement.id}`, { scroll: false });

        await new Promise(resolve => setTimeout(resolve, 500));

        setSelectedAnnouncement(announcement);
        setIsModalLoading(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setSelectedAnnouncement(null);
            setIsModalLoading(false);
        }, 300);
        router.replace('/duyurular', { scroll: false });
    };

    const totalPages = Math.max(1, Math.ceil(filteredAnnouncements.length / itemsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAnnouncements.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            const listElement = document.getElementById('announcements-list');
            if (listElement) {
                window.scrollTo({ top: listElement.offsetTop - 100, behavior: 'smooth' });
            }
        }
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 3;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            if (currentPage <= 2) {
                pageNumbers.push(1, 2, 3);
            } else if (currentPage >= totalPages - 1) {
                pageNumbers.push(totalPages - 2, totalPages - 1, totalPages);
            } else {
                pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
            }
        }
        return pageNumbers;
    };

    return (
        <>
            <main className="pt-32 pb-24 px-gutter max-w-container-max mx-auto relative z-10">
                <section className="mb-12">
                    <nav className="flex items-center flex-wrap gap-1.5 md:gap-2 text-on-surface-variant/60 font-label-md text-xs md:text-label-md mb-3 md:mb-4 uppercase tracking-widest">
                        <Link href="/" className="hover:text-primary transition-colors">
                            Ana Sayfa
                        </Link>
                        <span className="material-symbols-outlined text-[12px] md:text-[14px] shrink-0">
                            chevron_right
                        </span>
                        <span className="text-primary font-bold">
                            Duyurular
                        </span>
                    </nav>
                    <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary mb-6">Duyurular</h1>
                    <p className="font-size-10 font-body-lg md:text-body-lg text-on-surface-variant max-w-2xl">
                        Bilgisayar Mühendisliği topluluğumuzdan en güncel haberler, teknik makaleler ve kariyer fırsatları.
                    </p>
                </section>

                <section className="fade-up mb-10 md:mb-16">
                    <div className="glass-panel p-5 sm:p-6 md:p-8 rounded-[20px] md:rounded-[24px] shadow-sm flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-6 border-white/60">
                        <div className="w-full md:w-auto flex-1">
                            <label className="block font-label-md text-xs md:text-label-md text-on-surface-variant mb-1.5 md:mb-2 uppercase tracking-wider">
                                Başlangıç Tarihi
                            </label>
                            <div className="relative">
                                <input
                                    value={startDate}
                                    max={endDate || undefined}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-white/50 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 md:px-4 md:py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-body-md text-sm md:text-base text-on-surface"
                                    type="date"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex-1">
                            <label className="block font-label-md text-xs md:text-label-md text-on-surface-variant mb-1.5 md:mb-2 uppercase tracking-wider">
                                Bitiş Tarihi
                            </label>
                            <div className="relative">
                                <input
                                    value={endDate}
                                    min={startDate || undefined}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-white/50 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 md:px-4 md:py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-body-md text-sm md:text-base text-on-surface"
                                    type="date"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex flex-col gap-2">
                            <button
                                onClick={handleFilter}
                                className="w-full bg-primary text-white px-8 md:px-10 py-3 md:py-3.5 rounded-xl font-label-md text-xs md:text-label-md uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px] md:text-[20px]">filter_list</span>
                                Filtrele
                            </button>
                            {(startDate || endDate) && (
                                <button
                                    onClick={handleClearFilter}
                                    className="w-full text-error text-xs md:text-sm font-medium hover:underline flex justify-center items-center cursor-pointer"
                                >
                                    Filtreyi Temizle
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {error ? (
                    <div className="text-center py-12">
                        <p className="text-error font-body-lg">{error}</p>
                    </div>
                ) : (
                    <>
                        <div id="announcements-list" className="scroll-mt-32">
                            {isLoading ? (
                                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {Array.from({ length: itemsPerPage }).map((_, index) => (
                                        <AnnouncementCardSkeleton key={index} index={index} />
                                    ))}
                                </section>
                            ) : filteredAnnouncements.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center py-20 opacity-60">
                                    <span className="material-symbols-outlined text-5xl mb-3 text-on-surface-variant">
                                        campaign
                                    </span>
                                    <p className="font-body-lg text-on-surface-variant">
                                        Duyuru bulunamadı.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {currentItems.map((item, index) => (
                                            <AnnouncementCard
                                                key={item.id}
                                                id={item.id}
                                                title={item.title}
                                                description={item.content}
                                                date={formatDate(item.createdAt)}
                                                index={index}
                                                onClick={() => handleOpenModal(item)}
                                            />
                                        ))}
                                    </section>

                                    {totalPages > 1 && (
                                        <nav className="mt-10 md:mt-20 flex justify-center items-center gap-1.5 sm:gap-2 fade-up">
                                            <button
                                                onClick={() => paginate(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="glass-panel w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-sm sm:text-base md:text-xl">chevron_left</span>
                                            </button>

                                            {getPageNumbers().map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => paginate(num)}
                                                    className={`w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm md:text-base transition-all cursor-pointer ${currentPage === num
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                        : 'glass-panel text-on-surface-variant hover:text-primary hover:border-primary'
                                                        }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}

                                            {totalPages > 3 && currentPage < totalPages - 1 && (
                                                <span className="px-1 sm:px-2 text-on-surface-variant text-xs sm:text-sm select-none">...</span>
                                            )}

                                            <button
                                                onClick={() => paginate(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="glass-panel w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-sm sm:text-base md:text-xl">chevron_right</span>
                                            </button>
                                        </nav>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </main>

            <AnnouncementModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                announcement={selectedAnnouncement}
                isLoading={isModalLoading}
            />
        </>
    );
}

export default function AnnouncementsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <AnnouncementsContent />
        </Suspense>
    );
}