import { motion } from "framer-motion";
import { MessageSquare, Mic, Gamepad2, Trophy, Newspaper, Users } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: MessageSquare,
    title: "Forum",
    desc: "Συζήτησε για SimRacing, setups, αγώνες και τεχνικά θέματα με την ελληνική κοινότητα.",
    href: "/forum",
    accent: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Mic,
    title: "Podcasts",
    desc: "Ακου τα επεισόδια μας στο Spotify – νέα, συνεντεύξεις και αναλύσεις SimRacing.",
    href: "/podcasts",
    accent: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Gamepad2,
    title: "Games Hub",
    desc: "Mini-games, Reaction Time challenge και leaderboards – δοκίμασε τα αντανακλαστικά σου.",
    href: "/games-hub",
    accent: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Trophy,
    title: "Fantasy League",
    desc: "Φτιάξε την ομάδα σου, διάλεξε οδηγούς και ανταγωνίσου στο Fantasy SimRacing.",
    href: "/forum",
    accent: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Newspaper,
    title: "Άρθρα & Νέα",
    desc: "Μείνε ενημερωμένος με τα τελευταία νέα, reviews και guides του SimRacing.",
    href: "/articles",
    accent: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Κοινότητα",
    desc: "1,000+ μέλη στο Facebook Group – βρες παρέα για αγώνες και συζητήσεις.",
    href: "https://discord.gg/v5RsBTnPpY",
    accent: "text-accent",
    bg: "bg-accent/10",
    external: true,
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative border-t border-border/50 py-28 overflow-hidden">
      <div className="absolute inset-0 carbon-texture opacity-[0.02]" />
      <div className="absolute left-0 top-1/3 h-80 w-80 rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute right-0 bottom-1/4 h-64 w-64 rounded-full bg-accent/4 blur-[100px]" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
            <span className="font-display text-[10px] tracking-[0.4em] text-primary uppercase">Τι προσφέρουμε</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-display text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
            Όλα σε <span className="text-gradient-racing">ένα μέρος</span>
          </h2>
          <p className="mt-3 font-body text-muted-foreground max-w-md mx-auto">
            Η πλήρης πλατφόρμα για τον Έλληνα SimRacer
          </p>
        </motion.div>

        <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Inner = (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group relative rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 transition-all hover:border-primary/30 hover:shadow-glow"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}>
                  <f.icon className={`h-5 w-5 ${f.accent}`} />
                </div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );

            if (f.external) {
              return (
                <a key={f.title} href={f.href} target="_blank" rel="noopener noreferrer">
                  {Inner}
                </a>
              );
            }
            return (
              <Link key={f.title} to={f.href}>
                {Inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
