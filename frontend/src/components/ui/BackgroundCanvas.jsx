"use client";

import { useEffect, useRef } from 'react';

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // ---- Tunables ----
    const NODE_COLOR = 'rgba(20, 20, 20, OPA)';       // düğüm rengi (koyu nötr)
    const LINK_COLOR = '20, 20, 20';                   // çizgi rengi (rgb, opacity ayrı ekleniyor)
    const PULSE_COLOR = '128, 0, 0';                    // sinyal/pulse rengi (kırmızımsı accent)
    const LINK_DIST = 150;         // px, bu mesafeden yakın düğümler birbirine bağlanır
    const NODE_COUNT_DIVISOR = 14000; // ekran alanına göre düğüm sayısı hesaplanır
    const MAX_NODES = 140;
    const MIN_NODES = 30;
    const BASE_SPEED = 0.15;

    let nodes = [];
    let pulses = []; // aktif sinyal animasyonları: {a, b, t, speed}

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function syncSize() {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (width !== w || height !== h) {
        width = w;
        height = h;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initNodes();
      }
    }

    function initNodes() {
      const area = width * height;
      let count = Math.round(area / NODE_COUNT_DIVISOR);
      count = Math.max(MIN_NODES, Math.min(MAX_NODES, count));

      nodes = new Array(count).fill(null).map(() => ({
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-BASE_SPEED, BASE_SPEED),
        vy: rand(-BASE_SPEED, BASE_SPEED),
        r: rand(1.2, 2.6),
        pulsePhase: rand(0, Math.PI * 2),
      }));
      pulses = [];
    }

    if (typeof ResizeObserver !== 'undefined') {
      var resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    // Fare pozisyonu — düğümler fareye hafifçe tepki versin
    const mouse = { x: -9999, y: -9999, active: false };
    function handlePointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function handlePointerLeave() {
      mouse.active = false;
    }
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    let lastTime = 0;

    function maybeSpawnPulse(now) {
      // Rastgele aralıklarla, birbirine bağlı iki düğüm arasında "sinyal" başlat
      if (Math.random() < 0.02 && nodes.length > 1 && pulses.length < 6) {
        const a = Math.floor(Math.random() * nodes.length);
        // a'ya yakın bir komşu bul
        let candidates = [];
        for (let i = 0; i < nodes.length; i++) {
          if (i === a) continue;
          const dx = nodes[a].x - nodes[i].x;
          const dy = nodes[a].y - nodes[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) candidates.push(i);
        }
        if (candidates.length > 0) {
          const b = candidates[Math.floor(Math.random() * candidates.length)];
          pulses.push({ a, b, t: 0, speed: rand(0.012, 0.022) });
        }
      }
    }

    function render(now) {
      const dt = now - lastTime;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // ---- Düğümleri güncelle ----
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        // Kenarlardan yumuşak sekme
        if (n.x < 0) { n.x = 0; n.vx *= -1; }
        else if (n.x > width) { n.x = width; n.vx *= -1; }
        if (n.y < 0) { n.y = 0; n.vy *= -1; }
        else if (n.y > height) { n.y = height; n.vy *= -1; }

        // Fareye hafif çekim/itme (yakınsa hafifçe itilsin)
        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const radius = 120;
          if (distSq < radius * radius) {
            const dist = Math.sqrt(distSq) || 0.001;
            const force = (1 - dist / radius) * 0.04;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;
          }
        }

        // Hızı sınırla (fare etkileşimi sonsuz hızlanmasın)
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        const maxSpeed = BASE_SPEED * 3;
        if (speed > maxSpeed) {
          n.vx = (n.vx / speed) * maxSpeed;
          n.vy = (n.vy / speed) * maxSpeed;
        }
      }

      // ---- Bağlantı çizgileri ----
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const opacity = (1 - dist / LINK_DIST) * 0.35;
            ctx.strokeStyle = `rgba(${LINK_COLOR}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // ---- Sinyal pulse'ları çiz ve ilerlet ----
      maybeSpawnPulse(now);
      pulses = pulses.filter((p) => p.t < 1);
      for (const p of pulses) {
        p.t += p.speed;
        const a = nodes[p.a];
        const b = nodes[p.b];
        if (!a || !b) continue;
        const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        if (dist >= LINK_DIST) continue; // bağlantı koptuysa görünmesin

        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const fade = Math.sin(p.t * Math.PI); // başta ve sonda sönümlenen parlaklık

        ctx.beginPath();
        ctx.fillStyle = `rgba(${PULSE_COLOR}, ${0.9 * fade})`;
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Hafif parlama (glow) efekti
        ctx.beginPath();
        ctx.fillStyle = `rgba(${PULSE_COLOR}, ${0.15 * fade})`;
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- Düğümleri çiz (nabız gibi hafif boyut/opaklık titreşimi) ----
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulse = 0.5 + 0.5 * Math.sin(now * 0.0015 + n.pulsePhase);
        const opacity = 0.35 + pulse * 0.35;
        const radius = n.r + pulse * 0.6;

        ctx.beginPath();
        ctx.fillStyle = NODE_COLOR.replace('OPA', opacity.toFixed(3));
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 opacity-30 lg:opacity-20 pointer-events-none">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}