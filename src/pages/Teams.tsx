import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Crown, Shield, User, Edit, Upload, UserPlus, X, Check } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Teams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", tag: "", description: "" });
  const [editTeam, setEditTeam] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", tag: "", description: "" });
  const [showManage, setShowManage] = useState<any>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: t }, { data: m }, { data: ap }] = await Promise.all([
      supabase.from("teams" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("team_members" as any).select("*"),
      supabase.from("profiles").select("user_id, display_name, username, avatar_url"),
    ]);
    const teamsList = (t as any[]) || [];
    const membersList = (m as any[]) || [];
    const allP = (ap as any[]) || [];
    setTeams(teamsList);
    setMembers(membersList);
    setAllProfiles(allP);

    const pMap: Record<string, any> = {};
    allP.forEach((pr: any) => { pMap[pr.user_id] = pr; });
    setProfiles(pMap);
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
      await supabase.from("team_members" as any).insert({
        team_id: (data as any).id, user_id: user.id, role: "owner",
      } as any);
      toast({ title: "Η ομάδα δημιουργήθηκε! 🏎️" });
      setForm({ name: "", tag: "", description: "" });
      setShowCreate(false);
      fetchData();
    }
  };

  const handleEditSave = async () => {
    if (!editTeam) return;
    await supabase.from("teams" as any).update({
      name: editForm.name.trim(),
      tag: editForm.tag.trim() || null,
      description: editForm.description.trim() || null,
    } as any).eq("id", editTeam.id);
    toast({ title: "Ομάδα ενημερώθηκε!" });
    setEditTeam(null);
    fetchData();
  };

  const handleLogoUpload = async (teamId: string, file: File) => {
    setUploadingLogo(true);
    const ext = file.name.split(".").pop();
    const path = `teams/${teamId}/logo.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Σφάλμα upload", variant: "destructive" }); setUploadingLogo(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("teams" as any).update({ logo_url: publicUrl } as any).eq("id", teamId);
    toast({ title: "Logo ανέβηκε! ✅" });
    setUploadingLogo(false);
    fetchData();
  };

  const addMember = async (teamId: string, userId: string) => {
    const exists = members.find((m: any) => m.team_id === teamId && m.user_id === userId);
    if (exists) { toast({ title: "Ήδη μέλος", variant: "destructive" }); return; }
    await supabase.from("team_members" as any).insert({ team_id: teamId, user_id: userId, role: "member" } as any);
    toast({ title: "Μέλος προστέθηκε!" });
    fetchData();
  };

  const removeMember = async (memberId: string) => {
    await supabase.from("team_members" as any).delete().eq("id", memberId);
    toast({ title: "Μέλος αφαιρέθηκε" });
    fetchData();
  };

  const getTeamMembers = (teamId: string) => members.filter((m: any) => m.team_id === teamId);
  const isOwner = (team: any) => user && team.owner_id === user.id;

  const filteredProfiles = memberSearch
    ? allProfiles.filter((p: any) => (p.display_name || p.username || "").toLowerCase().includes(memberSearch.toLowerCase()))
    : [];

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
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative group">
                          <div className="w-12 h-12 rounded-xl bg-card border-2 border-border flex items-center justify-center text-2xl overflow-hidden">
                            {team.logo_url ? (
                              <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                            ) : "🏎️"}
                          </div>
                          {isOwner(team) && (
                            <button
                              className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file"; input.accept = "image/*";
                                input.onchange = (e: any) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(team.id, f); };
                                input.click();
                              }}
                            >
                              <Upload className="h-4 w-4 text-white" />
                            </button>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-foreground text-lg">{team.name}</h3>
                          {team.description && <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{team.description}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                            <Avatar key={m.id} className="w-7 h-7 border-2 border-card">
                              <AvatarImage src={p?.avatar_url || ""} />
                              <AvatarFallback className="bg-muted text-[10px] font-bold text-muted-foreground">
                                {p?.display_name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                          );
                        })}
                        {tmembers.length > 5 && (
                          <div className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] font-bold text-primary">
                            +{tmembers.length - 5}
                          </div>
                        )}
                      </div>

                      {/* Owner actions */}
                      {isOwner(team) && (
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => {
                            setEditTeam(team);
                            setEditForm({ name: team.name, tag: team.tag || "", description: team.description || "" });
                          }}>
                            <Edit className="h-3 w-3" /> Επεξεργασία
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => { setShowManage(team); setMemberSearch(""); }}>
                            <UserPlus className="h-3 w-3" /> Μέλη
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Edit Team Dialog */}
        <Dialog open={!!editTeam} onOpenChange={v => { if (!v) setEditTeam(null); }}>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader><DialogTitle className="font-display text-foreground">Επεξεργασία Ομάδας</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Όνομα *" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="bg-secondary/50" />
              <Input placeholder="Tag" value={editForm.tag} onChange={e => setEditForm({ ...editForm, tag: e.target.value })} className="bg-secondary/50" />
              <Textarea placeholder="Περιγραφή" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="bg-secondary/50" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditTeam(null)}>Ακύρωση</Button>
                <Button onClick={handleEditSave}>Αποθήκευση</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Manage Members Dialog */}
        <Dialog open={!!showManage} onOpenChange={v => { if (!v) setShowManage(null); }}>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader><DialogTitle className="font-display text-foreground">Διαχείριση Μελών — {showManage?.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {/* Current members */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Τρέχοντα Μέλη</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {showManage && getTeamMembers(showManage.id).map((m: any) => {
                    const p = profiles[m.user_id];
                    return (
                      <div key={m.id} className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={p?.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/20 text-primary text-[10px]">{(p?.display_name || "?")[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-foreground flex-1">{p?.display_name || p?.username || "—"}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">{m.role}</span>
                        {m.role !== "owner" && (
                          <Button size="sm" variant="ghost" onClick={() => removeMember(m.id)} className="h-6 w-6 p-0 text-destructive">
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add member */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Πρόσθεσε Μέλος</h4>
                <Input placeholder="Αναζήτηση χρήστη..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="bg-secondary/50 mb-2" />
                {memberSearch && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filteredProfiles.slice(0, 10).map((p: any) => {
                      const alreadyMember = showManage && members.some((m: any) => m.team_id === showManage.id && m.user_id === p.user_id);
                      return (
                        <div key={p.user_id} className="flex items-center gap-2 rounded-lg bg-secondary/20 p-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={p.avatar_url || ""} />
                            <AvatarFallback className="bg-primary/20 text-primary text-[9px]">{(p.display_name || "?")[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-foreground flex-1">{p.display_name || p.username}</span>
                          {alreadyMember ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => showManage && addMember(showManage.id, p.user_id)} className="h-6 px-2 text-xs text-primary">
                              <UserPlus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Footer />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Teams;
