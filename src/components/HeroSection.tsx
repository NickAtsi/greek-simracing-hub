import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight, Users, Trophy, Gamepad2, Flag, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import gsrLogo from "@/assets/gsr-logo.png";

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Parallax layers at different depths
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const yMid = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yFront = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section ref={ref} className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">

      {/* === PARALLAX LAYER 0: deep ambient orbs === */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: yBg, scale }}
      >
        <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/6 blur-[150px]" />
        <div className="absolute top-3/4 left-1/2 h-[300px] w-[300px] rounded-full bg-primary/4 blur-[120px]" />
      </motion.div>

      {/* === PARALLAX LAYER 1: grid lines === */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: yMid }}
      >
        {/* Horizontal speed lines */}
        <div className="absolute top-[35%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
        <div className="absolute top-[65%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
        {/* Vertical accent line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/8 to-transparent" />
        {/* Corner accents */}
        <div className="absolute top-24 left-8 w-16 h-16 border-l-2 border-t-2 border-primary/20 rounded-tl-lg" />
        <div className="absolute top-24 right-8 w-16 h-16 border-r-2 border-t-2 border-primary/20 rounded-tr-lg" />
        <div className="absolute bottom-12 left-8 w-16 h-16 border-l-2 border-b-2 border-accent/15 rounded-bl-lg" />
        <div className="absolute bottom-12 right-8 w-16 h-16 border-r-2 border-b-2 border-accent/15 rounded-br-lg" />
      </motion.div>

      {/* === PARALLAX LAYER 2: floating badge === */}
      <motion.div
        className="absolute top-32 right-[8%] pointer-events-none hidden lg:block"
        style={{ y: yMid }}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-card/60 px-4 py-2.5 backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="font-display text-[10px] tracking-widest text-primary">LIVE RACES</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-[8%] pointer-events-none hidden lg:block"
        style={{ y: yMid }}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-card/60 px-4 py-2.5 backdrop-blur-sm">
          <Zap className="h-3 w-3 text-accent" />
          <span className="font-display text-[10px] tracking-widest text-accent">2,500+ RACERS</span>
        </div>
      </motion.div>

      {/* === MAIN CONTENT LAYER === */}
      <motion.div
        className="container relative z-10 mx-auto px-4 text-center"
        style={{ y: yFront, opacity: opacityFade }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          className="mb-10 flex justify-center"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 scale-[3] rounded-full bg-primary/10 blur-3xl"
              animate={{ scale: [3, 3.5, 3], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <img src={gsrLogo} alt="GSR" className="relative h-24 w-24 object-contain drop-shadow-2xl" />
          </div>
        </motion.div>

        {/* Eyebrow label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-5 flex items-center justify-center gap-3"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/60" />
          <span className="font-display text-xs tracking-[0.4em] text-primary uppercase">Greek SimRacers Hub</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/60" />
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <h1 className="font-display text-6xl font-black uppercase leading-none tracking-tight text-foreground sm:text-7xl lg:text-9xl">
            <span className="block text-gradient-racing">GREEK</span>
            <span className="block text-foreground">SIM</span>
            <span className="block text-gradient-racing">RACERS</span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mx-auto mt-8 max-w-lg font-body text-base text-muted-foreground leading-relaxed sm:text-lg"
        >
          Η #1 πλατφόρμα για Έλληνες SimRacers.{" "}
          <span className="text-foreground/70">Αγώνες, φόρουμ, podcasts και Fantasy League.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/auth"
            className="bg-gradient-racing group relative flex items-center gap-2.5 rounded-xl px-9 py-4 font-display text-sm font-semibold tracking-wider text-primary-foreground shadow-racing overflow-hidden transition-all hover:scale-105 hover:brightness-110"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <Flag className="h-4 w-4" />
            ΓΙΝΕ ΜΕΛΟΣ
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#live-races"
            className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-8 py-4 font-display text-sm font-semibold tracking-wider text-secondary-foreground backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card/80 hover:text-primary"
          >
            Live Races
          </a>
          <Link
            to="/games-hub"
            className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-8 py-4 font-display text-sm font-semibold tracking-wider text-secondary-foreground backdrop-blur-sm transition-all hover:border-accent/40 hover:bg-card/80 hover:text-accent"
          >
            Games Hub
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mx-auto mt-20 grid max-w-lg grid-cols-3 gap-3"
        >
          {[
            { icon: Users, value: "2,500+", label: "Μέλη" },
            { icon: Trophy, value: "150+", label: "Αγώνες" },
            { icon: Gamepad2, value: "10+", label: "Παιχνίδια" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-card/30 px-4 py-4 backdrop-blur-sm"
            >
              <stat.icon className="h-5 w-5 text-primary/70" />
              <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
              <p className="font-body text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-14 flex flex-col items-center gap-2"
        >
          <span className="font-display text-[10px] tracking-[0.3em] text-muted-foreground/50 uppercase">scroll</span>
          <motion.div
            className="h-10 w-px bg-gradient-to-b from-primary/40 to-transparent"
            animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
