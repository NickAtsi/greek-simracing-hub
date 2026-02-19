import { useEffect, useRef } from "react";

const RacingBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    interface RacingLine {
      x: number; y: number; speed: number; length: number; opacity: number; hue: number; width: number;
    }

    const lines: RacingLine[] = [];
    for (let i = 0; i < 25; i++) {
      lines.push({
        x: Math.random() * w(), y: Math.random() * h(),
        speed: 2 + Math.random() * 6, length: 40 + Math.random() * 120,
        opacity: 0.1 + Math.random() * 0.4, hue: Math.random() > 0.7 ? 30 : 1,
        width: 1 + Math.random() * 2,
      });
    }

    const dots: { x: number; y: number; baseOpacity: number; phase: number }[] = [];
    const spacing = 40;
    for (let x = 0; x < w(); x += spacing) {
      for (let y = 0; y < h(); y += spacing) {
        dots.push({ x: x + (Math.random() - 0.5) * 10, y: y + (Math.random() - 0.5) * 10, baseOpacity: 0.05 + Math.random() * 0.15, phase: Math.random() * Math.PI * 2 });
      }
    }

    let animId: number;
    let time = 0;

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, w(), h());
      dots.forEach((d) => {
        const pulse = Math.sin(time * 1.5 + d.phase) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(1, 100%, 50%, ${d.baseOpacity * (0.5 + pulse * 0.5)})`;
        ctx.fill();
      });
      lines.forEach((l) => {
        const grad = ctx.createLinearGradient(l.x, l.y, l.x - l.length, l.y);
        grad.addColorStop(0, `hsla(${l.hue}, 100%, 50%, ${l.opacity})`);
        grad.addColorStop(1, `hsla(${l.hue}, 100%, 50%, 0)`);
        ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.x - l.length, l.y);
        ctx.strokeStyle = grad; ctx.lineWidth = l.width; ctx.stroke();
        l.x += l.speed;
        if (l.x - l.length > w()) { l.x = -l.length; l.y = Math.random() * h(); }
      });
      const glowSize = 200 + Math.sin(time) * 40;
      const glowGrad = ctx.createRadialGradient(w() / 2, h() / 2, 0, w() / 2, h() / 2, glowSize);
      glowGrad.addColorStop(0, "hsla(1, 100%, 44%, 0.08)");
      glowGrad.addColorStop(0.5, "hsla(30, 100%, 50%, 0.03)");
      glowGrad.addColorStop(1, "hsla(1, 100%, 44%, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w(), h());
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default RacingBackground;
