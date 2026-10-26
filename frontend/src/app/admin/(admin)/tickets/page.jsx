'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { scanTicket } from '@/services/tickets';
import { formatDateTime } from '@/lib/adminFormat';
import { Badge, Icon, PageHeader } from '@/components/admin/ui';

// QR'daki bağlantı: https://codewave.ktucec.com/bilet/<20 karakterlik kod>. Düz kod da kabul edilir.
const CODE_RE = /[2-9A-HJKMNP-Z]{20}/i;
const extractCode = (text) => {
    const m = String(text || '').toUpperCase().match(CODE_RE);
    return m ? m[0] : null;
};

const ATTENDEE = { Student: 'Öğrenci', Professional: 'Çalışan', Other: 'Diğer' };

// Tarayıcının yerleşik QR okuyucusu (Chrome/Edge/Android) varsa o, yoksa (iOS Safari) jsQR kullanılır.
async function createDecoder() {
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            return async (video) => {
                const found = await detector.detect(video);
                return found[0]?.rawValue ?? null;
            };
        } catch {
            /* jsQR'a düş */
        }
    }
    const { default: jsQR } = await import('jsqr');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    return async (video) => {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return null;
        const scale = Math.min(1, 640 / w);
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return jsQR(img.data, img.width, img.height)?.data ?? null;
    };
}

