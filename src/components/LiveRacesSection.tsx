import { motion } from "framer-motion";
import { Circle, Clock, Users } from "lucide-react";

const races = [
  {
    title: "ACC Weekly Championship",
    game: "Assetto Corsa Competizione",
    time: "21:00",
    date: "Κάθε Τετάρτη",
    drivers: 28,
    status: "live" as const,
    track: "Monza",
  },
  {
    title: "iRacing Greek League",
    game: "iRacing",
    time: "22:00",
    date: "Κάθε Πέμπτη",
    drivers: 22,
    status: "upcoming" as const,
    track: "Spa-Francorchamps",
  },
  {
    title: "F1 24 Championship",
    game: "F1 24",
    time: "20:30",
    date: "Κάθε Σάββατο",
    drivers: 20,
    status: "upcoming" as const,
    track: "Silverstone",
  },
];

const LiveRacesSection = () => {
  return (
    <section id="live-races" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 carbon-texture opacity-5" />
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/5 blur-[100px]" />
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
            Live <span className="text-gradient-racing">Races</span>
          </h2>
          <p className="mt-3 font-body text-muted-foreground">
            Παρακολούθησε ή συμμετείχε στους αγώνες μας
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {races.map((race, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary/30 hover:shadow-glow"
            >
              {race.status === "live" && (
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
                  <Circle className="h-2 w-2 animate-pulse fill-primary text-primary" />
                  <span className="font-display text-[10px] font-semibold tracking-wider text-primary">
                    LIVE
                  </span>
                </div>
              )}

              <p className="mb-2 font-body text-xs font-medium text-primary">
                {race.game}
              </p>
              <h3 className="mb-1 font-display text-sm font-bold text-foreground">
                {race.title}
              </h3>
              <p className="mb-4 font-body text-xs text-muted-foreground">
                {race.track}
              </p>

              <div className="flex items-center gap-4 border-t border-border pt-4">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-body text-xs text-muted-foreground">
                    {race.date} - {race.time}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-body text-xs text-muted-foreground">
                    {race.drivers}
                  </span>
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
