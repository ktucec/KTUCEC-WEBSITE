'use client';
import { useEffect, useRef } from 'react';

const BLUE = [46, 126, 190];
const GREEN = [136, 223, 138];

// "Code wave": perspektifte bir nokta ızgarası; her noktanın yüksekliği üst üste binen sinüs dalgalarından
// gelir, renk çukurlarda marka mavisinden tepelerde yeşile kayar. Fare yüzeye bir halka dalga düşürür.
// Telefonda daha seyrek ızgara ve fare yok; hareket azaltmada tek kare çizilir; ekran dışında ya da sekme
// gizliyken döngü durur.
export default function WaveField({ className = '' }: { className?: string }) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas?.getContext('2d', { alpha: true });
        if (!canvas || !ctx) return;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, power: 0, target: 0 };
        let w = 0;
        let h = 0;
        let cols = 0;
        let rows = 0;
        let raf = 0;
        let running = false;
        let visible = true;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const small = w < 720;
            cols = small ? 38 : 72;
            rows = small ? 24 : 36;
        };

        const draw = (t: number) => {
            ctx.clearRect(0, 0, w, h);
            mouse.x += (mouse.tx - mouse.x) * 0.08;
            mouse.y += (mouse.ty - mouse.y) * 0.08;
            mouse.power += (mouse.target - mouse.power) * 0.05;

            const horizon = h * 0.42;
            const mx = mouse.x * w;
            const my = mouse.y * h;
            for (let r = 0; r < rows; r++) {
                const depth = r / (rows - 1); // 0 uzak, 1 yakın
                const persp = Math.pow(depth, 1.7);
                const baseY = horizon + persp * (h - horizon) * 1.08;
                const spread = 0.55 + depth * 1.6;
                const amp = 10 + depth * 52;
                const alpha = 0.18 + depth * 0.82;
                const size = 0.9 + depth * 2.3;
                for (let c = 0; c < cols; c++) {
                    const u = c / (cols - 1);
                    const px = w / 2 + (u - 0.5) * w * spread;
                    const wave =
                        Math.sin(u * 7 + t * 0.00055 + depth * 3.2) * 0.55 +
                        Math.sin(u * 15 - t * 0.0004 + depth * 7.5) * 0.28 +
                        Math.sin(u * 3 + depth * 2 - t * 0.0002) * 0.3;
                    let py = baseY - wave * amp;
                    if (mouse.power > 0.01) {
                        const dx = px - mx;
                        const dy = py - my;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        py -= mouse.power * Math.exp(-dist / 210) * Math.sin(dist / 26 - t * 0.006) * (14 + depth * 22);
                    }
                    const k = Math.min(Math.max((wave + 0.9) / 1.8, 0), 1);
                    const cr = BLUE[0] + (GREEN[0] - BLUE[0]) * k;
                    const cg = BLUE[1] + (GREEN[1] - BLUE[1]) * k;
                    const cb = BLUE[2] + (GREEN[2] - BLUE[2]) * k;
                    ctx.fillStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${alpha * (0.55 + k * 0.45)})`;
                    ctx.fillRect(px, py, size, size);
                }
            }
        };

        const loop = (t: number) => {
            draw(t);
            raf = requestAnimationFrame(loop);
        };
        const start = () => {
            if (running || reduce || !visible || document.hidden) return;
            running = true;
            raf = requestAnimationFrame(loop);
        };
        const stop = () => {
            running = false;
            cancelAnimationFrame(raf);
        };

        resize();
        draw(4000);

        const onResize = () => {
            resize();
            if (!running) draw(4000);
        };
        const onMove = (e: PointerEvent) => {
            const r = canvas.getBoundingClientRect();
            mouse.tx = (e.clientX - r.left) / r.width;
            mouse.ty = (e.clientY - r.top) / r.height;
            mouse.target = 1;
        };
        const onLeave = () => (mouse.target = 0);
        const onVisibility = () => (document.hidden ? stop() : start());

        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) start();
            else stop();
        });
        io.observe(canvas);
        window.addEventListener('resize', onResize);
        document.addEventListener('visibilitychange', onVisibility);
        if (fine && !reduce) {
            window.addEventListener('pointermove', onMove, { passive: true });
            document.addEventListener('pointerleave', onLeave);
        }
        start();

        return () => {
            stop();
            io.disconnect();
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerleave', onLeave);
        };
    }, []);

    return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
}
