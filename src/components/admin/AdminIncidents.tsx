import { useState, useEffect } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminIncidents = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase.from("incident_reports" as any).select("*").order("created_at", { ascending: false });
    const list = (data as any[]) || [];
    setReports(list);
    const ids = [...new Set(list.map((r: any) => r.reporter_id))];
    if (ids.length > 0) {
      const { data: p } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", ids);
      const map: Record<string, any> = {};
      ((p as any[]) || []).forEach((pr: any) => { map[pr.user_id] = pr; });
      setProfiles(map);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("incident_reports" as any).update({ status } as any).eq("id", id);
    toast({ title: "Κατάσταση ενημερώθηκε" }); fetch();
  };

  const updateNotes = async (id: string, notes: string) => {
    await supabase.from("incident_reports" as any).update({ admin_notes: notes } as any).eq("id", id);
    toast({ title: "Σημειώσεις αποθηκεύτηκαν" });
  };

  const statusColors: Record<string, string> = { pending: "bg-amber-500/20 text-amber-400", reviewing: "bg-blue-500/20 text-blue-400", resolved: "bg-green-500/20 text-green-400", dismissed: "bg-red-500/20 text-red-400" };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-black text-foreground">Incident Reports ({reports.length})</h1>
        <p className="text-sm text-muted-foreground">Διαχείριση αναφορών συμβάντων.</p>
      </div>

      <div className="space-y-4">
        {reports.map((r: any) => {
          const reporter = profiles[r.reporter_id];
          return (
            <div key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="font-display font-bold text-foreground text-sm">{r.race_name || "Αναφορά"}</span>
                    <span className={`text-[10px] rounded-full px-2 py-0.5 ${statusColors[r.status] || ""}`}>{r.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Από: {reporter?.display_name || reporter?.username || "—"} · {new Date(r.created_at).toLocaleDateString("el-GR")}</p>
                </div>
                <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)} className="rounded-md border border-border bg-secondary/50 px-2 py-1 text-xs text-foreground">
                  <option value="pending">Pending</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option>
                </select>
              </div>
              <p className="text-sm text-foreground mb-2">{r.description}</p>
              {r.drivers_involved?.length > 0 && (
                <p className="text-xs text-muted-foreground mb-2">Εμπλεκόμενοι: {r.drivers_involved.join(", ")}</p>
              )}
              {r.video_url && (
                <a href={r.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-2">
                  <ExternalLink className="h-3 w-3" /> Video
                </a>
              )}
              <div className="mt-3">
                <label className="text-xs text-muted-foreground mb-1 block">Admin Notes</label>
                <Textarea
                  defaultValue={r.admin_notes || ""}
                  onBlur={e => updateNotes(r.id, e.target.value)}
                  rows={2}
                  className="bg-secondary/50 text-xs"
                  placeholder="Σημειώσεις admin..."
                />
              </div>
            </div>
          );
        })}
        {reports.length === 0 && <p className="text-center text-muted-foreground py-8">Δεν υπάρχουν αναφορές.</p>}
      </div>
    </div>
  );
};

export default AdminIncidents;
