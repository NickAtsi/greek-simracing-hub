import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Clock, Trophy, ChevronDown, TrendingUp, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formatLapTime = (ms: number) => {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const milli = ms % 1000;
  return `${min}:${String(sec).padStart(2, "0")}.${String(milli).padStart(3, "0")}`;
};

const Predictions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [prediction, setPrediction] = useState("");

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const { data: ev } = await supabase.from("prediction_events" as any).select("*").order("deadline", { ascending: false });
    setEvents((ev as any[]) || []);
    if (user) {
      const { data: en } = await supabase.from("prediction_entries" as any).select("*").eq("user_id", user.id);
      setEntries((en as any[]) || []);
    }
    setLoading(false);
  };

  const userEntryMap = useMemo(() => {
    const map: Record<string, any> = {};
    entries.forEach((e: any) => { map[e.event_id] = e; });
    return map;
  }, [entries]);

  const handleSubmitPrediction = async (eventId: string) => {
    if (!user) { toast({ title: "Πρέπει να συνδεθείς", variant: "destructive" }); return; }
    if (!prediction.trim()) return;

    let parsed;
    try { parsed = JSON.parse(prediction); } catch { parsed = { prediction: prediction.trim() }; }

    const { error } = await supabase.from("prediction_entries" as any).upsert({
      event_id: eventId,
      user_id: user.id,
      predictions: parsed,
    } as any, { onConflict: "event_id,user_id" });

    if (error) {
      toast({ title: "Σφάλμα", variant: "destructive" });
    } else {
      toast({ title: "Η πρόβλεψή σου καταχωρήθηκε! 🎯" });
      setPrediction("");
      setSelectedEvent(null);
      fetchData();
    }
  };

  const statusColors: Record<string, string> = {
    open: "bg-green-500/20 text-green-400",
    closed: "bg-yellow-500/20 text-yellow-400",
    resolved: "bg-blue-500/20 text-blue-400",
  };

  const statusLabels: Record<string, string> = {
    open: "Ανοιχτό",
    closed: "Κλειστό",
    resolved: "Ολοκληρώθηκε",
  };

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase.from("prediction_entries" as any).select("user_id, points_earned");
      if (!data) return;
      const totals: Record<string, number> = {};
      (data as any[]).forEach((e: any) => { totals[e.user_id] = (totals[e.user_id] || 0) + (e.points_earned || 0); });
      const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 10);
      // Fetch profiles
      if (sorted.length > 0) {
        const ids = sorted.map(([id]) => id);
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username, avatar_url").in("user_id", ids);
        const profileMap: Record<string, any> = {};
        ((profiles as any[]) || []).forEach((p: any) => { profileMap[p.user_id] = p; });
        setLeaderboard(sorted.map(([id, pts]) => ({ ...profileMap[id], points: pts })));
      }
    };
    fetchLeaderboard();
  }, [entries]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-4">
              <Gamepad2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Predictions Game</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
              Πρόβλεψε <span className="text-gradient-racing">& Κέρδισε</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Πρόβλεψε τα αποτελέσματα των αγώνων και κέρδισε πόντους! Ποιος θα κατακτήσει την κορυφή;
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Events */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Ενεργά Events</h2>
              {loading ? (
                <div className="text-center text-muted-foreground py-16">Φόρτωση...</div>
              ) : events.length === 0 ? (
                <div className="text-center py-16">
                  <Gamepad2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Δεν υπάρχουν events ακόμα</p>
                </div>
              ) : (
                events.map((ev: any, i: number) => {
                  const entry = userEntryMap[ev.id];
                  const isOpen = ev.status === "open" && new Date(ev.deadline) > new Date();
                  return (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-border/60 bg-card p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[ev.status]}`}>
                              {statusLabels[ev.status]}
                            </span>
                            {ev.event_date && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(ev.event_date).toLocaleDateString("el-GR")}
                              </span>
                            )}
                          </div>
                          <h3 className="font-display font-bold text-foreground text-lg">{ev.title}</h3>
                          {ev.description && <p className="text-muted-foreground text-sm mt-1">{ev.description}</p>}
                          <p className="text-xs text-muted-foreground mt-2">
                            Deadline: {new Date(ev.deadline).toLocaleDateString("el-GR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className="text-right">
                          {entry ? (
                            <div>
                              <span className="text-xs text-green-400">✅ Υποβλήθηκε</span>
                              {entry.points_earned > 0 && (
                                <p className="text-primary font-display font-bold mt-1">+{entry.points_earned} πόντοι</p>
                              )}
                            </div>
                          ) : isOpen ? (
                            <Button size="sm" onClick={() => { setSelectedEvent(ev); setPrediction(""); }}>
                              Πρόβλεψε
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" /> Έκλεισε</span>
                          )}
                        </div>
                      </div>

                      {/* Prediction form inline */}
                      {selectedEvent?.id === ev.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-border/50">
                          <Input
                            placeholder="Γράψε την πρόβλεψή σου (π.χ. 1ος: Hamilton, 2ος: Verstappen)"
                            value={prediction}
                            onChange={(e) => setPrediction(e.target.value)}
                            className="mb-3"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSubmitPrediction(ev.id)}>Υποβολή</Button>
                            <Button size="sm" variant="outline" onClick={() => setSelectedEvent(null)}>Ακύρωση</Button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Leaderboard */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Κατάταξη
              </h2>
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">Δεν υπάρχουν πόντοι ακόμα</p>
                ) : (
                  leaderboard.map((entry: any, i: number) => (
                    <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border/30" : ""}`}>
                      <span className={`font-display font-bold text-sm w-6 text-center ${
                        i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-orange-400" : "text-muted-foreground"
                      }`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </span>
                      <span className="text-sm text-foreground flex-1 truncate">
                        {entry?.display_name || entry?.username || "Χρήστης"}
                      </span>
                      <span className="font-display font-bold text-primary text-sm">{entry.points}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Predictions;
