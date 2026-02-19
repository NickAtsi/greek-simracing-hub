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
      type: "dot" | "line";
      angle: number;
      length: number;
    }

    const particles: Particle[] = [];
    const spacing = 70;
    for (let x = 0; x < canvas.width; x += spacing) {
      for (let y = 0; y < canvas.height; y += spacing) {
        const isLine = Math.random() < 0.15;
        particles.push({
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 30,
          baseX: x + (Math.random() - 0.5) * 30,
          baseY: y + (Math.random() - 0.5) * 30,
          size: isLine ? 1 : Math.random() * 1.2 + 0.3,
          opacity: Math.random() * 0.15 + 0.03,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 1,
          type: isLine ? "line" : "dot",
          angle: Math.random() * Math.PI,
          length: 8 + Math.random() * 15,
        });
      }
    }

    // Racing track lines — subtle horizontal streaks
    interface TrackLine {
      y: number; speed: number; opacity: number; width: number;
    }
    const trackLines: TrackLine[] = [];
    for (let i = 0; i < 6; i++) {
      trackLines.push({
        y: Math.random() * canvas.height,
        speed: 0.3 + Math.random() * 0.7,
        opacity: 0.015 + Math.random() * 0.02,
        width: canvas.width * (0.15 + Math.random() * 0.3),
      });
    }

    let animId: number;
    let time = 0;

    const draw = () => {
      time += 0.006;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Draw subtle racing track lines
      trackLines.forEach((line) => {
        const xOffset = Math.sin(time * line.speed) * 100;
        const grad = ctx.createLinearGradient(
          canvas.width / 2 - line.width / 2 + xOffset, line.y,
          canvas.width / 2 + line.width / 2 + xOffset, line.y
        );
        grad.addColorStop(0, `hsla(356, 80%, 50%, 0)`);
        grad.addColorStop(0.3, `hsla(356, 80%, 50%, ${line.opacity})`);
        grad.addColorStop(0.7, `hsla(210, 90%, 55%, ${line.opacity})`);
        grad.addColorStop(1, `hsla(210, 90%, 55%, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, line.y - 0.5, canvas.width, 1);
      });

      // Draw particles
      particles.forEach((p) => {
        const dx = mx - p.baseX;
        const dy = my - p.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 180;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 25;
          p.x = p.baseX - (dx / dist) * force;
          p.y = p.baseY - (dy / dist) * force;
        } else {
          p.x += (p.baseX - p.x) * 0.04;
          p.y += (p.baseY - p.y) * 0.04;
        }

        const pulse = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
        const glowOpacity = dist < maxDist
          ? p.opacity + (1 - dist / maxDist) * 0.4
          : p.opacity * (0.5 + pulse * 0.5);

        // Alternate between red and blue
        const isBlue = (Math.floor(p.baseX / spacing) + Math.floor(p.baseY / spacing)) % 2 === 0;
        const hue = isBlue ? 210 : 356;
        const sat = isBlue ? 85 : 90;
        const light = isBlue ? 55 : 50;

        if (p.type === "line") {
          const a = p.angle + Math.sin(time * 0.5 + p.phase) * 0.3;
          ctx.beginPath();
          ctx.moveTo(p.x - Math.cos(a) * p.length / 2, p.y - Math.sin(a) * p.length / 2);
          ctx.lineTo(p.x + Math.cos(a) * p.length / 2, p.y + Math.sin(a) * p.length / 2);
          ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${glowOpacity * 0.6})`;
          ctx.lineWidth = p.size;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size + (dist < maxDist ? (1 - dist / maxDist) * 1.5 : 0), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${glowOpacity})`;
          ctx.fill();
        }
      });

      // Mouse glow — dual color racing feel
      if (mx > 0 && my > 0) {
        const glowGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
        glowGrad.addColorStop(0, "hsla(356, 90%, 50%, 0.04)");
        glowGrad.addColorStop(0.5, "hsla(210, 90%, 55%, 0.02)");
        glowGrad.addColorStop(1, "hsla(356, 90%, 50%, 0)");
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
