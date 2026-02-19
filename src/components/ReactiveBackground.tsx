import { useEffect, useRef, useCallback } from "react";

const ReactiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
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

    interface Particle {
      x: number; y: number; baseX: number; baseY: number;
      size: number; opacity: number; phase: number; speed: number;
    }

    const particles: Particle[] = [];
    const spacing = 60;
    for (let x = 0; x < canvas.width; x += spacing) {
      for (let y = 0; y < canvas.height; y += spacing) {
        particles.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          baseX: x + (Math.random() - 0.5) * 20,
          baseY: y + (Math.random() - 0.5) * 20,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.05,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 1.5,
        });
      }
    }

    let animId: number;
    let time = 0;

    const draw = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        const dx = mx - p.baseX;
        const dy = my - p.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 30;
          p.x = p.baseX - (dx / dist) * force;
          p.y = p.baseY - (dy / dist) * force;
        } else {
          p.x += (p.baseX - p.x) * 0.05;
          p.y += (p.baseY - p.y) * 0.05;
        }

        const pulse = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
        const glowOpacity = dist < maxDist
          ? p.opacity + (1 - dist / maxDist) * 0.5
          : p.opacity * (0.5 + pulse * 0.5);

        // Alternate between red and blue particles
        const isBlue = (p.baseX + p.baseY) % 120 < 60;
        const hue = isBlue ? 210 : 356;
        const sat = isBlue ? 100 : 100;
        const light = isBlue ? 55 : 52;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + (dist < maxDist ? (1 - dist / maxDist) * 2 : 0), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${glowOpacity})`;
        ctx.fill();
      });

      // Mouse glow
      if (mx > 0 && my > 0) {
        const glowGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 250);
        glowGrad.addColorStop(0, "hsla(356, 100%, 52%, 0.06)");
        glowGrad.addColorStop(0.4, "hsla(210, 100%, 55%, 0.03)");
        glowGrad.addColorStop(1, "hsla(356, 100%, 52%, 0)");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};

export default ReactiveBackground;
