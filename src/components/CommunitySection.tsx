import { motion } from "framer-motion";
import { MessageSquare, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import RacingBackground from "@/components/RacingBackground";

const topics = [
  { title: "Καλύτερο τιμόνι κάτω από 300€;", replies: 45, views: 320, category: "Hardware" },
  { title: "ACC 1.10 Update - Τι αλλάζει;", replies: 32, views: 280, category: "News" },
  { title: "Πρώτη φορά σε league - τι να προσέξω;", replies: 28, views: 195, category: "Βοήθεια" },
  { title: "DIY Cockpit Build Log", replies: 56, views: 450, category: "Projects" },
];

const CommunitySection = () => {
  return (
    <section id="community" className="relative border-t border-border/50 py-24 overflow-hidden">
      <div className="absolute inset-0 carbon-texture opacity-5" />
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
            <span className="text-gradient-racing">Κοινότητα</span> & Forum
          </h2>
          <p className="mt-3 font-body text-muted-foreground">
            Συζήτησε, ρώτησε, μοιράσου την εμπειρία σου
          </p>
        </motion.div>

        <div className="mx-auto max-w-3xl space-y-3">
          {topics.map((topic, i) => (
            <motion.a
              key={i}
              href="#"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: "easeOut" }}
              className="group flex items-center justify-between rounded-xl border border-border bg-card/80 backdrop-blur-sm px-5 py-4 transition-all hover:border-primary/30 hover:shadow-glow"
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div>
                  <h4 className="font-body text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {topic.title}
                  </h4>
                  <span className="mt-1 inline-block rounded bg-secondary px-2 py-0.5 font-body text-[10px] text-secondary-foreground">
                    {topic.category}
                  </span>
                </div>
              </div>
              <div className="hidden items-center gap-4 sm:flex">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  <span className="font-body text-xs">{topic.replies}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-body text-xs">{topic.views}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mt-16 text-center"
        >
          <div className="relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-primary/20 bg-card p-8">
            <RacingBackground />
            <div className="absolute inset-0 carbon-texture opacity-20" />
            <div className="relative z-10">
              <Users className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-display text-xl font-bold text-foreground">
                Γίνε μέλος σήμερα
              </h3>
              <p className="mb-6 font-body text-sm text-muted-foreground">
                Δημιούργησε το προφίλ σου και ξεκίνα να αγωνίζεσαι
              </p>
              <Link
                to="/auth"
                className="bg-gradient-racing inline-block rounded-lg px-8 py-3 font-display text-sm font-semibold tracking-wider text-primary-foreground transition-transform hover:scale-105 hover:shadow-racing"
              >
                ΕΓΓΡΑΦΗ ΔΩΡΕΑΝ
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunitySection;
