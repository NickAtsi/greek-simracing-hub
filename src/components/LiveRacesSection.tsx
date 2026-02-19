import { motion } from "framer-motion";
import { Circle, Clock, Users, MapPin, ChevronRight } from "lucide-react";

const races = [
  {
    title: "ACC Weekly Championship",
    game: "Assetto Corsa Competizione",
    time: "21:00",
    date: "Κάθε Τετάρτη",
    drivers: 28,
    status: "live" as const,
    track: "Monza",
    flag: "🇮🇹",
    series: "GT3",
  },
  {
    title: "iRacing Greek League",
    game: "iRacing",
    time: "22:00",
    date: "Κάθε Πέμπτη",
    drivers: 22,
    status: "upcoming" as const,
    track: "Spa-Francorchamps",
    flag: "🇧🇪",
    series: "Formula",
  },
  {
    title: "F1 24 Championship",
    game: "F1 24",
    time: "20:30",
    date: "Κάθε Σάββατο",
    drivers: 20,
    status: "upcoming" as const,
    track: "Silverstone",
    flag: "🇬🇧",
    series: "F1",
  },
];

const LiveRacesSection = () => {
  return (
    <section id="live-races" className="relative py-32 overflow-hidden">
      {/* Section ambience */}
      <div className="absolute inset-0 carbon-texture opacity-[0.03]" />
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-accent/4 blur-[100px]" />

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
              <span className="font-display text-[10px] tracking-[0.4em] text-primary uppercase">Αγώνες</span>
            </div>
            <h2 className="font-display text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
              Live <span className="text-gradient-racing">Races</span>
            </h2>
            <p className="mt-3 font-body text-muted-foreground">
              Παρακολούθησε ή συμμετείχε στους αγώνες μας
            </p>
          </div>
          <motion.a
            href="#"
            whileHover={{ x: 4 }}
            className="hidden items-center gap-1.5 font-body text-sm text-muted-foreground transition-colors hover:text-primary md:flex"
          >
            Όλοι οι αγώνες <ChevronRight className="h-4 w-4" />
          </motion.a>
        </motion.div>

        {/* Race cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {races.map((race, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/70 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-racing"
            >
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${race.status === "live" ? "bg-gradient-racing" : "bg-border"} transition-all group-hover:bg-gradient-racing`} />

              {/* Status badge */}
              {race.status === "live" ? (
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1">
                  <Circle className="h-2 w-2 animate-pulse fill-primary text-primary" />
                  <span className="font-display text-[10px] font-bold tracking-wider text-primary">LIVE</span>
                </div>
              ) : (
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-muted/50 border border-border/50 px-3 py-1">
                  <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                  <span className="font-display text-[10px] tracking-wider text-muted-foreground">UPCOMING</span>
                </div>
              )}

              <div className="p-6 pt-5">
                {/* Series tag */}
                <span className="mb-3 inline-block rounded-md bg-secondary/60 px-2 py-0.5 font-display text-[9px] tracking-widest text-muted-foreground uppercase">
                  {race.series}
                </span>

                <p className="mb-1 font-body text-[11px] font-medium text-primary/80">{race.game}</p>
                <h3 className="mb-1 font-display text-base font-bold text-foreground leading-tight">{race.title}</h3>

                {/* Track */}
                <div className="mb-5 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="font-body text-xs text-muted-foreground">{race.flag} {race.track}</span>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-body text-xs text-muted-foreground">{race.date} — {race.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="font-body text-xs font-medium text-foreground">{race.drivers}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveRacesSection;
