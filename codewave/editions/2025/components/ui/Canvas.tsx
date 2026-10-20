'use client';
import { useEffect, useRef } from 'react';

// Arka plandaki dalga animasyonu. İmleç dalgaları yerelde yükseltir; sekme gizliyken ve hareket azaltma tercihinde durur.
export default function Canvas() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const c = ref.current;
        if (!c) return;
        const ctx = c.getContext('2d')!;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let raf = 0, t = 0, W = 0, H = 0, dpr = 1;
        let mouseX = -9999, mouseSmooth = -9999;

        const waves = [
            { amp: 60, freq: 0.0022, speed: 0.35, y: 0.35, hue: 262, width: 1.6, alpha: 0.5 },
            { amp: 40, freq: 0.003, speed: -0.25, y: 0.5, hue: 285, width: 1.2, alpha: 0.35 },
            { amp: 80, freq: 0.0016, speed: 0.18, y: 0.65, hue: 300, width: 1.8, alpha: 0.4 },
            { amp: 30, freq: 0.0045, speed: -0.4, y: 0.8, hue: 220, width: 1, alpha: 0.25 },
        ];
        const DOT_COUNT = 16;
        let lineGrads: CanvasGradient[] = [];
        let bgGrad: CanvasGradient;

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            W = window.innerWidth;
            H = window.innerHeight;
            c.width = W * dpr;
            c.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            // Gradyanlar yalnızca boyut değişince üretilir (kare başına değil)
            bgGrad = ctx.createLinearGradient(0, 0, 0, H);
            bgGrad.addColorStop(0, 'rgba(60,40,120,0.14)');
            bgGrad.addColorStop(1, 'rgba(10,10,30,0)');
            lineGrads = waves.map((wv) => {
                const g = ctx.createLinearGradient(0, 0, W, 0);
                g.addColorStop(0, `hsla(${wv.hue}, 80%, 65%, 0)`);
                g.addColorStop(0.15, `hsla(${wv.hue}, 80%, 65%, ${wv.alpha})`);
                g.addColorStop(0.85, `hsla(${wv.hue}, 80%, 65%, ${wv.alpha})`);
                g.addColorStop(1, `hsla(${wv.hue}, 80%, 65%, 0)`);
                return g;
            });
            if (reduce) draw();
        };

        const draw = () => {
            ctx.fillStyle = '#05061a';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, W, H);

            mouseSmooth += (mouseX - mouseSmooth) * 0.08;

            waves.forEach((wv, wi) => {
                ctx.beginPath();
                const baseY = wv.y * H;
                for (let x = 0; x <= W; x += 6) {
                    // imlecin yakınında dalga yükselir (gauss tümseği)
                    const dx = (x - mouseSmooth) / 190;
                    const bump = Math.exp(-dx * dx) * 38 * (wi % 2 ? -1 : 1);
                    const yy =
                        baseY +
                        Math.sin(x * wv.freq + t * wv.speed) * wv.amp +
                        Math.sin(x * wv.freq * 2.3 + t * wv.speed * 1.7) * wv.amp * 0.25 +
                        bump;
                    if (x === 0) ctx.moveTo(x, yy);
                    else ctx.lineTo(x, yy);
                }
                ctx.strokeStyle = lineGrads[wi];
                ctx.lineWidth = wv.width;
                ctx.shadowColor = `hsla(${wv.hue}, 90%, 60%, 0.8)`;
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.shadowBlur = 0;
            });

            for (let i = 0; i < DOT_COUNT; i++) {
                const seed = i * 137.5;
                const px = ((Math.sin(seed) * 0.5 + 0.5 + t * 0.006 + i * 0.013) % 1) * W;
                const py = (Math.sin(seed * 1.7) * 0.5 + 0.5) * H;
                const pulse = 0.5 + 0.5 * Math.sin(t * 0.8 + seed);
                ctx.fillStyle = `hsla(280, 90%, 75%, ${0.5 * pulse})`;
                ctx.beginPath();
                ctx.arc(px, py, 1.5 + pulse, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const loop = () => {
            t += 0.016;
            draw();
            raf = requestAnimationFrame(loop);
        };
        const start = () => {
            if (!raf && !reduce) raf = requestAnimationFrame(loop);
        };
        const stop = () => {
            cancelAnimationFrame(raf);
            raf = 0;
        };
        const onVis = () => (document.hidden ? stop() : start());
        const onMove = (e: PointerEvent) => {
            mouseX = e.clientX;
            if (mouseSmooth < -9000) mouseSmooth = e.clientX;
        };

        resize();
        start();
        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', onMove, { passive: true });
        document.addEventListener('visibilitychange', onVis);
        return () => {
            stop();
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onMove);
            document.removeEventListener('visibilitychange', onVis);
        };
    }, []);

    return <canvas ref={ref} className="canvas" aria-hidden="true" />;
}
