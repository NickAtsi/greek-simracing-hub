import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Star, Trophy, Target, Zap, Crown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const categoryIcons: Record<string, any> = {
  racing: Trophy,
  community: Star,
  skill: Target,
  endurance: Zap,
  special: Crown,
};

const categoryLabels: Record<string, string> = {
  racing: "Αγώνες",
  community: "Κοινότητα",
  skill: "Ικανότητα",
  endurance: "Αντοχή",
  special: "Ειδικά",
};

const Achievements = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const { data: b } = await supabase.from("achievement_badges" as any).select("*").order("category, name");
    setBadges((b as any[]) || []);

    if (user) {
      const { data: ua } = await supabase.from("user_achievements" as any).select("*").eq("user_id", user.id);
      setUserAchievements((ua as any[]) || []);
    }
    setLoading(false);
  };

  const earnedBadgeIds = new Set(userAchievements.map((a: any) => a.badge_id));
  const categories = ["all", ...new Set(badges.map((b: any) => b.category))];
  const filtered = selectedCategory === "all" ? badges : badges.filter((b: any) => b.category === selectedCategory);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-4">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Achievement System</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
              Achievement <span className="text-gradient-racing">Badges</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Κέρδισε badges μέσω της δραστηριότητάς σου! Αγώνες, συμμετοχές και επιτεύγματα.
            </p>
            {user && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-card border border-border/60 px-5 py-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-display font-bold text-lg">{userAchievements.length}</span>
                <span className="text-muted-foreground text-sm">/ {badges.length} badges</span>
              </div>
            )}
          </motion.div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat] || Award;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat === "all" ? "Όλα" : categoryLabels[cat] || cat}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-16">Φόρτωση...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Δεν υπάρχουν badges ακόμα</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {filtered.map((badge: any, i: number) => {
                const earned = earnedBadgeIds.has(badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-xl border p-5 transition-all ${
                      earned ? "border-primary/50 bg-card shadow-racing" : "border-border/60 bg-card/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-4xl ${earned ? "" : "grayscale"}`}>{badge.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-foreground">{badge.name}</h3>
                        <p className="text-muted-foreground text-xs mt-1">{badge.description}</p>
                        {badge.requirement && (
                          <p className="text-xs text-primary/70 mt-2 italic">{badge.requirement}</p>
                        )}
                        <div className="mt-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            earned ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"
                          }`}>
                            {earned ? "✅ Κερδίθηκε" : "🔒 Κλειδωμένο"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Achievements;
