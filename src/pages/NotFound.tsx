import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Home, ArrowLeft, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

// Floating particle component
const FloatingParticle = ({ delay, size, x, y, duration }: { delay: number; size: number; x: number; y: number; duration: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/20"
    style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, -15, 0],
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.3, 1],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

// Animated speedometer needle
const Speedometer = () => {
  const [angle, setAngle] = useState(-120);

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle(prev => {
        if (prev >= 120) return -120;
        return prev + 4;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-48 h-24 mx-auto mb-8">
      {/* Gauge arc */}
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--destructive))" />
          </linearGradient>
        </defs>
        {/* Background arc */}
        <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="hsl(var(--border))" strokeWidth="6" strokeLinecap="round" />
        {/* Colored arc */}
        <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="url(#gaugeGrad)" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
        {/* Tick marks */}
        {Array.from({ length: 9 }).map((_, i) => {
          const a = -180 + i * 22.5;
          const rad = (a * Math.PI) / 180;
          const x1 = 100 + 72 * Math.cos(rad);
          const y1 = 90 + 72 * Math.sin(rad);
          const x2 = 100 + 80 * Math.cos(rad);
          const y2 = 90 + 80 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" opacity="0.5" />;
        })}
        {/* Needle */}
        <motion.line
          x1="100" y1="90"
          x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
          y2={90 + 60 * Math.sin((angle * Math.PI) / 180)}
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.6))" }}
        />
        {/* Center dot */}
        <circle cx="100" cy="90" r="5" fill="hsl(var(--primary))" style={{ filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.8))" }} />
      </svg>
    </div>
  );
};

// Skid marks decoration
const SkidMarks = () => (
  <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden opacity-[0.07] pointer-events-none">
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
      className="absolute bottom-8 w-96 h-1.5 rounded-full"
      style={{ background: "linear-gradient(90deg, transparent, hsl(var(--foreground)), hsl(var(--foreground)), transparent)" }}
    />
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2, delay: 0.1 }}
      className="absolute bottom-12 w-80 h-1 rounded-full"
      style={{ background: "linear-gradient(90deg, transparent, hsl(var(--foreground)), hsl(var(--foreground)), transparent)" }}
    />
  </div>
);

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 100, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 100, damping: 20 });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const particles = Array.from({ length: 20 }).map((_, i) => ({
    delay: i * 0.3,
    size: 3 + Math.random() * 6,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 3 + Math.random() * 4,
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex-1 relative flex items-center justify-center overflow-hidden pt-16"
        style={{ perspective: "1200px" }}
      >
        {/* Ambient background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 carbon-texture opacity-20" />
        </div>

        {/* Floating particles */}
        {particles.map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}

        {/* Skid marks */}
        <SkidMarks />

        {/* Main content with 3D tilt */}
        <motion.div
          className="relative z-10 text-center px-6 max-w-2xl mx-auto"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
          {/* Speedometer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            style={{ translateZ: 40 }}
          >
            <Speedometer />
          </motion.div>

          {/* 404 number */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 45 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
            style={{ translateZ: 60 }}
          >
            <h1 className="font-display text-[8rem] md:text-[12rem] font-black leading-none select-none"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradient-shift 3s ease infinite",
                filter: "drop-shadow(0 0 40px hsl(var(--primary) / 0.3))",
              }}
            >
              404
            </h1>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ translateZ: 30 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Gauge className="h-6 w-6 text-primary" />
              </motion.div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Λάθος Στροφή!
              </h2>
            </div>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
              Φαίνεται ότι βγήκες εκτός πίστας. Η σελίδα{" "}
              <span className="font-mono text-sm bg-secondary/60 px-2 py-0.5 rounded-md border border-border text-primary">
                {location.pathname}
              </span>{" "}
              δεν υπάρχει.
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10"
            style={{ translateZ: 20 }}
          >
            <Button
              onClick={() => navigate("/")}
              className="gap-2 h-12 px-8 bg-gradient-racing font-display text-sm font-semibold tracking-wider text-primary-foreground hover:shadow-racing hover:brightness-110 transition-all"
            >
              <Home className="h-4 w-4" /> Αρχική Σελίδα
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="gap-2 h-12 px-8 border-border text-muted-foreground hover:text-foreground font-display text-sm tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" /> Πίσω
            </Button>
          </motion.div>

          {/* Decorative racing flag line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            className="mt-12 mx-auto max-w-xs"
          >
            <div className="h-1 rounded-full bg-gradient-racing opacity-60" />
          </motion.div>
        </motion.div>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
