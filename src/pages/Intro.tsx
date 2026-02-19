import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsrLogo from "@/assets/gsr-logo.png";

// ── Canvas: Neon Racing Lines + Grid Dots ──────────────────────────────────
const IntroCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Vertical neon bars (like greeksimracers.gr)
    const bars: { x: number; height: number; maxH: number; speed: number; opacity: number; width: number; phase: number }[] = [];
    const barCount = 14;
    for (let i = 0; i < barCount; i++) {
      const maxH = 80 + Math.random() * 320;
      bars.push({
        x: (canvas.width / (barCount + 1)) * (i + 1) + (Math.random() - 0.5) * 40,
        height: 0,
        maxH,
        speed: 2 + Math.random() * 3,
        opacity: 0.5 + Math.random() * 0.5,
        width: 1.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Horizontal speed streaks
    const streaks: { x: number; y: number; length: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < 20; i++) {
      streaks.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 60 + Math.random() * 160,
        speed: 4 + Math.random() * 8,
        opacity: 0.06 + Math.random() * 0.14,
      });
    }

    let animId: number;
    let time = 0;

    const draw = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep background radial glow
      const bg = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.85, 0,
        canvas.width * 0.5, canvas.height * 0.85, canvas.width * 0.7
      );
      bg.addColorStop(0, "hsla(214, 89%, 18%, 0.6)");
      bg.addColorStop(0.5, "hsla(214, 89%, 10%, 0.3)");
      bg.addColorStop(1, "hsla(210, 40%, 4%, 0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Horizontal speed streaks
      streaks.forEach((s) => {
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.length, s.y);
        grad.addColorStop(0, `hsla(214, 89%, 60%, ${s.opacity})`);
        grad.addColorStop(1, "hsla(214, 89%, 60%, 0)");
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.length, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.stroke();
        s.x += s.speed;
        if (s.x - s.length > canvas.width) s.x = -s.length;
      });

      // Vertical neon bars
      bars.forEach((bar, i) => {
        // Grow bars on intro
        if (bar.height < bar.maxH) bar.height = Math.min(bar.height + bar.speed, bar.maxH);

        // Subtle pulse
        const pulse = Math.sin(time * 1.8 + bar.phase) * 0.15 + 0.85;
        const currentH = bar.height * pulse;
        const bottomY = canvas.height;
        const topY = bottomY - currentH;

        // Glow blur
        ctx.shadowColor = "hsl(214, 89%, 60%)";
        ctx.shadowBlur = 18;

        const grad = ctx.createLinearGradient(bar.x, topY, bar.x, bottomY);
        grad.addColorStop(0, `hsla(214, 89%, 75%, 0)`);
        grad.addColorStop(0.2, `hsla(214, 89%, 70%, ${bar.opacity * 0.6})`);
        grad.addColorStop(0.8, `hsla(214, 89%, 60%, ${bar.opacity})`);
        grad.addColorStop(1, `hsla(214, 89%, 80%, ${bar.opacity * 1.2})`);

        ctx.beginPath();
        ctx.moveTo(bar.x, bottomY);
        ctx.lineTo(bar.x, topY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = bar.width;
        ctx.stroke();

        // Top dot glow
        ctx.beginPath();
        ctx.arc(bar.x, topY, bar.width * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(214, 89%, 85%, ${bar.opacity * pulse})`;
        ctx.fill();

        ctx.shadowBlur = 0;
      });

      // Grid dots overlay (subtle)
      const spacing = 55;
      for (let x = spacing; x < canvas.width; x += spacing) {
        for (let y = spacing; y < canvas.height; y += spacing) {
          const pulse = Math.sin(time + x * 0.01 + y * 0.01) * 0.03 + 0.04;
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(214, 89%, 60%, ${pulse})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// ── Typewriter Hook ────────────────────────────────────────────────────────
const useTypewriter = (text: string, speed = 60, startDelay = 0) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
};

// ── Main Intro ─────────────────────────────────────────────────────────────
const Intro = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"loading" | "reveal" | "cta">("loading");
  const [skipped, setSkipped] = useState(false);
  const [progress, setProgress] = useState(0);

  const tagline = useTypewriter("Racing is our Passion", 55, 800);
  const subtitle = useTypewriter("Greek SimRacers Hub", 80, 2200);

  // Progress bar: 0→100 over 2600ms, then CTA appears at 100%
  useEffect(() => {
    const duration = 2600;
    const interval = 30;
    const step = (100 / duration) * interval;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + step, 100);
        if (next >= 100) clearInterval(id);
        return next;
      });
    }, interval);
    return () => clearInterval(id);
  }, []);

  // Auto-advance phases
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 400);
    const t2 = setTimeout(() => setPhase("cta"), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleEnter = () => {
    sessionStorage.setItem("gsr_intro_seen", "true");
    navigate("/home");
  };

  const handleSkip = () => {
    setSkipped(true);
    sessionStorage.setItem("gsr_intro_seen", "true");
    navigate("/home");
  };

  // Redirect if already seen this session
  useEffect(() => {
    if (sessionStorage.getItem("gsr_intro_seen")) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[hsl(210,40%,4%)] flex flex-col items-center justify-center">
      {/* Canvas background */}
      <IntroCanvas />

      {/* Full dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(210,40%,4%)] via-transparent to-[hsl(210,40%,4%)]/80 pointer-events-none" />

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        onClick={handleSkip}
        className="absolute top-6 right-8 z-50 font-display text-[10px] tracking-[0.35em] text-muted-foreground/50 hover:text-muted-foreground transition-colors uppercase"
      >
        SKIP →
      </motion.button>

      {/* ── CENTER CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">

        {/* Tagline typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase !== "loading" ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="font-display text-xs tracking-[0.5em] text-primary/70 uppercase min-h-[1.2em]">
            {tagline.displayed}
            {!tagline.done && <span className="animate-pulse">|</span>}
          </p>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={phase !== "loading" ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.9, type: "spring", stiffness: 120, damping: 15, delay: 0.1 }}
          className="mb-10 relative"
        >
          {/* Logo glow rings */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1.8, 2.4, 1.8], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "radial-gradient(circle, hsl(214,89%,52%) 0%, transparent 70%)" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [2.6, 3.4, 2.6], opacity: [0.06, 0.15, 0.06] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{ background: "radial-gradient(circle, hsl(214,89%,52%) 0%, transparent 70%)" }}
          />
          <img
            src={gsrLogo}
            alt="GSR"
            className="relative h-28 w-28 object-contain drop-shadow-[0_0_40px_hsl(214,89%,52%,0.8)]"
          />
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={phase !== "loading" ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-4"
        >
          <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-6xl lg:text-7xl">
            <span
              style={{
                background: "linear-gradient(135deg, hsl(214,89%,40%) 0%, hsl(214,89%,65%) 45%, hsl(0,0%,96%) 70%, hsl(214,89%,52%) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 2px 20px hsla(214,89%,52%,0.6))",
              }}
            >
              Greek SimRacers
            </span>
          </h1>
        </motion.div>

        {/* Subtitle typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={phase !== "loading" ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-12"
        >
          <div className="h-px w-40 mx-auto bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-5" />
          <p className="font-display text-[11px] tracking-[0.45em] text-muted-foreground uppercase min-h-[1.2em]">
            {subtitle.displayed}
            {!subtitle.done && <span className="animate-pulse ml-0.5">|</span>}
          </p>
        </motion.div>

        {/* CTA */}
        <AnimatePresence>
          {phase === "cta" && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.button
                onClick={handleEnter}
                className="group relative overflow-hidden rounded-xl px-12 py-4 font-display text-sm font-bold tracking-[0.3em] uppercase text-primary-foreground"
                style={{
                  background: "linear-gradient(135deg, hsl(214,89%,30%), hsl(214,89%,50%), hsl(0,0%,85%))",
                  boxShadow: "0 0 40px hsla(214,89%,52%,0.4), 0 0 80px hsla(214,89%,40%,0.2)",
                }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 60px hsla(214,89%,52%,0.6), 0 0 100px hsla(214,89%,40%,0.3)" }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Shimmer sweep */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                ENTER
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-display text-[9px] tracking-[0.4em] text-muted-foreground/40 uppercase"
              >
                Η #1 πλατφόρμα για Έλληνες SimRacers
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Label + percentage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: progress < 100 ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-between items-center px-8 mb-2"
        >
          <span className="font-display text-[9px] tracking-[0.4em] text-primary/50 uppercase">
            {progress < 30 ? "Initializing" : progress < 70 ? "Loading Systems" : "Ready"}
          </span>
          <span className="font-display text-[9px] tracking-widest text-primary/50">
            {Math.floor(progress)}%
          </span>
        </motion.div>

        {/* Track */}
        <div className="relative h-[2px] w-full bg-primary/10">
          {/* Fill */}
          <motion.div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${progress}%` }}
          transition={{ ease: "linear" }}
        >
            <div
              className="h-full w-full"
              style={{
                background: "linear-gradient(90deg, hsl(214,89%,30%), hsl(214,89%,60%), hsl(0,0%,90%))",
                boxShadow: "0 0 12px hsl(214,89%,52%), 0 0 24px hsl(214,89%,40%,0.5)",
              }}
            />
          </motion.div>

          {/* Leading glow dot */}
          {progress > 0 && progress < 100 && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full -translate-x-1/2"
              style={{
                left: `${progress}%`,
                background: "hsl(214,89%,80%)",
                boxShadow: "0 0 10px 3px hsl(214,89%,60%), 0 0 20px hsl(214,89%,52%)",
              }}
              animate={{ opacity: [0.8, 1, 0.8], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Corner brackets */}
      {[
        "top-8 left-8 border-l-2 border-t-2 rounded-tl-lg",
        "top-8 right-8 border-r-2 border-t-2 rounded-tr-lg",
        "bottom-8 left-8 border-l-2 border-b-2 rounded-bl-lg",
        "bottom-8 right-8 border-r-2 border-b-2 rounded-br-lg",
      ].map((cls, i) => (
        <motion.div
          key={i}
          className={`absolute w-10 h-10 border-primary/25 pointer-events-none ${cls}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
        />
      ))}
    </div>
  );
};

export default Intro;
