'use client';
import { useEffect, useRef } from 'react';

export default function Canvas() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const c = ref.current;
        if (!c) return;
        const x = c.getContext('2d')!;
        let w = 0, h = 0, raf = 0;
        const pts = Array.from({ length: 55 }, () => ({
            x: Math.random(), y: Math.random(),
            vx: (Math.random() - .5) * .0004, vy: (Math.random() - .5) * .0004
        }));

        const resize = () => {
            w = c.width = innerWidth * devicePixelRatio;
            h = c.height = innerHeight * devicePixelRatio;
            x.scale(devicePixelRatio, devicePixelRatio);
        };
        resize();

        const draw = () => {
            x.clearRect(0, 0, innerWidth, innerHeight);
            x.fillStyle = '#030b3c'; x.fillRect(0, 0, innerWidth, innerHeight);
            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > 1) p.vx *= -1;
                if (p.y < 0 || p.y > 1) p.vy *= -1;
                x.fillStyle = 'rgba(214,51,242,.7)';
                x.fillRect(p.x * innerWidth, p.y * innerHeight, 1.5, 1.5);
                pts.forEach(q => {
                    const d = Math.hypot((p.x - q.x) * innerWidth, (p.y - q.y) * innerHeight);
                    if (d < 115) {
                        x.strokeStyle = `rgba(214,51,242,${.16 * (1 - d / 115)})`;
                        x.beginPath(); x.moveTo(p.x * innerWidth, p.y * innerHeight);
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