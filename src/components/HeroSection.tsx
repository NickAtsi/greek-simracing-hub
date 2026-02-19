import { motion } from "framer-motion";
import { ChevronRight, Users, Trophy, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import gsrLogo from "@/assets/gsr-logo.png";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 scale-[2] rounded-full bg-primary/10 blur-3xl" />
            <img src={gsrLogo} alt="GSR" className="relative h-20 w-20 object-contain drop-shadow-2xl" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="font-display text-5xl font-black uppercase tracking-tight text-foreground sm:text-6xl lg:text-8xl">
            Greek{" "}
            <span className="text-gradient-racing">SimRacers</span>
          </h1>
          <p className="mt-2 font-display text-lg tracking-[0.3em] text-accent/60 uppercase sm:text-xl">
            H U B
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-6 max-w-xl font-body text-base text-muted-foreground leading-relaxed sm:text-lg"
        >
          Η #1 πλατφόρμα για Έλληνες SimRacers. Αγώνες, πληροφόρηση, forum, 
          podcasts και πολλά περισσότερα.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/auth"
            className="bg-gradient-racing group flex items-center gap-2 rounded-xl px-8 py-4 font-display text-sm font-semibold tracking-wider text-primary-foreground shadow-racing transition-all hover:scale-105 hover:brightness-110"
          >
            ΓΙΝΕ ΜΕΛΟΣ
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#live-races"
            className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-8 py-4 font-display text-sm font-semibold tracking-wider text-secondary-foreground transition-all hover:border-primary/30 hover:bg-card/80"
          >
            Live Races
          </a>
          <Link
            to="/games-hub"
            className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-8 py-4 font-display text-sm font-semibold tracking-wider text-secondary-foreground transition-all hover:border-accent/30 hover:bg-card/80"
          >
            Games Hub
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mx-auto mt-16 flex max-w-md items-center justify-center gap-8 sm:gap-12"
        >
          {[
            { icon: Users, value: "2,500+", label: "Μέλη" },
            { icon: Trophy, value: "150+", label: "Αγώνες" },
            { icon: Gamepad2, value: "10+", label: "Παιχνίδια" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 px-5 py-3 backdrop-blur-sm">
              <stat.icon className="h-5 w-5 text-primary/60" />
              <div className="text-left">
                <p className="font-display text-lg font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="font-body text-[11px] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
