import { motion } from "framer-motion";

const games = [
  { name: "Assetto Corsa Competizione", abbr: "ACC", players: "850+", color: "from-primary to-accent" },
  { name: "iRacing", abbr: "iR", players: "420+", color: "from-blue-600 to-blue-400" },
  { name: "F1 24", abbr: "F1", players: "380+", color: "from-red-700 to-red-500" },
  { name: "Assetto Corsa", abbr: "AC", players: "300+", color: "from-green-600 to-green-400" },
  { name: "rFactor 2", abbr: "rF2", players: "180+", color: "from-purple-600 to-purple-400" },
  { name: "Gran Turismo 7", abbr: "GT7", players: "250+", color: "from-yellow-600 to-yellow-400" },
];

const GamesHubSection = () => {
  return (
    <section id="games-hub" className="relative border-t border-border/50 py-24 overflow-hidden">
      <div className="absolute inset-0 carbon-texture opacity-5" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-accent/5 blur-[120px]" />
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-12"
        >
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
            Games <span className="text-gradient-racing">Hub</span>
          </h2>
          <p className="mt-3 font-body text-muted-foreground">
            Βρες την κοινότητα του αγαπημένου σου παιχνιδιού
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {games.map((game, i) => (
            <motion.a
              key={i}
              href="#"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 text-center transition-all hover:border-primary/30 hover:shadow-glow"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${game.color} shadow-lg`}>
                <span className="font-display text-sm font-bold text-primary-foreground">
                  {game.abbr}
                </span>
              </div>
              <div>
                <p className="font-body text-xs font-medium text-foreground">
                  {game.name}
                </p>
                <p className="mt-1 font-body text-[10px] text-muted-foreground">
                  {game.players} παίκτες
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamesHubSection;
