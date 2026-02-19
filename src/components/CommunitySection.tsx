import { motion } from "framer-motion";
import { MessageSquare, TrendingUp, Users, Shield, ChevronRight, Star, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import DiscordWidget from "@/components/DiscordWidget";


const perks = [
  { icon: Trophy, label: "Αποκλειστικοί αγώνες" },
  { icon: Shield, label: "Επαληθευμένα αποτελέσματα" },
  { icon: Star, label: "Fantasy League" },
  { icon: Users, label: "Κοινότητα" },
];

const CommunitySection = () => {
  return (
    <section id="community" className="relative border-t border-border/50 py-32 overflow-hidden">
      <div className="absolute inset-0 carbon-texture opacity-[0.03]" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-primary/4 blur-[130px]" />
      <div className="absolute left-1/3 top-0 h-64 w-64 rounded-full bg-accent/3 blur-[100px]" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
            <span className="font-display text-[10px] tracking-[0.4em] text-primary uppercase">Forum</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-display text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
            <span className="text-gradient-racing">Κοινότητα</span> & Forum
          </h2>
          <p className="mt-3 font-body text-muted-foreground">
            Συζήτησε, ρώτησε, μοιράσου την εμπειρία σου
          </p>
        </motion.div>

        {/* Forum + Discord Grid */}
        <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forum Recent Topics */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm font-bold text-muted-foreground uppercase tracking-wider">Τελευταίες Συζητήσεις</h3>
              <Link to="/forum" className="text-xs text-primary hover:underline">Δες όλες →</Link>
            </div>
            {[
              { title: "Καλύτερο τιμόνι κάτω από 300€;", replies: 45, views: 320, category: "Τεχνική Υποστήριξη", hot: true },
              { title: "ACC 1.10 Update — Τι αλλάζει;", replies: 32, views: 280, category: "Simracing Games", hot: false },
              { title: "Πρώτη φορά σε league — τι να προσέξω;", replies: 28, views: 195, category: "Γενικές Συζητήσεις", hot: false },
              { title: "DIY Cockpit Build Log 2025", replies: 56, views: 450, category: "Γενικές Συζητήσεις", hot: true },
            ].map((topic, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.55, ease: "easeOut" }}
              >
                <Link to="/forum">
                  <div className="group flex items-center justify-between rounded-2xl border border-border bg-card/70 backdrop-blur-sm px-5 py-4 transition-all hover:border-primary/30 hover:shadow-glow hover:translate-x-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-body text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {topic.title}
                          </h4>
                          {topic.hot && (
                            <span className="flex-shrink-0 rounded-full bg-primary/15 px-2 py-0.5 font-display text-[8px] tracking-wider text-primary uppercase">
                              🔥 Hot
                            </span>
                          )}
                        </div>
                        <span className="mt-0.5 inline-block rounded-md bg-secondary/70 px-2 py-0.5 font-body text-[10px] text-muted-foreground">
                          {topic.category}
                        </span>
                      </div>
                    </div>
                    <div className="hidden flex-shrink-0 items-center gap-5 sm:flex">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <span className="font-body text-xs">{topic.replies}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-body text-xs">{topic.views}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:text-primary group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Discord Widget */}
          <div>
            <h3 className="font-display text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Discord Server</h3>
            <DiscordWidget />
          </div>
        </div>

        {/* Join CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 mx-auto max-w-2xl overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-card/60 backdrop-blur-sm"
        >

          {/* Top gradient bar */}
          <div className="h-1 w-full bg-gradient-racing" />
          <div className="p-10 text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20"
            >
              <Users className="h-7 w-7 text-primary" />
            </motion.div>
            <h3 className="mb-2 font-display text-2xl font-black text-foreground uppercase">
              Γίνε μέλος σήμερα
            </h3>
            <p className="mb-8 font-body text-sm text-muted-foreground max-w-sm mx-auto">
              Δημιούργησε το προφίλ σου και ξεκίνα να αγωνίζεσαι με την ελληνική SimRacing κοινότητα
            </p>

            {/* Perks */}
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {perks.map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-secondary/30 py-3 px-2">
                  <p.icon className="h-4 w-4 text-primary/70" />
                  <span className="font-body text-[10px] text-muted-foreground text-center">{p.label}</span>
                </div>
              ))}
            </div>

            <Link
              to="/auth"
              className="bg-gradient-racing group relative inline-flex items-center gap-2 rounded-xl px-10 py-4 font-display text-sm font-bold tracking-widest text-primary-foreground shadow-racing overflow-hidden transition-all hover:scale-105 hover:brightness-110"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              ΕΓΓΡΑΦΗ ΔΩΡΕΑΝ
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunitySection;
