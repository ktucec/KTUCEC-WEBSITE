'use client';
import { useEffect, useRef } from 'react';

export default function Canvas() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const c = ref.current;
        if (!c) return;
        const ctx = c.getContext('2d')!;
        let raf = 0, t = 0;

        const waves = [
            { amp: 60, freq: 0.0022, speed: 0.35, y: 0.35, hue: 262, width: 1.6, alpha: 0.5 },
            { amp: 40, freq: 0.003, speed: -0.25, y: 0.5, hue: 285, width: 1.2, alpha: 0.35 },
            { amp: 80, freq: 0.0016, speed: 0.18, y: 0.65, hue: 300, width: 1.8, alpha: 0.4 },
            { amp: 30, freq: 0.0045, speed: -0.4, y: 0.8, hue: 220, width: 1, alpha: 0.25 },
        ];
        const DOT_COUNT = 14;

        const resize = () => {
            c.width = innerWidth * devicePixelRatio;
            c.height = innerHeight * devicePixelRatio;
        };
        resize();

        const draw = () => {
            t += 0.016;
            const W = innerWidth, H = innerHeight;
            ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

            ctx.fillStyle = '#05061a';
            ctx.fillRect(0, 0, W, H);

            const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
            bgGrad.addColorStop(0, 'rgba(60,40,120,0.12)');
            bgGrad.addColorStop(1, 'rgba(10,10,30,0)');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, W, H);

            waves.forEach((wv) => {
                ctx.beginPath();
                const baseY = wv.y * H;
                for (let x = 0; x <= W; x += 6) {
                    const yy = baseY
                        + Math.sin(x * wv.freq + t * wv.speed) * wv.amp
                        + Math.sin(x * wv.freq * 2.3 + t * wv.speed * 1.7) * wv.amp * 0.25;
                    if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
                }
                const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
                lineGrad.addColorStop(0, `hsla(${wv.hue}, 80%, 65%, 0)`);
                lineGrad.addColorStop(0.15, `hsla(${wv.hue}, 80%, 65%, ${wv.alpha})`);
                lineGrad.addColorStop(0.85, `hsla(${wv.hue}, 80%, 65%, ${wv.alpha})`);
                lineGrad.addColorStop(1, `hsla(${wv.hue}, 80%, 65%, 0)`);
                ctx.strokeStyle = lineGrad;
                ctx.lineWidth = wv.width;
                ctx.shadowColor = `hsla(${wv.hue}, 90%, 60%, 0.8)`;
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.shadowBlur = 0;
            });

            // seyrek, yavaş parlayan noktalar — kod parçacığı hissi, çok az sayıda ve dikkat dağıtmaz
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

            raf = requestAnimationFrame(draw);
        };

        addEventListener('resize', resize);
        draw();
        return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
    }, []);

    return <canvas ref={ref} className="canvas" aria-hidden="true" />;
}