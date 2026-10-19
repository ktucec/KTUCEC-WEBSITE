"use client";

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import ContactModal from '@/components/ui/ContactModal';
import { sendContactForm } from '@/services/contact';
import { ApiError } from '@/lib/api';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await sendContactForm({
                nameSurname: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message
            });

            setIsModalOpen(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : "Mesajınız gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.";
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const channels = [
        {
            href: "mailto:ktucec@ceng.ktu.edu.tr",
            label: "E-posta",
            value: "ktucec@ceng.ktu.edu.tr",
            color: "#EA4335",
            icon: <span className="material-symbols-outlined text-[26px]" aria-hidden="true">mail</span>,
        },
        {
            href: "https://instagram.com/ktucec",
            label: "Instagram",
            value: "@ktucec",
            color: "#E4405F",
            icon: <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
        },
        {
            href: "https://www.linkedin.com/in/ktucec/",
            label: "LinkedIn",
            value: "KTÜ Bilgisayar Kulübü",
            color: "#0A66C2",
            icon: <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>,
        },
        {
            href: null,
            label: "WhatsApp topluluğu",
            value: "Yakında açılacak",
            color: "#25D366",
            icon: <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.297.298-.496.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
        },
    ];

    return (
        <>
            <main className="px-5 sm:px-gutter max-w-container-max mx-auto w-full relative z-10 pb-28">
                <PageHeader
                    crumb="İletişim"
                    lines={["Bir mesaj", "kadar yakınız."]}
                    ghost="Selam!"
                    description="İşbirliği, sponsorluk ya da merak ettiğin herhangi bir şey için bize yazabilirsin."
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                    {/* Sol: iletişim kanalları ve konum */}
                    <div className="lg:col-span-5 flex flex-col gap-3">
                        {channels.map((c, i) => {
                            const inner = (
                                <>
                                    {/* Üzerine gelince markanın rengi soldan sağa dolar */}
                                    <span
                                        className="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100"
                                        style={{ background: c.color }}
                                        aria-hidden="true"
                                    />
                                    <span
                                        className="relative grid place-items-center w-12 h-12 shrink-0 rounded-2xl transition-colors duration-500 group-hover:!bg-white/20 group-hover:!text-white"
                                        style={{ background: `${c.color}1a`, color: c.color }}
                                    >
                                        {c.icon}
                                    </span>
                                    <span className="relative min-w-0 flex-1">
                                        <span className="block text-sm text-muted transition-colors duration-500 group-hover:text-white/80">{c.label}</span>
                                        <span className="block font-display text-lg md:text-xl font-bold tracking-[-0.02em] text-ink truncate transition-colors duration-500 group-hover:text-white">{c.value}</span>
                                    </span>
                                    {c.href && (
                                        <span className="relative material-symbols-outlined text-ink transition-all duration-500 group-hover:text-white group-hover:rotate-45" aria-hidden="true">arrow_upward</span>
                                    )}
                                </>
                            );
                            const cls = "group relative overflow-hidden surface-card rounded-[22px] p-4 pr-5 flex items-center gap-4 rise-in";
                            return c.href ? (
                                <a
                                    key={c.label}
                                    href={c.href}
                                    target={c.href.startsWith("http") ? "_blank" : undefined}
                                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                    className={`${cls} hover:-translate-y-1`}
                                    style={{ animationDelay: `${0.3 + i * 0.08}s` }}
                                >
                                    {inner}
                                </a>
                            ) : (
                                <div key={c.label} className={`${cls} opacity-55 grayscale cursor-not-allowed`} style={{ animationDelay: `${0.3 + i * 0.08}s` }} title="Yakında">
                                    {inner}
                                </div>
                            );
                        })}

                        {/* Konum */}
                        <div className="group relative mt-3 rounded-[24px] overflow-hidden h-[220px] md:h-[260px] bg-line border border-line">
                            <img
                                className="w-full h-full object-cover grayscale opacity-85 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6GbIWHX5Zyl4J76Jd6rzeJ3zvutk2Na7fiQxwTfGcOr1N_6dck-r5nr9uheqofGR2YOsC_ROe7R8A7flpF5bgASv74L33pn_2_TRuLi4CjzWiNCx36KN_JbJwxO0IPOlgiOWSI2jAggOtMyVz0rVwPRCzE9xs1WFDuNg7vA4-o4AN3bs8_NTGVOzUlYIgL4bPN7BV4G2wu6l14fSWJQszKUXWcdA9Bs0SfLyBB0fNeyOQ27rlvw1KUwne9Dt74o7BuY6y179qGlVg"
                                alt="KTÜ kampüs konum haritası"
                            />
                            {/* Harita iğnesi zıplar */}
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-brand animate-bounce motion-reduce:animate-none" aria-hidden="true">
                                <span className="material-symbols-outlined text-[44px] drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                            </span>
                            <div className="absolute left-4 bottom-4 surface-glass rounded-2xl px-4 py-3">
                                <p className="text-xs text-muted">Kulüp odası</p>
                                <p className="font-display font-bold text-ink">Mühendislik Fakültesi</p>
                            </div>
                        </div>
                    </div>

                    {/* Sağ: form */}
                    <div className="lg:col-span-7">
                        <div className="spot surface-card rounded-[30px] p-6 sm:p-8 md:p-10 h-full rise-in" style={{ animationDelay: "0.35s" }}>
                            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-[-0.04em] text-ink">Mesaj gönder</h2>
                            <p className="mt-2 text-muted">Formu doldurduğun anda mesajın bize ulaşır.</p>

                            {error && (
                                <div className="mt-6 p-4 text-[15px] text-brand bg-brand/10 rounded-2xl border border-brand/25 flex items-start gap-3" role="alert">
                                    <span className="material-symbols-outlined" aria-hidden="true">error</span>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <label className="block">
                                        <span className="block text-sm font-semibold text-ink mb-2 ml-1">Ad soyad</span>
                                        <input className="field" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Adın ve soyadın" type="text" autoComplete="name" required />
                                    </label>
                                    <label className="block">
                                        <span className="block text-sm font-semibold text-ink mb-2 ml-1">E-posta</span>
                                        <input className="field" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="ornek@domain.com" type="email" autoComplete="email" required />
                                    </label>
                                </div>

                                <label className="block">
                                    <span className="block text-sm font-semibold text-ink mb-2 ml-1">Konu</span>
                                    <input className="field" id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="İşbirliği, sponsorluk, soru…" type="text" required />
                                </label>

                                <label className="block">
                                    <span className="flex justify-between text-sm font-semibold text-ink mb-2 ml-1">
                                        Mesajın
                                        <span className="font-normal text-muted tabular-nums">{formData.message.length}</span>
                                    </span>
                                    <textarea className="field resize-none" id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Ne düşündüğünü anlat" rows={5} required />
                                </label>

                                <div className="mt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <p className="text-sm text-muted">Tüm alanları doldurman gerekiyor.</p>
                                    <button disabled={isSubmitting} className="btn btn-primary disabled:opacity-60 disabled:pointer-events-none" type="submit">
                                        {isSubmitting ? 'Gönderiliyor…' : 'Mesajı gönder'}
                                        <span className={`material-symbols-outlined btn-icon text-[20px] ${isSubmitting ? 'animate-pulse' : ''}`} aria-hidden="true">send</span>
                                    </button>
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
