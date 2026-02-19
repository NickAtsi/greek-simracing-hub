import { motion } from "framer-motion";
import { Play, Clock, Headphones, ChevronRight } from "lucide-react";

const podcasts = [
  {
    title: "Η Εξέλιξη του SimRacing στην Ελλάδα",
    host: "Γιάννης Κ.",
    duration: "45:30",
    episode: 42,
    category: "Κουλτούρα",
  },
  {
    title: "Setup Guide: ACC GT3 για αρχάριους",
    host: "Νίκος Μ.",
    duration: "38:15",
    episode: 41,
    category: "Tutorial",
  },
  {
    title: "Συνέντευξη με Έλληνα Pro SimRacer",
    host: "Δημήτρης Π.",
    duration: "52:00",
    episode: 40,
    category: "Συνέντευξη",
  },
];

const PodcastsSection = () => {
  return (
    <section id="podcasts" className="relative border-t border-border/50 py-32 overflow-hidden">
      <div className="absolute inset-0 carbon-texture opacity-[0.03]" />
      <div className="absolute left-0 top-1/3 h-80 w-80 -translate-y-1/2 rounded-full bg-primary/4 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-16 flex items-end justify-between"
        >
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-8 bg-primary" />
              <span className="font-display text-[10px] tracking-[0.4em] text-primary uppercase">Audio</span>
            </div>
            <h2 className="font-display text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
              <span className="text-gradient-racing">Podcasts</span>
            </h2>
            <p className="mt-3 font-body text-muted-foreground">
              Ακούστε τα τελευταία επεισόδια
            </p>
          </div>
          <motion.a
            href="#"
            whileHover={{ x: 4 }}
            className="hidden items-center gap-1.5 font-body text-sm text-muted-foreground transition-colors hover:text-primary md:flex"
          >
            Όλα τα επεισόδια <ChevronRight className="h-4 w-4" />
          </motion.a>
        </motion.div>

        {/* Episode list */}
        <div className="space-y-4">
          {podcasts.map((ep, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
              whileHover={{ x: 4 }}
              className="group flex items-center gap-5 rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-5 transition-all hover:border-primary/30 hover:shadow-racing"
            >
              {/* Episode number */}
              <div className="flex-shrink-0 w-10 text-center">
                <span className="font-display text-[10px] text-muted-foreground">EP</span>
                <p className="font-display text-base font-black text-foreground/60">#{ep.episode}</p>
              </div>

              {/* Divider */}
              <div className="h-10 w-px bg-border flex-shrink-0" />

              {/* Play button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 border border-primary/20 transition-all group-hover:bg-primary/20 group-hover:border-primary/40"
              >
                <Play className="h-4 w-4 text-primary ml-0.5" />
              </motion.button>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="rounded bg-secondary/80 px-2 py-0.5 font-display text-[9px] tracking-widest text-muted-foreground uppercase">
                    {ep.category}
                  </span>
                </div>
                <h3 className="truncate font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {ep.title}
                </h3>
                <p className="font-body text-xs text-muted-foreground">{ep.host}</p>
              </div>

              {/* Duration */}
              <div className="hidden flex-shrink-0 items-center gap-1.5 sm:flex">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-body text-sm font-medium text-foreground">{ep.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Podcast CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm"
        >
          <Headphones className="h-5 w-5 text-primary" />
          <p className="font-body text-sm text-muted-foreground">
            Διαθέσιμο σε <span className="text-foreground font-medium">Spotify</span>,{" "}
            <span className="text-foreground font-medium">Apple Podcasts</span> και{" "}
            <span className="text-foreground font-medium">YouTube</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PodcastsSection;
