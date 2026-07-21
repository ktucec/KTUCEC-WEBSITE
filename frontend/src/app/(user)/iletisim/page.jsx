"use client";

import { useState } from 'react';
import Link from 'next/link';
import ContactModal from '@/components/ui/ContactModal';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            setIsModalOpen(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1200);
    };

    return (
        <>
            <main className="flex-grow pt-32 pb-24 px-gutter max-w-container-max mx-auto w-full relative z-10">
                {/* Hero & Breadcrumb Section */}
                <div className="mb-16 text-left max-w-2xl">
                    <nav className="flex items-center flex-wrap gap-1.5 md:gap-2 text-on-surface-variant/60 font-label-md text-xs md:text-label-md mb-3 md:mb-4 uppercase tracking-widest">
                        <Link href="/" className="hover:text-primary transition-colors">
                            Ana Sayfa
                        </Link>
                        <span className="material-symbols-outlined text-[12px] md:text-[14px] shrink-0">
                            chevron_right
                        </span>
                        <span className="text-primary font-bold">
                            İletişim
                        </span>
                    </nav>
                    <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary mb-6">
                        İletişime Geçin
                    </h1>
                    <p className="font-size-10 font-body-lg md:text-body-lg  text-on-surface-variant max-w-2xl">
                        KTÜ Bilgisayar Mühendisliği Kulübü ile bağlantı kurun. Birlikte üretmeye, yenilikler geliştirmeye ve geleceği kodlamaya hazırız.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
                    {/* Left Col */}
                    <div className="md:col-span-5 flex flex-col gap-8">
                        {/* Mobile view */}
                        <div className="grid grid-cols-4 gap-3 mx-auto md:hidden">
                            {/* E-Mail */}
                            <a
                                href="mailto:contact@ktucec.org"
                                title="E-Posta Gönder"
                                className="aspect-square bg-white text-[#EA4335] border border-gray-100 rounded-2xl p-2 flex items-center justify-center shadow-sm hover:bg-[#EA4335] hover:text-white active:bg-[#C5221F] active:scale-95 hover:-translate-y-1 transition-all duration-300 ease-in-out group"
                            >
                                <span
                                    className="material-symbols-outlined group-hover:scale-110 transition-transform duration-300"
                                    style={{ fontSize: '44px' }}
                                >
                                    mail
                                </span>
                            </a>

                            {/* WhatsApp */}
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp Topluluğumuz"
                                className="aspect-square bg-white text-[#25D366] border border-gray-100 rounded-2xl p-2 flex items-center justify-center shadow-sm hover:bg-[#25D366] hover:text-white active:bg-[#128C7E] active:scale-95 hover:-translate-y-1 transition-all duration-300 ease-in-out group"
                            >
                                <svg className="w-11 h-11 fill-current group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.297.298-.496.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </a>

                            {/* Instagram */}
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Instagram Sayfamız"
                                className="aspect-square bg-white text-[#E4405F] border border-gray-100 rounded-2xl p-2 flex items-center justify-center shadow-sm hover:bg-[#E4405F] hover:text-white active:scale-95 hover:-translate-y-1 transition-all duration-300 ease-in-out group"
                            >
                                <svg className="w-11 h-11 fill-current group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>

                            {/* LinkedIn */}
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="LinkedIn Hesabımız"
                                className="aspect-square bg-white text-[#0A66C2] border border-gray-100 rounded-2xl p-2 flex items-center justify-center shadow-sm hover:bg-[#0A66C2] hover:text-white active:bg-[#004182] active:scale-95 hover:-translate-y-1 transition-all duration-300 ease-in-out group"
                            >
                                <svg className="w-11 h-11 fill-current group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                        </div>

                        {/* desktop view */}
                        <div className="hidden md:flex flex-col gap-4">
                            {/* E-Posta / Mail */}
                            <a
                                href="mailto:contact@ktucec.org"
                                className="glass-panel rounded-3xl p-6 flex items-center gap-6 group hover:-translate-y-1 transition-transform duration-300"
                            >
                                <div className="w-12 h-12 shrink-0 rounded-full bg-[#EA4335]/10 flex items-center justify-center text-[#EA4335] group-hover:bg-[#EA4335] group-hover:text-white transition-colors duration-300">
                                    <span className="material-symbols-outlined text-[28px]">mail</span>
                                </div>
                                <div>
                                    <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-1">E-Posta Adresi</h3>
                                    <p className="font-body-lg text-body-lg text-on-background font-semibold">contact@ktucec.org</p>
                                </div>
                            </a>

                            {/* WhatsApp */}
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glass-panel rounded-3xl p-6 flex items-center gap-6 group hover:-translate-y-1 transition-transform duration-300"
                            >
                                <div className="w-12 h-12 shrink-0 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors duration-300">
                                    <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                                        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.221h.005c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.038-5.176-2.925-7.062A9.924 9.924 0 0012.012 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-1">WhatsApp Topluluğu</h3>
                                    <p className="font-body-lg text-body-lg text-on-background font-semibold">Aramıza Katılın</p>
                                </div>
                            </a>

                            {/* Instagram */}
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glass-panel rounded-3xl p-6 flex items-center gap-6 group hover:-translate-y-1 transition-transform duration-300"
                            >
                                <div className="w-12 h-12 shrink-0 rounded-full bg-[#E4405F]/10 flex items-center justify-center text-[#E4405F] group-hover:bg-[#E4405F] group-hover:text-white transition-colors duration-300">
                                    <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-1">Instagram</h3>
                                    <p className="font-body-lg text-body-lg text-on-background font-semibold">@ktucec</p>
                                </div>
                            </a>

                            {/* LinkedIn */}
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glass-panel rounded-[24px] p-6 flex items-center gap-6 group hover:-translate-y-1 transition-transform duration-300"
                            >
                                <div className="w-12 h-12 shrink-0 rounded-full bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2] group-hover:bg-[#0A66C2] group-hover:text-white transition-colors duration-300">
                                    <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-1">LinkedIn</h3>
                                    <p className="font-body-lg text-body-lg text-on-background font-semibold">KTÜ Bilgisayar Kulübü</p>
                                </div>
                            </a>
                        </div>

                        {/* Map */}
                        <div className="glass-panel rounded-[24px] overflow-hidden p-2 relative h-[210px] md:h-[270px]">
                            <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-white/50">
                                <h4 className="font-label-md text-label-md text-on-background font-bold">Kulüp Odası</h4>
                                <p className="font-body-md text-body-md text-secondary text-sm">Mühendislik Fakültesi, B Blok</p>
                            </div>
                            <div className="w-full h-full rounded-[16px] bg-surface-container-highest overflow-hidden">
                                <img
                                    className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6GbIWHX5Zyl4J76Jd6rzeJ3zvutk2Na7fiQxwTfGcOr1N_6dck-r5nr9uheqofGR2YOsC_ROe7R8A7flpF5bgASv74L33pn_2_TRuLi4CjzWiNCx36KN_JbJwxO0IPOlgiOWSI2jAggOtMyVz0rVwPRCzE9xs1WFDuNg7vA4-o4AN3bs8_NTGVOzUlYIgL4bPN7BV4G2wu6l14fSWJQszKUXWcdA9Bs0SfLyBB0fNeyOQ27rlvw1KUwne9Dt74o7BuY6y179qGlVg"
                                    alt="KTÜ Kampüs Konum Haritası"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Col */}
                    <div className="md:col-span-7">
                        <div className="glass-panel rounded-[20px] sm:rounded-[24px] md:rounded-[32px] p-5 sm:p-8 md:p-12 relative overflow-hidden h-full">

                            <h2 className="font-headline-md mt-6 md:mt-0 text-2xl md:text-headline-md text-on-background mb-6 md:mb-8 border-l-4 border-primary pl-3 md:pl-4 flex items-center">
                                İletişim Formu
                            </h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-6 pt-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="flex flex-col gap-1.5 md:gap-2">
                                        <label className="font-label-md text-sm md:text-label-md text-secondary ml-1 md:ml-2" htmlFor="name">
                                            Ad Soyad
                                        </label>
                                        <input
                                            className="input-glass rounded-xl px-4 py-3 md:px-5 md:py-4 font-body-md text-sm md:text-body-lg text-on-background w-full"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Adınız ve Soyadınız"
                                            type="text"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 md:gap-2">
                                        <label className="font-label-md text-sm md:text-label-md text-secondary ml-1 md:ml-2" htmlFor="email">
                                            E-Posta Adresi
                                        </label>
                                        <input
                                            className="input-glass rounded-xl px-4 py-3 md:px-5 md:py-4 font-body-md text-sm md:text-body-lg text-on-background w-full"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="ornek@domain.com"
                                            type="email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 md:gap-2">
                                    <label className="font-label-md text-sm md:text-label-md text-secondary ml-1 md:ml-2" htmlFor="subject">
                                        Konu
                                    </label>
                                    <input
                                        className="input-glass rounded-xl px-4 py-3 md:px-5 md:py-4 font-body-md text-sm md:text-body-lg text-on-background w-full"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="İşbirliği, Sponsorluk, Soru vb."
                                        type="text"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 md:gap-2">
                                    <label className="font-label-md text-sm md:text-label-md text-secondary ml-1 md:ml-2" htmlFor="message">
                                        Mesajınız
                                    </label>
                                    <textarea
                                        className="input-glass rounded-xl px-4 py-3 md:px-5 md:py-4 font-body-md text-sm md:text-body-lg text-on-background w-full resize-none"
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Detaylı mesajınızı buraya yazabilirsiniz..."
                                        rows={4}
                                        required
                                    ></textarea>
                                </div>

                                <div className="mt-2 md:mt-4 flex justify-end">
                                    <button
                                        disabled={isSubmitting}
                                        className="btn-glow bg-primary-container text-white font-label-md text-xs md:text-label-md py-3.5 md:py-4 px-8 md:px-10 rounded-xl flex items-center gap-2 md:gap-3 w-full md:w-auto justify-center disabled:opacity-50 cursor-pointer"
                                        type="submit"
                                    >
                                        <span>{isSubmitting ? 'Gönderiliyor...' : 'Gönder'}</span>
                                        <span className="material-symbols-outlined text-[18px] md:text-[24px]">send</span>
                                    </button>
                                </div>
                                <div>
                                    <small className="font-body-md text-xs md:text-sm opacity-60 leading-relaxed block">
                                        *İletişim formlarınız saniyeler içinde bize ulaşır. Formu doldurarak bizimle kolayca iletişime geçebilirsiniz.
                                    </small>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <ContactModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}