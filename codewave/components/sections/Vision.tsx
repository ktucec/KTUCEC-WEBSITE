'use client';
import { Network, Cpu, FileSearch } from 'lucide-react';
import { useCodewave } from '@/components/context/CodewaveContext';
import Reveal from '@/components/ui/Reveal';

function TechFileIcon({ lang }: { lang: string }) {
    return (
        <div className="tech-file-ui floating-element">
            <div className="file-header">
                <span>CV_DATA.SYS</span>
                <span className="blink-text">REC</span>
            </div>
            <div className="file-body">
                <FileSearch size={32} className="neon-pink" />
                <div className="scan-line-container">
                    <div className="scan-line" />
                </div>
            </div>
            <div className="file-footer">
                {lang === 'TR' ? '> EŞLEŞME: %98' : '> MATCH: 98%'}
            </div>
        </div>
    );
}

export default function Vision() {
    const { d, lang } = useCodewave();

    return (
        <section className="section vision">
            <Reveal>
                <p className="label">05 / NEXT WAVE</p>
                <h2 className="vision-heading">{d.vision}</h2>
            </Reveal>

            <div className="bento">
                <Reveal>
                    {/* Kart 1: Geniş Kart */}
                    <article className="cyber-card bento-large">
                        <div className="cyber-card-inner">
                            <div className="card-bg-grid" />
                            <div className="cyber-header">
                                <span className="tech-tag">_01 // {lang === 'TR' ? 'YETENEK AVI' : 'TALENT HUNT'}</span>
                                <div className="status-dot" />
                            </div>

                            <div className="cyber-content">
                                <div className="wireframe"><TechFileIcon lang={lang} /></div>
                                <h3>
                                    {lang === 'TR' ? 'DİJİTAL CV HAVUZU' : 'DIGITAL CV POOL'}<br />
                                    <em>{lang === 'TR' ? 'VE YETENEK AVI' : '& TALENT HUNT'}</em>
                                </h3>
                                <p>
                                    {lang === 'TR'
                                        ? 'Sponsorlarımız, katılımcıların özgeçmişlerine doğrudan erişerek benzersiz bir yetenek havuzuna ulaşacak.'
                                        : 'Sponsors will access participant CVs directly, unlocking a unique talent pool.'}
                                </p>
                            </div>
                        </div>
                    </article>
                </Reveal>

                <Reveal>
                    {/* Kart 2: Standart Kart */}
                    <article className="cyber-card">
                        <div className="cyber-card-inner">
                            <div className="card-bg-grid" />
                            <div className="cyber-header">
                                <span className="tech-tag">_02 // NETWORK</span>
                                <div className="status-dot" />
                            </div>

                            <div className="cyber-content">
                                <Network size={38} className="neon-pink floating-icon" />
                                <h3>
                                    {lang === 'TR' ? 'İNTERAKTİF FUAYE' : 'INTERACTIVE FOYER'}<br />
                                    <em>NETWORKING</em>
                                </h3>
                                <p>
                                    {lang === 'TR'
                                        ? 'Kahve aralarında yetenekli gençlerle birebir tanışma fırsatı.'
                                        : 'Meet talented young people between sessions.'}
                                </p>
                            </div>
                        </div>
                    </article>
                </Reveal>

                <Reveal>
                    {/* Kart 3: Standart Kart */}
                    <article className="cyber-card">
                        <div className="cyber-card-inner">
                            <div className="card-bg-grid" />
                            <div className="cyber-header">
                                <span className="tech-tag">_03 // SCALE</span>
                                <div className="status-dot" />
                            </div>

                            <div className="cyber-content">
                                <Cpu size={38} className="neon-pink floating-icon" />
                                <h3>
                                    250+ {lang === 'TR' ? 'TEKNOLOJİ' : 'TECH'}<br />
                                    <em>{lang === 'TR' ? 'TUTKUNU' : 'ENTHUSIASTS'}</em>
                                </h3>
                                <p>
                                    {lang === 'TR'
                                        ? 'Osman Turan Kültür Merkezi’nde daha geniş bir hedef kitle.'
                                        : 'A bigger audience at Osman Turan Cultural Center.'}
                                </p>
                            </div>
                        </div>
                    </article>
                </Reveal>
            </div>
        </section>
    );
}