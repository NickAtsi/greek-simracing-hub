import { motion } from "framer-motion";
import { Play, Clock, Headphones } from "lucide-react";

const podcasts = [
  {
    title: "Η Εξέλιξη του SimRacing στην Ελλάδα",
    host: "Γιάννης Κ.",
    duration: "45:30",
    episode: 42,
  },
  {
    title: "Setup Guide: ACC GT3 για αρχάριους",
    host: "Νίκος Μ.",
    duration: "38:15",
    episode: 41,
  },
  {
    title: "Συνέντευξη με Έλληνα Pro SimRacer",
    host: "Δημήτρης Π.",
    duration: "52:00",
    episode: 40,
  },
];

const PodcastsSection = () => {
  return (
    <section id="podcasts" className="relative border-t border-border py-24">
      <div className="absolute left-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-accent/5 blur-[100px]" />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
            <span className="text-gradient-racing">Podcasts</span>
          </h2>
          <p className="mt-3 font-body text-muted-foreground">
            Ακούστε τα τελευταία επεισόδια
          </p>
        </motion.div>

        <div className="space-y-3">
          {podcasts.map((ep, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex items-center gap-4 rounded-xl border border-border bg-gradient-card p-4 transition-all hover:border-primary/30 hover:shadow-glow sm:p-5"
            >
              <button className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Play className="h-5 w-5 text-primary" />
              </button>

              <div className="min-w-0 flex-1">
                <p className="font-body text-[10px] font-medium text-primary">
                  ΕΠΕΙΣΟΔΙΟ #{ep.episode}
                </p>
                <h3 className="truncate font-display text-sm font-semibold text-foreground">
                  {ep.title}
                </h3>
                <p className="font-body text-xs text-muted-foreground">
                  {ep.host}
                </p>
              </div>

              <div className="hidden items-center gap-1.5 sm:flex">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-body text-xs text-muted-foreground">
                  {ep.duration}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PodcastsSection;
