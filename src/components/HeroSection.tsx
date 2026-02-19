import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ChevronRight, Users, Trophy, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import RacingBackground from "@/components/RacingBackground";
import Particles from "@/components/Particles";
import gsrLogo from "@/assets/gsr-logo.png";

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 20 });

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

  return (
    <section className="relative flex min-h-screen bg-background">
      {/* Left side - Content */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <Particles />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-lg"
        >
          {/* Logo */}
          <div className="mb-10 flex items-center gap-3">
            <img src={gsrLogo} alt="GSR" className="h-10 w-10 object-contain" />
            <span className="font-display text-lg font-bold tracking-wider text-foreground">
              Greek<span className="text-primary">SimRacers</span>
            </span>
          </div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="font-body text-xs font-medium text-primary">
              LIVE RACING ΤΩΡΑ
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="mb-4 font-display text-4xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Η Ελληνική
            <br />
            <span className="text-gradient-racing">SimRacing</span>
            <br />
            Κοινότητα
          </h1>

          <p className="mb-8 max-w-md font-body text-sm text-muted-foreground leading-relaxed">
            Η μεγαλύτερη πηγή πληροφόρησης για Έλληνες SimRacers. Forum, Live
            Races, Podcasts, και πολλά περισσότερα.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="bg-gradient-racing group flex items-center justify-center gap-2 rounded-lg px-8 py-4 font-display text-sm font-semibold tracking-wider text-primary-foreground shadow-racing transition-all hover:scale-105 hover:brightness-110"
            >
              ΓΙΝΕ ΜΕΛΟΣ
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#live-races"
              className="flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 px-8 py-4 font-display text-sm font-semibold tracking-wider text-secondary-foreground transition-all hover:border-primary/40 hover:bg-secondary"
            >
              ΔΕΙΤΕ LIVE RACES
            </a>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8"
          >
            {[
              { icon: Users, value: "2,500+", label: "Μέλη" },
              { icon: Trophy, value: "150+", label: "Αγώνες" },
              { icon: Gamepad2, value: "10+", label: "Παιχνίδια" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto mb-1 h-4 w-4 text-primary/60" />
                <p className="font-display text-xl font-bold text-foreground sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 font-body text-[10px] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Animated Racing Background (hidden on mobile) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative hidden w-1/2 overflow-hidden bg-card lg:flex lg:items-center lg:justify-center"
        style={{ perspective: "1000px" }}
      >
        <RacingBackground />
        <div className="absolute inset-0 carbon-texture opacity-30" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 h-[200%] w-1/3 rotate-12 opacity-[0.03]" style={{ background: "var(--gradient-racing)" }} />
          <div className="absolute -top-1/2 right-1/4 h-[200%] w-px rotate-12 opacity-10" style={{ background: "hsl(var(--primary))" }} />
          <div className="absolute -top-1/2 right-[35%] h-[200%] w-px rotate-12 opacity-[0.06]" style={{ background: "hsl(var(--accent))" }} />
        </div>

        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-12"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div
            className="relative mb-8"
            style={{ translateZ: 60 }}
          >
            <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-3xl" />
            <img src={gsrLogo} alt="GSR" className="relative h-28 w-28 object-contain drop-shadow-2xl" />
          </motion.div>
          <motion.h2
            className="font-display text-5xl font-bold leading-tight text-foreground"
            style={{
              translateZ: 40,
              textShadow: "0 4px 12px hsla(1, 100%, 44%, 0.3), 0 8px 30px hsla(0, 0%, 0%, 0.5)",
            }}
          >
            Ζήσε την <br />
            <span
              className="text-gradient-racing"
              style={{
                textShadow: "none",
                filter: "drop-shadow(0 4px 20px hsla(1, 100%, 50%, 0.4))",
              }}
            >
              Αδρεναλίνη
            </span>
          </motion.h2>
          <motion.p
            className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed"
            style={{ translateZ: 20 }}
          >
            Η μεγαλύτερη ελληνική κοινότητα sim racing σε περιμένει
          </motion.p>
          <motion.div className="mt-10 flex gap-8" style={{ translateZ: 30 }}>
            {[{ value: "500+", label: "Μέλη" }, { value: "50+", label: "Αγώνες" }, { value: "10+", label: "Πρωταθλήματα" }].map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="font-display text-2xl font-bold text-gradient-racing"
                  style={{ filter: "drop-shadow(0 2px 8px hsla(1, 100%, 50%, 0.3))" }}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-racing" />
      </div>
    </section>
  );
};

export default HeroSection;
