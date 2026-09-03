'use client';
import { useEffect, useRef } from 'react';

export default function Canvas() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const c = ref.current;
        if (!c) return;
        const x = c.getContext('2d')!;
        let w = 0, h = 0, raf = 0;
        const pts = Array.from({ length: 70 }, () => ({
            x: Math.random(), y: Math.random(),
            vx: (Math.random() - .5) * .0022, vy: (Math.random() - .5) * .0022,
            r: 1 + Math.random() * 1.8,
            phase: Math.random() * Math.PI * 2
        }));

        const resize = () => {
            w = c.width = innerWidth * devicePixelRatio;
            h = c.height = innerHeight * devicePixelRatio;
            x.scale(devicePixelRatio, devicePixelRatio);
        };
        resize();

        let t = 0;
        const draw = () => {
            t += 0.02;
            x.clearRect(0, 0, innerWidth, innerHeight);
            x.fillStyle = '#030b3c'; x.fillRect(0, 0, innerWidth, innerHeight);

            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > 1) p.vx *= -1;
                if (p.y < 0 || p.y > 1) p.vy *= -1;

                // hafif nabız (pulse) efekti - boyut ve parlaklık zamanla değişiyor
                const pulse = 0.6 + 0.4 * Math.sin(t + p.phase);
                const radius = p.r * (0.8 + 0.5 * pulse);

                // glow efekti
                const px = p.x * innerWidth, py = p.y * innerHeight;
                const grad = x.createRadialGradient(px, py, 0, px, py, radius * 4);
                grad.addColorStop(0, `rgba(214,51,242,${0.55 * pulse})`);
                grad.addColorStop(1, 'rgba(214,51,242,0)');
                x.fillStyle = grad;
                x.fillRect(px - radius * 4, py - radius * 4, radius * 8, radius * 8);

                x.fillStyle = `rgba(255,255,255,${0.7 * pulse})`;
                x.beginPath();
                x.arc(px, py, radius, 0, Math.PI * 2);
                x.fill();

                pts.forEach(q => {
                    const d = Math.hypot((p.x - q.x) * innerWidth, (p.y - q.y) * innerHeight);
                    if (d < 130) {
                        x.strokeStyle = `rgba(214,51,242,${.28 * (1 - d / 130)})`;
                        x.lineWidth = 0.8;
                        x.beginPath(); x.moveTo(px, py);
                        x.lineTo(q.x * innerWidth, q.y * innerHeight); x.stroke();
                    }
                });
            });
            raf = requestAnimationFrame(draw);
        };
        addEventListener('resize', resize); draw();
        return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
    }, []);

    return <canvas ref={ref} className="canvas" aria-hidden="true" />;
}