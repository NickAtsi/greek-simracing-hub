import { useEffect, useRef, useCallback } from "react";

const ReactiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // ── Particle definition ──────────────────────────────────────────────────
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseX: number;
      baseY: number;
      size: number;
      opacity: number;
      phase: number;
      speed: number;
      // dash style
      isDash: boolean;
      dashLen: number;
      angle: number;
      angleV: number;
    }

    const COUNT = Math.floor((window.innerWidth * window.innerHeight) / 7000);
    const particles: Particle[] = [];

    for (let i = 0; i < COUNT; i++) {
      const bx = Math.random() * canvas.width;
      const by = Math.random() * canvas.height;
      const isDash = Math.random() < 0.35;
      particles.push({
        x: bx,
        y: by,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        baseX: bx,
        baseY: by,
        size: isDash ? 0.8 : Math.random() * 1.4 + 0.4,
        opacity: Math.random() * 0.35 + 0.08,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8,
        isDash,
        dashLen: 4 + Math.random() * 10,
        angle: Math.random() * Math.PI * 2,
        angleV: (Math.random() - 0.5) * 0.008,
      });
    }

    let animId: number;
    let time = 0;

    const REPEL_RADIUS = 130;
    const REPEL_FORCE = 5.5;
    const FRICTION = 0.88;
    const RETURN_FORCE = 0.018;

    const draw = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        // ── Physics ──────────────────────────────────────────────────────────
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0) {
          // Repulsion: push away from cursor
          const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Spring return to base position
        p.vx += (p.baseX - p.x) * RETURN_FORCE;
        p.vy += (p.baseY - p.y) * RETURN_FORCE;

        // Damping
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        // Integrate
        p.x += p.vx;
        p.y += p.vy;

        // Angle drift
        p.angle += p.angleV;

        // ── Visual ───────────────────────────────────────────────────────────
        const pulse = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
        const proximity = dist < REPEL_RADIUS ? (1 - dist / REPEL_RADIUS) : 0;

        // Alternate hue grid — blue dominant, occasional white accent
        const gridX = Math.floor(p.baseX / 90);
        const gridY = Math.floor(p.baseY / 90);
        const isAccent = (gridX + gridY) % 5 === 0;

        let hue: number, sat: number, light: number;
        if (isAccent) {
          hue = 0; sat = 0; light = 90; // near-white
        } else {
          hue = 214; sat = 85; light = 55 + pulse * 12; // blue
        }

        const finalOpacity = Math.min(
          p.opacity * (0.6 + pulse * 0.4) + proximity * 0.5,
          0.9
        );

        ctx.globalAlpha = finalOpacity;

        if (p.isDash) {
          // Small dash/tick — like the Google Antigravity ones
          const a = p.angle;
          const hx = Math.cos(a) * p.dashLen * 0.5;
          const hy = Math.sin(a) * p.dashLen * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x - hx, p.y - hy);
          ctx.lineTo(p.x + hx, p.y + hy);
          ctx.strokeStyle = `hsl(${hue},${sat}%,${light}%)`;
          ctx.lineWidth = p.size;
          ctx.lineCap = "round";
          ctx.stroke();
        } else {
          // Dot
          const r = p.size + proximity * 1.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${hue},${sat}%,${light}%)`;
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      });

      // ── Constellation lines between nearby particles ───────────────────
      const LINE_DIST = 80;
      const LINE_DIST_SQ = LINE_DIST * LINE_DIST;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const ddx = a.x - b.x;
          const ddy = a.y - b.y;
          const distSq = ddx * ddx + ddy * ddy;
          if (distSq < LINE_DIST_SQ) {
            const alpha = (1 - Math.sqrt(distSq) / LINE_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(214,85%,60%,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // ── Subtle mouse glow ────────────────────────────────────────────────
      if (mx > 0 && mx < canvas.width) {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, REPEL_RADIUS * 1.4);
        g.addColorStop(0, "hsla(214,89%,55%,0.05)");
        g.addColorStop(0.5, "hsla(214,89%,40%,0.02)");
        g.addColorStop(1, "hsla(214,89%,55%,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default ReactiveBackground;
