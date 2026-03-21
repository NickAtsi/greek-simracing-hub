import { useState, useEffect } from "react";
import { Trophy, Plus, Edit, Trash2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminBadges = () => {
  const { toast } = useToast();
  const [badges, setBadges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", icon: "🏆", description: "", requirement: "", category: "racing" });
  const [showAward, setShowAward] = useState(false);
  const [awardBadgeId, setAwardBadgeId] = useState("");
  const [awardUserId, setAwardUserId] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [{ data: b }, { data: u }, { data: ua }] = await Promise.all([
      supabase.from("achievement_badges").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, display_name, username"),
      supabase.from("user_achievements").select("*"),
    ]);
    setBadges((b as any[]) || []);
    setUsers((u as any[]) || []);
    setUserAchievements((ua as any[]) || []);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    const payload = { name: form.name, icon: form.icon, description: form.description || null, requirement: form.requirement || null, category: form.category };
    if (editing) {
      await supabase.from("achievement_badges").update(payload as any).eq("id", editing.id);
      toast({ title: "Badge ενημερώθηκε!" });
    } else {
      await supabase.from("achievement_badges").insert(payload as any);
      toast({ title: "Badge προστέθηκε!" });
    }
    setShowForm(false); setEditing(null); setForm({ name: "", icon: "🏆", description: "", requirement: "", category: "racing" });
    fetchAll();
  };

  const del = async (id: string) => {
    await supabase.from("achievement_badges").delete().eq("id", id);
    toast({ title: "Badge διαγράφηκε" }); fetchAll();
  };

  const awardBadge = async () => {
    if (!awardBadgeId || !awardUserId) return;
    const { error } = await supabase.from("user_achievements").insert({ badge_id: awardBadgeId, user_id: awardUserId } as any);
    if (error) { toast({ title: "Σφάλμα - ίσως έχει ήδη αυτό το badge", variant: "destructive" }); }
    else { toast({ title: "Badge απονεμήθηκε! 🏅" }); setShowAward(false); fetchAll(); }
  };

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({ name: b.name, icon: b.icon, description: b.description || "", requirement: b.requirement || "", category: b.category });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-black text-foreground">Achievement Badges ({badges.length})</h1>
          <p className="text-sm text-muted-foreground">Διαχείριση badges και απονομή σε χρήστες.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setShowAward(true); }} variant="outline" className="gap-2"><Award className="h-4 w-4" /> Απονομή</Button>
          <Button onClick={() => { setEditing(null); setForm({ name: "", icon: "🏆", description: "", requirement: "", category: "racing" }); setShowForm(true); }} className="gap-2"><Plus className="h-4 w-4" /> Νέο Badge</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((b: any) => {
          const awarded = userAchievements.filter((ua: any) => ua.badge_id === b.id).length;
          return (
            <div key={b.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{b.icon}</span>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-foreground text-sm">{b.name}</h3>
                  <span className="text-[10px] rounded-full bg-primary/10 text-primary px-2 py-0.5">{b.category}</span>
                </div>
              </div>
              {b.description && <p className="text-xs text-muted-foreground mb-2">{b.description}</p>}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">{awarded} απονομές</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(b)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => del(b.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Form */}
      <Dialog open={showForm} onOpenChange={v => { setShowForm(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader><DialogTitle className="font-display text-foreground">{editing ? "Επεξεργασία Badge" : "Νέο Badge"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <Input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="w-16 text-center text-2xl bg-secondary/50" />
              <Input placeholder="Όνομα *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-secondary/50" />
            </div>
            <Textarea placeholder="Περιγραφή" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="bg-secondary/50" />
            <Input placeholder="Απαίτηση (π.χ. 10 νίκες)" value={form.requirement} onChange={e => setForm({ ...form, requirement: e.target.value })} className="bg-secondary/50" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground">
              <option value="racing">Racing</option>
              <option value="community">Community</option>
              <option value="special">Special</option>
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Ακύρωση</Button>
              <Button onClick={save}>{editing ? "Ενημέρωση" : "Δημιουργία"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Award Dialog */}
      <Dialog open={showAward} onOpenChange={setShowAward}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader><DialogTitle className="font-display text-foreground">Απονομή Badge</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select value={awardBadgeId} onChange={e => setAwardBadgeId(e.target.value)} className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground">
              <option value="">Επίλεξε Badge...</option>
              {badges.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
            </select>
            <select value={awardUserId} onChange={e => setAwardUserId(e.target.value)} className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground">
              <option value="">Επίλεξε Χρήστη...</option>
              {users.map(u => <option key={u.user_id} value={u.user_id}>{u.display_name || u.username || u.user_id}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAward(false)}>Ακύρωση</Button>
              <Button onClick={awardBadge} disabled={!awardBadgeId || !awardUserId}>Απονομή 🏅</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBadges;
