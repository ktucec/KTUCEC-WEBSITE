'use client';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { useCodewave } from '@/components/context/CodewaveContext';
import Reveal from '@/components/ui/Reveal';

export default function Contact() {
    const { d, lang } = useCodewave();

    const mapsUrl = "https://maps.google.com/?q=KTÜ+Prof.+Dr.+Osman+Turan+Kültür+ve+Kongre+Merkezi";
    const embedMapsUrl = "https://maps.google.com/maps?q=KT%C3%9C%20Prof.%20Dr.%20Osman%20Turan%20K%C3%BClt%C3%BCr%20ve%20Kongre%20Merkezi&t=&z=15&ie=UTF8&iwloc=&output=embed";

    return (
        <section id="contact" className="section">
            <Reveal>
                <p className="label">07 / {lang === 'TR' ? 'İLETİŞİM' : 'CONNECT'}</p>
                <h2 className="contact-heading">{d.contact}</h2>
            </Reveal>

            <div className="contact-grid">
                <Reveal>
                    <article className="premium-border-card">
                        <div className="premium-border-card-inner contact-info-inner">
                            <h3 className="info-title">
                                {lang === 'TR' ? 'Bize Ulaşın' : 'Reach Out'}
                            </h3>
                            <p className="info-desc">
                                {lang === 'TR'
                                    ? 'Sponsorluk, iş birlikleri ve tüm sorularınız için bizimle iletişime geçebilirsiniz.'
                                    : 'Feel free to contact us for sponsorships, partnerships, and all your inquiries.'}
                            </p>

                            <div className="contact-links">
                                <a href="tel:+905436657210" className="contact-link">
                                    <div className="icon-box"><Phone size={20} /></div>
                                    <span>+90 (543) 665 72 10</span>
                                </a>
                                <a href="mailto:turkalinehir@gmail.com" className="contact-link">
                                    <div className="icon-box"><Mail size={20} /></div>
                                    <span>turkalinehir@gmail.com</span>
                                </a>
                                <a href="mailto:ktucec@ceng.ktu.edu.tr" className="contact-link">
                                    <div className="icon-box"><Mail size={20} /></div>
                                    <span>ktucec@ceng.ktu.edu.tr</span>
                                </a>
                            </div>
                        </div>
                    </article>
                </Reveal>

                <Reveal>
                    <article className="premium-border-card">
                        <div className="premium-border-card-inner map-inner">
                            <div className="map-header">
                                <p className="label">{d.location}</p>
                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="maps-open-btn"
                                >
                                    <span>{lang === 'TR' ? 'Haritalarda Aç' : 'Open in Maps'}</span>
                                    <ExternalLink size={14} />
                                </a>
                            </div>

                            {/* Gerçek Google Maps Etkileşimli Alanı */}
                            <div className="map-embed-container">
                                <iframe
                                    title="KTÜ Prof. Dr. Osman Turan Kültür ve Kongre Merkezi"
                                    src={embedMapsUrl}
                                    className="map-iframe"
                                    loading="lazy"
                                    allowFullScreen
                                />
                            </div>

                            <div className="map-footer">
                                <strong>
                                    <MapPin size={16} className="inline-icon" />
                                    KTÜ PROF. DR. OSMAN TURAN KÜLTÜR VE KONGRE MERKEZİ
                                </strong>
                                <small>Ortahisar / Trabzon</small>
                            </div>
                        </div>
                    </article>
                </Reveal>
            </div>
        </section>
    );
}