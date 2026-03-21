import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Vote, Star, Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getCurrentMonthYear = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthYear = (my: string) => {
  const [y, m] = my.split("-");
  const months = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
  return `${months[parseInt(m) - 1]} ${y}`;
};

const shiftMonth = (my: string, delta: number) => {
  const [y, m] = my.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const DriverOfTheMonth = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear());
  const [nominations, setNominations] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [showNominate, setShowNominate] = useState(false);
  const [nomForm, setNomForm] = useState({ driver_user_id: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  const fetchData = async () => {
    setLoading(true);
    const [{ data: noms }, { data: vts }, { data: profs }] = await Promise.all([
      supabase.from("driver_of_month_nominations" as any).select("*").eq("month_year", monthYear).order("created_at"),
      supabase.from("driver_of_month_votes" as any).select("*").eq("month_year", monthYear),
      supabase.from("profiles").select("user_id, display_name, username, avatar_url").eq("is_approved", true),
    ]);
    setNominations((noms as any[]) || []);
    setVotes((vts as any[]) || []);
    setMembersList((profs as any[]) || []);
    
    const pMap: Record<string, any> = {};
    ((profs as any[]) || []).forEach((p: any) => { pMap[p.user_id] = p; });
    setProfiles(pMap);

    if (user) {
      const uv = (vts as any[])?.find((v: any) => v.user_id === user.id);
      setUserVote(uv?.nomination_id || null);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [monthYear, user]);

  const voteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    votes.forEach((v: any) => { counts[v.nomination_id] = (counts[v.nomination_id] || 0) + 1; });
    return counts;
  }, [votes]);

  const sorted = useMemo(() =>
    [...nominations].sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0)),
  [nominations, voteCounts]);

  const filteredMembers = useMemo(() => {
    if (!memberSearch) return [];
    return membersList.filter((m: any) =>
      (m.display_name || m.username || "").toLowerCase().includes(memberSearch.toLowerCase())
    ).slice(0, 8);
  }, [memberSearch, membersList]);

  const handleNominate = async () => {
    if (!user) { toast({ title: "Πρέπει να συνδεθείς", variant: "destructive" }); return; }
    if (!nomForm.driver_user_id) { toast({ title: "Επίλεξε οδηγό", variant: "destructive" }); return; }
    
    const selectedProfile = profiles[nomForm.driver_user_id];
    const driverName = selectedProfile?.display_name || selectedProfile?.username || "Unknown";
    
    const { error } = await supabase.from("driver_of_month_nominations" as any).insert({
      month_year: monthYear,
      driver_name: driverName,
      driver_user_id: nomForm.driver_user_id,
      nominated_by: user.id,
      reason: nomForm.reason.trim() || null,
    } as any);
    if (error) {
      toast({ title: "Σφάλμα - ίσως υπάρχει ήδη υποψηφιότητα", variant: "destructive" });
    } else {
      toast({ title: "Υποψηφιότητα καταχωρήθηκε! 🏁" });
      setNomForm({ driver_user_id: "", reason: "" });
      setMemberSearch("");
      setShowNominate(false);
      fetchData();
    }
  };

  const handleVote = async (nominationId: string) => {
    if (!user) { toast({ title: "Πρέπει να συνδεθείς", variant: "destructive" }); return; }
    if (userVote) {
      await supabase.from("driver_of_month_votes" as any).delete().eq("user_id", user.id).eq("month_year", monthYear);
    }
    if (userVote === nominationId) { setUserVote(null); fetchData(); return; }
    const { error } = await supabase.from("driver_of_month_votes" as any).insert({
      nomination_id: nominationId, user_id: user.id, month_year: monthYear,
    } as any);
    if (error) { toast({ title: "Σφάλμα ψήφου", variant: "destructive" }); }
    else { setUserVote(nominationId); fetchData(); }
  };

  const isCurrentMonth = monthYear === getCurrentMonthYear();
  const maxVotes = Math.max(...Object.values(voteCounts), 1);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-4">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Driver of the Month</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
              Οδηγός <span className="text-gradient-racing">του Μήνα</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Ψήφισε τον καλύτερο οδηγό κάθε μήνα! Υπόψηφίασε τον αγαπημένο σου και δώσε την ψήφο σου.
            </p>
          </motion.div>

          {/* Month selector */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <Button variant="ghost" size="icon" onClick={() => setMonthYear(shiftMonth(monthYear, -1))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-6 py-3">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-display text-lg font-bold">{formatMonthYear(monthYear)}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMonthYear(shiftMonth(monthYear, 1))} disabled={isCurrentMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Actions */}
          {isCurrentMonth && user && (
            <div className="flex justify-center mb-8">
              <Button onClick={() => setShowNominate(!showNominate)} className="bg-gradient-greek text-primary-foreground">
                <Star className="h-4 w-4 mr-2" /> Υποψηφίασε Οδηγό
              </Button>
            </div>
          )}

          {/* Nomination form - using members */}
          {showNominate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="max-w-md mx-auto mb-10">
              <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4">
                <h3 className="font-display text-lg font-bold">Νέα Υποψηφιότητα</h3>
                
                {/* Member search */}
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Αναζήτηση μέλους..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {nomForm.driver_user_id && (
                    <div className="flex items-center gap-2 mt-2 rounded-lg bg-primary/10 p-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={profiles[nomForm.driver_user_id]?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/20 text-primary text-[9px]">
                          {(profiles[nomForm.driver_user_id]?.display_name || "?")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground flex-1">
                        {profiles[nomForm.driver_user_id]?.display_name || profiles[nomForm.driver_user_id]?.username}
                      </span>
                      <button onClick={() => setNomForm({ ...nomForm, driver_user_id: "" })} className="text-muted-foreground hover:text-destructive">✕</button>
                    </div>
                  )}
                  {memberSearch && !nomForm.driver_user_id && (
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto rounded-lg border border-border bg-card">
                      {filteredMembers.map((m: any) => (
                        <button
                          key={m.user_id}
                          onClick={() => { setNomForm({ ...nomForm, driver_user_id: m.user_id }); setMemberSearch(""); }}
                          className="w-full flex items-center gap-2 p-2 hover:bg-secondary/50 transition-colors text-left"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={m.avatar_url || ""} />
                            <AvatarFallback className="bg-primary/20 text-primary text-[9px]">{(m.display_name || "?")[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-foreground">{m.display_name || m.username}</span>
                        </button>
                      ))}
                      {filteredMembers.length === 0 && <p className="text-xs text-muted-foreground p-2 text-center">Δεν βρέθηκαν μέλη</p>}
                    </div>
                  )}
                </div>

                <Textarea
                  placeholder="Γιατί αξίζει; (προαιρετικό)"
                  value={nomForm.reason}
                  onChange={(e) => setNomForm({ ...nomForm, reason: e.target.value })}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={handleNominate} className="flex-1" disabled={!nomForm.driver_user_id}>Υποβολή</Button>
                  <Button variant="outline" onClick={() => setShowNominate(false)}>Ακύρωση</Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {loading ? (
            <div className="text-center text-muted-foreground py-16">Φόρτωση...</div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Δεν υπάρχουν υποψηφιότητες ακόμα</p>
              {isCurrentMonth && <p className="text-muted-foreground/60 text-sm mt-2">Γίνε ο πρώτος που θα υποψηφιάσει!</p>}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {sorted.map((nom: any, i: number) => {
                const count = voteCounts[nom.id] || 0;
                const pct = maxVotes > 0 ? (count / maxVotes) * 100 : 0;
                const isWinner = i === 0 && count > 0;
                const isVoted = userVote === nom.id;
                const nomProfile = nom.driver_user_id ? profiles[nom.driver_user_id] : null;

                return (
                  <motion.div
                    key={nom.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-xl border bg-card p-5 transition-all ${
                      isWinner ? "border-primary/50 shadow-racing" : "border-border/60"
                    } ${isVoted ? "ring-2 ring-primary/40" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-display font-bold text-sm ${
                        i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                        i === 1 ? "bg-gray-300/20 text-gray-400" :
                        i === 2 ? "bg-orange-500/20 text-orange-400" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </div>
                      
                      {nomProfile && (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={nomProfile.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/20 text-primary font-bold">
                            {(nomProfile.display_name || "?")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-foreground truncate">{nom.driver_name}</h3>
                        {nom.reason && <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{nom.reason}</p>}
                        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className={`h-full rounded-full ${isWinner ? "bg-gradient-greek" : "bg-primary/60"}`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground">{count} {count === 1 ? "ψήφος" : "ψήφοι"}</span>
                        {isCurrentMonth && user && (
                          <Button
                            size="sm"
                            variant={isVoted ? "default" : "outline"}
                            onClick={() => handleVote(nom.id)}
                            className={isVoted ? "bg-primary" : ""}
                          >
                            <Vote className="h-3.5 w-3.5 mr-1" />
                            {isVoted ? "Ψηφίστηκε" : "Ψήφισε"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {votes.length > 0 && (
            <p className="text-center text-muted-foreground text-sm mt-8">
              Σύνολο ψήφων: <span className="font-bold text-foreground">{votes.length}</span>
            </p>
          )}
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default DriverOfTheMonth;
