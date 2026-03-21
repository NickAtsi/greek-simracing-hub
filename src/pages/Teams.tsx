import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Crown, Shield, User, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
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

const roleIcons: Record<string, any> = { owner: Crown, captain: Shield, member: User };
const roleLabels: Record<string, string> = { owner: "Owner", captain: "Captain", member: "Member" };

const Teams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", tag: "", description: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: t } = await supabase.from("teams" as any).select("*").order("created_at", { ascending: false });
    const teamsList = (t as any[]) || [];
    setTeams(teamsList);

    const { data: m } = await supabase.from("team_members" as any).select("*");
    const membersList = (m as any[]) || [];
    setMembers(membersList);

    // Fetch profiles for team owners and members
    const allUserIds = new Set([
      ...teamsList.map((tm: any) => tm.owner_id),
      ...membersList.map((mm: any) => mm.user_id),
    ]);
    if (allUserIds.size > 0) {
      const { data: p } = await supabase.from("profiles").select("user_id, display_name, username, avatar_url").in("user_id", [...allUserIds]);
      const pMap: Record<string, any> = {};
      ((p as any[]) || []).forEach((pr: any) => { pMap[pr.user_id] = pr; });
      setProfiles(pMap);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user) { toast({ title: "Πρέπει να συνδεθείς", variant: "destructive" }); return; }
    if (!form.name.trim()) { toast({ title: "Συμπλήρωσε το όνομα", variant: "destructive" }); return; }

    const { data, error } = await supabase.from("teams" as any).insert({
      name: form.name.trim(),
      tag: form.tag.trim() || null,
      description: form.description.trim() || null,
      owner_id: user.id,
    } as any).select().single();

    if (error) {
      toast({ title: "Σφάλμα δημιουργίας", variant: "destructive" });
    } else {
      // Add owner as member
      await supabase.from("team_members" as any).insert({
        team_id: (data as any).id,
        user_id: user.id,
        role: "owner",
      } as any);
      toast({ title: "Η ομάδα δημιουργήθηκε! 🏎️" });
      setForm({ name: "", tag: "", description: "" });
      setShowCreate(false);
      fetchData();
    }
  };

  const getTeamMembers = (teamId: string) => members.filter((m: any) => m.team_id === teamId);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-4">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Racing Teams</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
              Ομάδες <span className="text-gradient-racing">SimRacing</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Δημιούργησε ή βρες την ομάδα σου. Αγωνίσου μαζί με φίλους!
            </p>
          </motion.div>

          {user && (
            <div className="flex justify-center mb-8">
              <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
                <Plus className="h-4 w-4" /> Δημιούργησε Ομάδα
              </Button>
            </div>
          )}

          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="max-w-md mx-auto mb-10">
              <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4">
                <h3 className="font-display text-lg font-bold">Νέα Ομάδα</h3>
                <Input placeholder="Όνομα ομάδας *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Tag (π.χ. GSR)" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
                <Textarea placeholder="Περιγραφή (προαιρετικό)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                <div className="flex gap-2">
                  <Button onClick={handleCreate} className="flex-1">Δημιουργία</Button>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Ακύρωση</Button>
                </div>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="text-center text-muted-foreground py-16">Φόρτωση...</div>
          ) : teams.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Δεν υπάρχουν ομάδες ακόμα</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {teams.map((team: any, i: number) => {
                const tmembers = getTeamMembers(team.id);
                const owner = profiles[team.owner_id];
                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-border/60 bg-card overflow-hidden hover:border-primary/40 transition-colors"
                  >
                    {/* Header */}
                    <div className="h-20 bg-gradient-greek relative">
                      {team.tag && (
                        <span className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground font-display font-bold text-xs px-2 py-1 rounded">
                          [{team.tag}]
                        </span>
                      )}
                    </div>
                    <div className="p-5 -mt-6">
                      <div className="w-12 h-12 rounded-xl bg-card border-2 border-border flex items-center justify-center text-2xl mb-3">
                        🏎️
                      </div>
                      <h3 className="font-display font-bold text-foreground text-lg">{team.name}</h3>
                      {team.description && <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{team.description}</p>}

                      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>{tmembers.length} μέλη</span>
                        {owner && (
                          <>
                            <span className="mx-1">·</span>
                            <Crown className="h-3 w-3 text-yellow-400" />
                            <span>{owner.display_name || owner.username}</span>
                          </>
                        )}
                      </div>

                      {/* Members preview */}
                      <div className="mt-3 flex -space-x-2">
                        {tmembers.slice(0, 5).map((m: any) => {
                          const p = profiles[m.user_id];
                          return (
                            <div key={m.id} className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold text-muted-foreground" title={p?.display_name || "Member"}>
                              {p?.display_name?.charAt(0) || "?"}
                            </div>
                          );
                        })}
                        {tmembers.length > 5 && (
                          <div className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] font-bold text-primary">
                            +{tmembers.length - 5}
                          </div>
                        )}
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

export default Teams;
