import { useState, useEffect } from "react";
import { Timer, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const formatLapTime = (ms: number) => {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const milli = ms % 1000;
  return `${min}:${String(sec).padStart(2, "0")}.${String(milli).padStart(3, "0")}`;
};

const AdminLapTimes = () => {
  const { toast } = useToast();
  const [laps, setLaps] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase.from("lap_times" as any).select("*").order("created_at", { ascending: false });
    const list = (data as any[]) || [];
    setLaps(list);
    const ids = [...new Set(list.map((l: any) => l.user_id))];
    if (ids.length > 0) {
      const { data: p } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", ids);
      const map: Record<string, any> = {};
      ((p as any[]) || []).forEach((pr: any) => { map[pr.user_id] = pr; });
      setProfiles(map);
    }
  };

  const toggleVerify = async (id: string, current: boolean) => {
    await supabase.from("lap_times" as any).update({ verified: !current } as any).eq("id", id);
    toast({ title: current ? "Verification αφαιρέθηκε" : "Χρόνος επιβεβαιώθηκε! ✅" }); fetch();
  };

  const del = async (id: string) => {
    await supabase.from("lap_times" as any).delete().eq("id", id);
    toast({ title: "Χρόνος διαγράφηκε" }); fetch();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-black text-foreground">Lap Times ({laps.length})</h1>
        <p className="text-sm text-muted-foreground">Verify ή διαγραφή χρόνων γύρου.</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-secondary/30 border-b border-border">
            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-display">Οδηγός</th>
            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-display">Πίστα</th>
            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-display">Αυτοκίνητο</th>
            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-display">Sim</th>
            <th className="text-right px-4 py-3 text-xs text-muted-foreground font-display">Χρόνος</th>
            <th className="text-center px-4 py-3 text-xs text-muted-foreground font-display">Verified</th>
            <th className="text-right px-4 py-3 text-xs text-muted-foreground font-display">Ενέργειες</th>
          </tr></thead>
          <tbody>
            {laps.slice(0, 100).map((l: any) => {
              const p = profiles[l.user_id];
              return (
                <tr key={l.id} className="border-b border-border/50 hover:bg-secondary/10">
                  <td className="px-4 py-3 font-medium text-foreground text-xs">{p?.display_name || p?.username || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{l.track_name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{l.car_name}</td>
                  <td className="px-4 py-3"><span className="text-[10px] rounded-full bg-primary/10 text-primary px-2 py-0.5">{l.sim_name}</span></td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-foreground text-xs">{formatLapTime(l.lap_time_ms)}</td>
                  <td className="px-4 py-3 text-center">
                    {l.verified ? <Check className="h-4 w-4 text-green-400 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => toggleVerify(l.id, l.verified)}>{l.verified ? "Unverify" : "Verify"}</Button>
                    <Button size="sm" variant="ghost" onClick={() => del(l.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLapTimes;
