import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Calendar, Users, Flag, ChevronRight, Timer, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

type ChampionshipStatus = "all" | "active" | "upcoming" | "completed";

interface Championship {
  id: string;
  title: string;
  description: string;
  status: "active" | "upcoming" | "completed";
  races: { completed: number; total: number };
  participants: number;
  startDate: string;
  image: string;
  category: string;
}

const championships: Championship[] = [
  {
    id: "gt3-spring-2026",
    title: "GT3 Spring Championship 2026",
    description: "Ανοιξιάτικο πρωτάθλημα GT3 με τις καλύτερες πίστες της Ευρώπης",
    status: "active",
    races: { completed: 3, total: 8 },
    participants: 24,
    startDate: "2026-03-01",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=400&fit=crop",
    category: "GT3",
  },
  {
    id: "formula-challenge",
    title: "Formula Challenge Series",
    description: "Αγώνες μονοθεσίων για τους πιο γρήγορους οδηγούς",
    status: "active",
    races: { completed: 5, total: 10 },
    participants: 18,
    startDate: "2026-02-15",
    image: "https://images.unsplash.com/photo-1541447270888-83e8494f9c04?w=600&h=400&fit=crop",
    category: "Formula",
  },
  {
    id: "endurance-summer",
    title: "Endurance Summer Cup",
    description: "Αγώνες αντοχής 2-4 ωρών σε θρυλικές πίστες",
    status: "upcoming",
    races: { completed: 0, total: 6 },
    participants: 32,
    startDate: "2026-06-01",
    image: "https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=600&h=400&fit=crop",
    category: "Endurance",
  },
  {
    id: "gt4-rookie",
    title: "GT4 Rookie Championship",
    description: "Πρωτάθλημα για νέους οδηγούς στην κατηγορία GT4",
    status: "upcoming",
    races: { completed: 0, total: 8 },
    participants: 16,
    startDate: "2026-05-10",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop",
    category: "GT4",
  },
  {
    id: "gt3-winter-2025",
    title: "GT3 Winter Championship 2025",
    description: "Χειμερινό πρωτάθλημα GT3 - Ολοκληρώθηκε",
    status: "completed",
    races: { completed: 8, total: 8 },
    participants: 22,
    startDate: "2025-11-01",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop",
    category: "GT3",
  },
  {
    id: "drift-masters",
    title: "Drift Masters 2025",
    description: "Το πρώτο πρωτάθλημα drift της κοινότητας",
    status: "completed",
    races: { completed: 6, total: 6 },
    participants: 14,
    startDate: "2025-09-15",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop",
    category: "Drift",
  },
];

const filters: { label: string; value: ChampionshipStatus }[] = [
  { label: "Όλα", value: "all" },
  { label: "Ενεργά", value: "active" },
  { label: "Ερχόμενα", value: "upcoming" },
  { label: "Ολοκληρωμένα", value: "completed" },
];

const statusConfig = {
  active: { label: "Ενεργό", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  upcoming: { label: "Ερχόμενο", color: "bg-accent/20 text-accent border-accent/30" },
  completed: { label: "Ολοκληρωμένο", color: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30" },
};

const ChampionshipCard = ({ champ, index }: { champ: Championship; index: number }) => {
  const status = statusConfig[champ.status];
  const progress = champ.races.total > 0 ? (champ.races.completed / champ.races.total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group relative rounded-xl overflow-hidden border border-border/40 bg-card hover:border-primary/30 transition-all duration-500 hover:shadow-racing"
    >
      {/* Glow effect */}
      <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />

      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-72 h-48 sm:h-auto overflow-hidden flex-shrink-0">
          <img
            src={champ.image}
            alt={champ.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80 hidden sm:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent sm:hidden" />

          {/* Status badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${status.color}`}>
            {status.label}
          </div>

          {/* Category */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-display text-foreground">
            {champ.category}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground group-hover:text-gradient-racing transition-all duration-300 mb-2">
              {champ.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {champ.description}
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Flag className="h-3.5 w-3.5 text-primary" />
                Αγώνες {champ.races.completed}/{champ.races.total}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                {champ.participants} οδηγοί
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {new Date(champ.startDate).toLocaleDateString("el-GR", { month: "short", year: "numeric" })}
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden sm:flex items-center pr-5">
          <motion.div
            className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-all duration-300"
            whileHover={{ x: 4 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const Championships = () => {
  const [filter, setFilter] = useState<ChampionshipStatus>("all");

  const filtered = filter === "all" ? championships : championships.filter(c => c.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ScrollToTop />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6"
            >
              <Trophy className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              ΠΡΩΤΑΘΛΗ<span className="text-gradient-racing">ΜΑΤΑ</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Όλα τα πρωταθλήματα του Greek SimRacers
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="flex gap-2 p-1 rounded-xl bg-card border border-border/40">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filter === f.value
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter === f.value && (
                  <motion.div
                    layoutId="filter-bg"
                    className="absolute inset-0 rounded-lg bg-gradient-greek"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative">{f.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Championships grid */}
      <section className="container mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4 max-w-4xl mx-auto"
          >
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <Timer className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Δεν υπάρχουν πρωταθλήματα σε αυτή την κατηγορία</p>
              </motion.div>
            ) : (
              filtered.map((champ, i) => (
                <ChampionshipCard key={champ.id} champ={champ} index={i} />
              ))
            )}
          </motion.div>
        </AnimatePresence>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Trophy, label: "Πρωταθλήματα", value: championships.length },
            { icon: Flag, label: "Αγώνες", value: championships.reduce((a, c) => a + c.races.total, 0) },
            { icon: Users, label: "Οδηγοί", value: championships.reduce((a, c) => a + c.participants, 0) },
            { icon: MapPin, label: "Πίστες", value: "20+" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/30 bg-card/50">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="font-display text-xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Championships;
