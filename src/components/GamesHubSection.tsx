import { motion } from "framer-motion";
import { ChevronRight, Gamepad2 } from "lucide-react";

const games = [
  { name: "Assetto Corsa Competizione", abbr: "ACC", players: "850+", gradient: "from-[#E10600] to-[#ff6b35]", textColor: "text-white" },
  { name: "iRacing", abbr: "iR", players: "420+", gradient: "from-[#1565C0] to-[#42A5F5]", textColor: "text-white" },
  { name: "F1 24", abbr: "F1", players: "380+", gradient: "from-[#CC0000] to-[#FF6600]", textColor: "text-white" },
  { name: "Assetto Corsa", abbr: "AC", players: "300+", gradient: "from-[#1B5E20] to-[#66BB6A]", textColor: "text-white" },
  { name: "rFactor 2", abbr: "rF2", players: "180+", gradient: "from-[#4A148C] to-[#AB47BC]", textColor: "text-white" },
  { name: "Gran Turismo 7", abbr: "GT7", players: "250+", gradient: "from-[#B8860B] to-[#FFD700]", textColor: "text-white" },
];

const GamesHubSection = () => {
  return (
    <section id="games-hub" className="relative border-t border-border/50 py-32 overflow-hidden">
      <div className="absolute inset-0 carbon-texture opacity-[0.03]" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-80 w-80 rounded-full bg-accent/5 blur-[130px]" />

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
              <div className="h-px w-8 bg-accent" />
              <span className="font-display text-[10px] tracking-[0.4em] text-accent uppercase">Παιχνίδια</span>
            </div>
            <h2 className="font-display text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
              Games <span className="text-gradient-racing">Hub</span>
            </h2>
            <p className="mt-3 font-body text-muted-foreground">
              Βρες την κοινότητα του αγαπημένου σου παιχνιδιού
            </p>
          </div>
          <motion.a
            href="/games-hub"
            whileHover={{ x: 4 }}
            className="hidden items-center gap-1.5 font-body text-sm text-muted-foreground transition-colors hover:text-accent md:flex"
          >
            Όλα τα παιχνίδια <ChevronRight className="h-4 w-4" />
          </motion.a>
        </motion.div>

        {/* Game tiles */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {games.map((game, i) => (
            <motion.a
              key={i}
              href="#"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -6, scale: 1.03 }}
              className="group relative flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 text-center overflow-hidden transition-all hover:border-border/80 hover:shadow-lg"
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${game.gradient}`} />

              {/* Abbr badge */}
              <div className={`relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${game.gradient} shadow-lg`}>
                <span className={`font-display text-sm font-black ${game.textColor}`}>{game.abbr}</span>
              </div>

              <div>
                <p className="font-body text-xs font-semibold text-foreground leading-tight">{game.name}</p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <Gamepad2 className="h-3 w-3 text-muted-foreground" />
                  <p className="font-body text-[10px] text-muted-foreground">{game.players}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Big CTA band */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <p className="font-display text-lg font-bold text-foreground">Δεν βρήκες το παιχνίδι σου;</p>
            <p className="mt-1 font-body text-sm text-muted-foreground">Πρότεινέ μας να το προσθέσουμε στην πλατφόρμα.</p>
          </div>
          <a
            href="/games-hub"
            className="flex-shrink-0 rounded-xl border border-border bg-secondary/50 px-6 py-3 font-display text-sm font-semibold tracking-wider text-foreground transition-all hover:border-accent/40 hover:text-accent"
          >
            ΟΛΕΣ ΟΙ ΚΑΤΗΓΟΡΙΕΣ
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default GamesHubSection;
