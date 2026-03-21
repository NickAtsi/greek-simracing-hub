import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Timer, Plus, Trophy, Search, ArrowUpDown, Youtube, ExternalLink } from "lucide-react";
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

const parseLapTime = (str: string): number | null => {
  const match = str.match(/^(\d+):(\d{1,2})\.(\d{1,3})$/);
  if (!match) return null;
  return parseInt(match[1]) * 60000 + parseInt(match[2]) * 1000 + parseInt(match[3].padEnd(3, "0"));
};

const LapTimes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lapTimes, setLapTimes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTrack, setFilterTrack] = useState("");
  const [filterSim, setFilterSim] = useState("");
  const [sortBy, setSortBy] = useState<"time" | "date">("time");
  const [form, setForm] = useState({ track_name: "", car_name: "", sim_name: "", lap_time: "", conditions: "dry", video_url: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("lap_times" as any).select("*").order("lap_time_ms");
    const laps = (data as any[]) || [];
    setLapTimes(laps);

    const userIds = [...new Set(laps.map((l: any) => l.user_id))];
    if (userIds.length > 0) {
      const { data: p } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", userIds);
      const pMap: Record<string, any> = {};
      ((p as any[]) || []).forEach((pr: any) => { pMap[pr.user_id] = pr; });
      setProfiles(pMap);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!user) { toast({ title: "Πρέπει να συνδεθείς", variant: "destructive" }); return; }
    const ms = parseLapTime(form.lap_time);
    if (!ms) { toast({ title: "Μη έγκυρος χρόνος (μορφή: 1:23.456)", variant: "destructive" }); return; }
    if (!form.track_name.trim() || !form.car_name.trim() || !form.sim_name.trim()) {
      toast({ title: "Συμπλήρωσε όλα τα πεδία", variant: "destructive" }); return;
    }

    const { error } = await supabase.from("lap_times" as any).insert({
      user_id: user.id,
      track_name: form.track_name.trim(),
      car_name: form.car_name.trim(),
      sim_name: form.sim_name.trim(),
      lap_time_ms: ms,
      conditions: form.conditions,
      video_url: form.video_url.trim() || null,
    } as any);

    if (error) {
      toast({ title: "Σφάλμα", variant: "destructive" });
    } else {
      toast({ title: "Ο χρόνος καταχωρήθηκε! ⏱️" });
      setForm({ track_name: "", car_name: "", sim_name: "", lap_time: "", conditions: "dry", video_url: "" });
      setShowAdd(false);
      fetchData();
    }
  };

  const tracks = useMemo(() => [...new Set(lapTimes.map((l: any) => l.track_name))].sort(), [lapTimes]);
  const sims = useMemo(() => [...new Set(lapTimes.map((l: any) => l.sim_name))].sort(), [lapTimes]);

  const filtered = useMemo(() => {
    let result = [...lapTimes];
    if (search) result = result.filter((l: any) => {
      const p = profiles[l.user_id];
      const name = p?.display_name || p?.username || "";
      return name.toLowerCase().includes(search.toLowerCase()) ||
        l.track_name.toLowerCase().includes(search.toLowerCase()) ||
        l.car_name.toLowerCase().includes(search.toLowerCase());
    });
    if (filterTrack) result = result.filter((l: any) => l.track_name === filterTrack);
    if (filterSim) result = result.filter((l: any) => l.sim_name === filterSim);
    if (sortBy === "date") result.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else result.sort((a: any, b: any) => a.lap_time_ms - b.lap_time_ms);
    return result;
  }, [lapTimes, search, filterTrack, filterSim, sortBy, profiles]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-4">
              <Timer className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Lap Time Tracker</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
              Χρόνοι <span className="text-gradient-racing">Γύρου</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Κατέγραψε τους χρόνους σου και σύγκρινέ τους με τους υπόλοιπους!
            </p>
          </motion.div>

          {/* Actions & Filters */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
              {user && (
                <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
                  <Plus className="h-4 w-4" /> Πρόσθεσε Χρόνο
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Αναζήτηση..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-48" />
                </div>
                <select value={filterTrack} onChange={(e) => setFilterTrack(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
                  <option value="">Όλες οι πίστες</option>
                  {tracks.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filterSim} onChange={(e) => setFilterSim(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
                  <option value="">Όλα τα sims</option>
                  {sims.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === "time" ? "date" : "time")} className="gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" /> {sortBy === "time" ? "Χρόνος" : "Ημερομηνία"}
                </Button>
              </div>
            </div>
          </div>

          {/* Add form */}
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="max-w-lg mx-auto mb-10">
              <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4">
                <h3 className="font-display text-lg font-bold">Νέος Χρόνος Γύρου</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Πίστα *" value={form.track_name} onChange={(e) => setForm({ ...form, track_name: e.target.value })} />
                  <Input placeholder="Αυτοκίνητο *" value={form.car_name} onChange={(e) => setForm({ ...form, car_name: e.target.value })} />
                  <Input placeholder="Sim *" value={form.sim_name} onChange={(e) => setForm({ ...form, sim_name: e.target.value })} />
                  <Input placeholder="Χρόνος (1:23.456) *" value={form.lap_time} onChange={(e) => setForm({ ...form, lap_time: e.target.value })} />
                </div>
                <select
                  value={form.conditions}
                  onChange={(e) => setForm({ ...form, conditions: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground"
                >
                  <option value="dry">Dry</option>
                  <option value="wet">Wet</option>
                  <option value="mixed">Mixed</option>
                </select>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="YouTube URL (προαιρετικό)"
                    value={form.video_url}
                    onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAdd} className="flex-1">Καταχώρηση</Button>
                  <Button variant="outline" onClick={() => setShowAdd(false)}>Ακύρωση</Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Table */}
          {loading ? (
            <div className="text-center text-muted-foreground py-16">Φόρτωση...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Timer className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Δεν υπάρχουν χρόνοι ακόμα</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-card border-b border-border/50">
                      <th className="px-4 py-3 text-left font-display text-xs text-muted-foreground">#</th>
                      <th className="px-4 py-3 text-left font-display text-xs text-muted-foreground">Οδηγός</th>
                      <th className="px-4 py-3 text-left font-display text-xs text-muted-foreground">Πίστα</th>
                      <th className="px-4 py-3 text-left font-display text-xs text-muted-foreground">Αυτοκίνητο</th>
                      <th className="px-4 py-3 text-left font-display text-xs text-muted-foreground">Sim</th>
                      <th className="px-4 py-3 text-right font-display text-xs text-muted-foreground">Χρόνος</th>
                      <th className="px-4 py-3 text-center font-display text-xs text-muted-foreground">Συνθήκες</th>
                      <th className="px-4 py-3 text-center font-display text-xs text-muted-foreground">Video</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 100).map((lap: any, i: number) => {
                      const p = profiles[lap.user_id];
                      return (
                        <motion.tr
                          key={lap.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className={`font-display font-bold text-xs ${
                              i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-orange-400" : "text-muted-foreground"
                            }`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">{p?.display_name || p?.username || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{lap.track_name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{lap.car_name}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-primary/10 text-primary text-[10px] px-2 py-0.5">{lap.sim_name}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{formatLapTime(lap.lap_time_ms)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-[10px] rounded-full px-2 py-0.5 ${
                              lap.conditions === "wet" ? "bg-blue-500/20 text-blue-400" :
                              lap.conditions === "mixed" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-green-500/20 text-green-400"
                            }`}>
                              {lap.conditions}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {lap.video_url ? (
                              <a href={lap.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:text-primary/80">
                                <Youtube className="h-4 w-4" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-center text-muted-foreground text-xs mt-4">{filtered.length} χρόνοι</p>
            </div>
          )}
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default LapTimes;
