import { motion } from "framer-motion";
import { Flag, Users, Trophy, Mic, Heart, Target, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

const About = () => {
  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        {/* Hero */}
        <div className="relative border-b border-border/50 bg-gradient-to-b from-primary/10 to-transparent overflow-hidden">
          <div className="absolute inset-0 carbon-texture opacity-5" />
          <div className="container mx-auto px-4 py-16 text-center relative">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px w-8 bg-primary" />
                <span className="font-display text-[10px] tracking-[0.4em] text-primary uppercase">Σχετικά με εμάς</span>
                <div className="h-px w-8 bg-primary" />
              </div>
              <h1 className="font-display text-5xl font-black uppercase text-foreground mb-4">
                <span className="text-gradient-racing">Greek</span> SimRacers
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                Η μεγαλύτερη ελληνική κοινότητα για τους λάτρεις του Sim Racing. 
                Από το 2020, ενώνουμε χιλιάδες Έλληνες racers με κοινό πάθος: την εικονική μηχανοκίνηση.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { icon: Users, value: "5,000+", label: "Μέλη" },
              { icon: Trophy, value: "200+", label: "Αγώνες" },
              { icon: Mic, value: "50+", label: "Podcasts" },
              { icon: Flag, value: "3+", label: "Χρόνια" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="text-center rounded-xl border border-border bg-card p-6">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="font-display text-3xl font-black text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Mission */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="font-display text-3xl font-black text-foreground mb-4">
                Η <span className="text-gradient-racing">Αποστολή</span> μας
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Στο Greek SimRacers πιστεύουμε ότι το Sim Racing είναι πολύ περισσότερο από ένα παιχνίδι — 
                είναι ένα πραγματικό άθλημα που απαιτεί δεξιοτεχνία, στρατηγική και αφοσίωση.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Δημιουργήσαμε αυτή την πλατφόρμα για να δώσουμε στους Έλληνες SimRacers έναν χώρο να 
                συναντηθούν, να ανταγωνιστούν και να μεγαλώσουν μαζί.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Μέσω των αγώνων, του forum, των podcasts και των άρθρων μας, χτίζουμε μια κοινότητα 
                που στηρίζει τον κάθε racer — είτε είναι αρχάριος είτε έμπειρος.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {[
                { icon: Target, title: "Ανταγωνιστικοί Αγώνες", desc: "Εβδομαδιαία και μηνιαία πρωταθλήματα σε όλα τα δημοφιλή sims" },
                { icon: Users, title: "Κοινότητα Πρώτα", desc: "Ένα φιλόξενο περιβάλλον για κάθε επίπεδο εμπειρίας" },
                { icon: Zap, title: "Εκπαίδευση & Ανάπτυξη", desc: "Οδηγοί, tips και setups από έμπειρους racers" },
                { icon: Heart, title: "Πάθος για το Motorsport", desc: "Αγαπάμε τόσο το virtual όσο και το πραγματικό motorsport" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* CTA */}
          <div className="text-center rounded-2xl border border-primary/20 bg-primary/5 p-12">
            <h2 className="font-display text-3xl font-black text-foreground mb-4">
              Γίνε μέλος της <span className="text-gradient-racing">κοινότητας</span>
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Εγγράψου δωρεάν και ξεκίνα το ταξίδι σου στον κόσμο του Sim Racing!
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/auth"><Button className="bg-gradient-greek text-white hover:brightness-110 px-8">Εγγραφή</Button></Link>
              <Link to="/contact"><Button variant="outline">Επικοινωνία</Button></Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </PageTransition>
  );
};

export default About;
