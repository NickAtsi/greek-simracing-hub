import { useState, useEffect } from "react";
import { Target, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminPredictions = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", deadline: "", event_date: "", status: "open" });

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase.from("prediction_events" as any).select("*").order("created_at", { ascending: false });
    setEvents((data as any[]) || []);
  };

  const save = async () => {
    if (!form.title.trim() || !form.deadline) return;
    const payload = {
      title: form.title, description: form.description || null,
      deadline: form.deadline, event_date: form.event_date || null, status: form.status,
    };
    if (editing) {
      await supabase.from("prediction_events" as any).update(payload as any).eq("id", editing.id);
      toast({ title: "Event ενημερώθηκε!" });
    } else {
      await supabase.from("prediction_events" as any).insert(payload as any);
      toast({ title: "Event προστέθηκε!" });
    }
    setShowForm(false); setEditing(null); fetch();
  };

  const del = async (id: string) => {
    await supabase.from("prediction_events" as any).delete().eq("id", id);
    toast({ title: "Event διαγράφηκε" }); fetch();
  };

  const openEdit = (e: any) => {
    setEditing(e);
    setForm({ title: e.title, description: e.description || "", deadline: e.deadline?.slice(0, 16) || "", event_date: e.event_date?.slice(0, 16) || "", status: e.status });
    setShowForm(true);
  };

  const statusColors: Record<string, string> = { open: "bg-green-500/20 text-green-400", closed: "bg-red-500/20 text-red-400", resolved: "bg-blue-500/20 text-blue-400" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-black text-foreground">Predictions ({events.length})</h1>
          <p className="text-sm text-muted-foreground">Διαχείριση prediction events.</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ title: "", description: "", deadline: "", event_date: "", status: "open" }); setShowForm(true); }} className="gap-2"><Plus className="h-4 w-4" /> Νέο Event</Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-secondary/30 border-b border-border">
            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-display">Τίτλος</th>
            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-display">Κατάσταση</th>
            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-display">Deadline</th>
            <th className="text-right px-4 py-3 text-xs text-muted-foreground font-display">Ενέργειες</th>
          </tr></thead>
          <tbody>
            {events.map((e: any) => (
              <tr key={e.id} className="border-b border-border/50 hover:bg-secondary/10">
                <td className="px-4 py-3 font-medium text-foreground">{e.title}</td>
                <td className="px-4 py-3"><span className={`text-[10px] rounded-full px-2 py-0.5 ${statusColors[e.status] || ""}`}>{e.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{e.deadline ? new Date(e.deadline).toLocaleString("el-GR") : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(e)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => del(e.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showForm} onOpenChange={v => { setShowForm(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader><DialogTitle className="font-display text-foreground">{editing ? "Επεξεργασία Event" : "Νέο Event"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Τίτλος *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-secondary/50" />
            <Textarea placeholder="Περιγραφή" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="bg-secondary/50" />
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Deadline *</label><Input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="bg-secondary/50" /></div>
              <div><label className="text-xs text-muted-foreground">Ημ/νία Event</label><Input type="datetime-local" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} className="bg-secondary/50" /></div>
            </div>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground">
              <option value="open">Open</option><option value="closed">Closed</option><option value="resolved">Resolved</option>
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Ακύρωση</Button>
              <Button onClick={save}>{editing ? "Ενημέρωση" : "Δημιουργία"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPredictions;
