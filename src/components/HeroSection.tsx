import { motion } from "framer-motion";
import { ChevronRight, Users, Trophy } from "lucide-react";
import heroImage from "@/assets/hero-racing.jpg";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="SimRacing cockpit setup"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-dark opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Red glow effect */}
      <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
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

          <h1 className="mb-6 font-display text-4xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Η Ελληνική
            <br />
            <span className="text-gradient-racing">SimRacing</span>
            <br />
            Κοινότητα
          </h1>

          <p className="mx-auto mb-10 max-w-2xl font-body text-lg text-muted-foreground">
            Η μεγαλύτερη πηγή πληροφόρησης για Έλληνες SimRacers. Forum, Live
            Races, Podcasts, και πολλά περισσότερα.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#community"
              className="bg-gradient-racing group flex items-center gap-2 rounded-lg px-8 py-4 font-display text-sm font-semibold tracking-wider text-primary-foreground shadow-racing transition-all hover:scale-105"
            >
              ΓΙΝΕ ΜΕΛΟΣ
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#live-races"
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-8 py-4 font-display text-sm font-semibold tracking-wider text-secondary-foreground transition-all hover:border-primary/40"
            >
              ΔΕΙΤΕ LIVE RACES
            </a>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-8"
          >
            {[
              { icon: Users, value: "2,500+", label: "Μέλη" },
              { icon: Trophy, value: "150+", label: "Αγώνες" },
              { value: "10+", label: "Παιχνίδια", icon: Trophy },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 font-body text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