export default function TicketScanPage() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const decodeRef = useRef(null);
    const loopRef = useRef(0);
    const pausedRef = useRef(false);
    const busyRef = useRef(false);

    const [cameraOn, setCameraOn] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [manual, setManual] = useState('');
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null); // { kind: 'valid' | 'refunded' | 'notfound' | 'error', data?, message? }
    const [recent, setRecent] = useState([]);

    const stopCamera = useCallback(() => {
        cancelAnimationFrame(loopRef.current);
        loopRef.current = 0;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraOn(false);
    }, []);

    useEffect(() => stopCamera, [stopCamera]);

    const submit = useCallback(async (raw) => {
        const code = extractCode(raw);
        if (busyRef.current) return;
        pausedRef.current = true;

        if (!code) {
            setResult({ kind: 'notfound', message: 'Bu QR bir CODEWAVE bileti değil.' });
            navigator.vibrate?.([120, 60, 120]);
            return;
        }

        busyRef.current = true;
        setBusy(true);
        try {
            const res = await scanTicket(code);
            const data = res?.data;
            const kind = data?.status === 'valid' ? 'valid' : 'refunded';
            setResult({ kind, data });
            setRecent((prev) => [{ at: Date.now(), name: data.fullName, kind, count: data.scanCount }, ...prev].slice(0, 8));
            navigator.vibrate?.(kind === 'valid' ? 80 : [120, 60, 120]);
        } catch (err) {
            if (err?.status === 404) {
                setResult({ kind: 'notfound', message: 'Bilet bulunamadı.' });
                navigator.vibrate?.([120, 60, 120]);
            } else {
                setResult({ kind: 'error', message: err?.message || 'Bilet okutulamadı.' });
            }
        } finally {
            busyRef.current = false;
            setBusy(false);
        }
    }, []);

    const startCamera = async () => {
        setCameraError('');
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError('Bu tarayıcı kamerayı desteklemiyor. Kodu elle girebilirsin.');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
            streamRef.current = stream;
            const video = videoRef.current;
            video.srcObject = stream;
            await video.play();
            decodeRef.current = decodeRef.current || (await createDecoder());
            pausedRef.current = false;
            setCameraOn(true);

            let last = 0;
            const tick = async (ts) => {
                loopRef.current = requestAnimationFrame(tick);
                if (pausedRef.current || ts - last < 160 || video.readyState < 2) return;
                last = ts;
                try {
                    const text = await decodeRef.current(video);
                    if (text && !pausedRef.current) await submit(text);
                } catch {
                    /* kare okunamadı, sonrakini dene */
                }
            };
            loopRef.current = requestAnimationFrame(tick);
        } catch {
            setCameraError('Kamera açılamadı. Tarayıcıdan kamera iznini verdiğinden emin ol.');
            stopCamera();
        }
    };

    const next = () => {
        setResult(null);
        setManual('');
        pausedRef.current = false;
    };

    const onManual = (e) => {
        e.preventDefault();
        if (manual.trim()) void submit(manual);
    };

    const ok = result?.kind === 'valid';
    const d = result?.data;
    const previous = d && d.history.length > 1 ? d.history[1] : null;

    return (
        <div className="ad-page">
            <PageHeader title="Bilet Tarama" description="CODEWAVE 2026 giriş QR kodlarını okut. Her okutma kaydedilir; aynı bilet birden fazla kez okutulabilir." />

            <div className="ad-scan">
                <div className="ad-card ad-scan-cam">
                    <div className={`ad-scan-view${cameraOn ? ' on' : ''}`}>
                        <video ref={videoRef} playsInline muted />
                        {!cameraOn && (
                            <div className="ad-scan-idle">
                                <Icon name="qr_code_scanner" className="ad-scan-bigico" />
                                <button type="button" className="ad-btn ad-btn-primary" onClick={startCamera}>
                                    <Icon name="photo_camera" className="ad-ico-sm" /> Kamerayı aç
                                </button>
                                {cameraError && <p className="ad-scan-err">{cameraError}</p>}
                            </div>
                        )}
                        {cameraOn && <span className="ad-scan-frame" aria-hidden="true" />}
                    </div>
                    {cameraOn && (
                        <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={stopCamera}>
                            Kamerayı kapat
                        </button>
                    )}

                    <form className="ad-scan-manual" onSubmit={onManual}>
                        <label htmlFor="scan-manual">Kodu elle gir</label>
                        <div className="ad-scan-row">
                            <input
                                id="scan-manual"
                                className="ad-input"
                                value={manual}
                                onChange={(e) => setManual(e.target.value)}
                                placeholder="Bilet kodu ya da bağlantısı"
                                autoComplete="off"
                                autoCapitalize="characters"
                                spellCheck={false}
                            />
                            <button type="submit" className="ad-btn" disabled={busy || !manual.trim()}>
                                Sorgula
                            </button>
                        </div>
                    </form>
                </div>

                <div className="ad-scan-side">
                    {!result && !busy && (
                        <div className="ad-card ad-card-pad ad-scan-wait">
                            <Icon name="center_focus_weak" className="ad-scan-bigico" />
                            <p>QR kodu kameraya göster.</p>
                        </div>
                    )}
                    {busy && (
                        <div className="ad-card ad-card-pad ad-scan-wait" role="status">
                            <p>Kontrol ediliyor…</p>
                        </div>
                    )}

                    {result && !busy && (
                        <div className={`ad-card ad-scan-result ${ok ? 'is-ok' : 'is-bad'}`} role="status" aria-live="assertive">
                            <div className="ad-scan-verdict">
                                <Icon name={ok ? 'check_circle' : 'cancel'} fill className="ad-scan-verdict-ico" />
                                <span>
                                    {ok && 'GEÇERLİ BİLET'}
                                    {result.kind === 'refunded' && 'İADE EDİLMİŞ'}
                                    {result.kind === 'notfound' && 'GEÇERSİZ'}
                                    {result.kind === 'error' && 'HATA'}
                                </span>
                            </div>

                            {d ? (
                                <div className="ad-scan-body">
                                    <h2 className="ad-scan-name">{d.fullName}</h2>
                                    <div className="ad-scan-meta">
                                        <Badge tone="info">{ATTENDEE[d.attendeeType] || d.attendeeType}</Badge>
                                        <span className="ad-muted">{d.reference}</span>
                                        {d.phone && <span className="ad-muted">{d.phone}</span>}
                                    </div>
                                    {ok ? (
                                        <p className="ad-scan-count">
                                            <strong>{d.scanCount}. giriş</strong>
                                            {previous ? ` · bir önceki: ${formatDateTime(previous.scannedAt)} (${previous.scannedBy})` : ' · ilk giriş'}
                                        </p>
                                    ) : (
                                        <p className="ad-scan-count">Bu biletin ödemesi iade edilmiş; girişe izin verme.</p>
                                    )}
                                    {d.history.length > 1 && (
                                        <details className="ad-scan-hist">
                                            <summary>Giriş geçmişi ({d.scanCount})</summary>
                                            <ul>
                                                {d.history.map((h, i) => (
                                                    <li key={i}>
                                                        {formatDateTime(h.scannedAt)} · {h.scannedBy}
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}
                                </div>
                            ) : (
                                <p className="ad-scan-body ad-scan-count">{result.message}</p>
                            )}

                            <button type="button" className="ad-btn ad-btn-block ad-scan-next" onClick={next}>
                                Sıradaki bilet
                            </button>
                        </div>
                    )}

                    {recent.length > 0 && (
                        <div className="ad-card ad-card-pad ad-scan-recent">
                            <h3>Bu oturumda okutulanlar</h3>
                            <ul>
                                {recent.map((r, i) => (
                                    <li key={`${r.at}-${i}`}>
                                        <Icon name={r.kind === 'valid' ? 'check_circle' : 'cancel'} fill className={`ad-ico-sm ${r.kind === 'valid' ? 'ad-ok' : 'ad-bad'}`} />
                                        <span>{r.name}</span>
                                        {r.kind === 'valid' && r.count > 1 && <span className="ad-muted">{r.count}. giriş</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
