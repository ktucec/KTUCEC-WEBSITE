'use client';
import { Mail, ArrowUpRight } from 'lucide-react';
import { useCodewave } from '@/editions/2025/components/context/CodewaveContext';
import { SOCIALS } from '@/editions/2025/data';
import Reveal from '@/editions/2025/components/ui/Reveal';
import SplitText from '@/editions/2025/components/ui/SplitText';
import SpotCard from '@/editions/2025/components/ui/SpotCard';
import Magnetic from '@/editions/2025/components/ui/Magnetic';

export default function Contact() {
    const { d } = useCodewave();

    return (
        <section id="contact" className="section">
            <Reveal>
                <p className="label">06 / CONNECT</p>
            </Reveal>
            <h2 className="contact-heading">
                <SplitText text={d.contact} />
            </h2>

            <div className="contact-grid">
                <Reveal>
                    <SpotCard as="article" className="contact-card">
                        <p className="info-desc">{d.contactDesc}</p>

                        <a href={SOCIALS.mail} className="contact-link">
                            <span className="icon-box"><Mail size={20} /></span>
                            <span>ktucec@ceng.ktu.edu.tr</span>
                        </a>

                        <p className="label follow">{d.followUs}</p>
                        <div className="social-pills">
                            <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
                            <a href={SOCIALS.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                            <a href={SOCIALS.x} target="_blank" rel="noopener noreferrer">X</a>
                        </div>
                    </SpotCard>
                </Reveal>

                <Reveal delay={140}>
                    <article className="next-wave">
                        <div className="nw-border" aria-hidden="true" />
                        <div className="nw-inner">
                            <p className="label">{d.nextWave}</p>
                            <h3>
                                {d.nextWaveTitle[0]} <em>{d.nextWaveTitle[1]}</em>
                            </h3>
                            <p className="nw-text">{d.nextWaveText}</p>
                            <Magnetic>
                                <a className="btn btn-primary" href="/">
                                    <span>{d.nextWaveCta}</span>
                                    <ArrowUpRight size={16} />
                                </a>
                            </Magnetic>
                        </div>
                    </article>
                </Reveal>
            </div>
        </section>
    );
}
