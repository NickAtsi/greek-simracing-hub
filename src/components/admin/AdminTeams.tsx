import { useState, useEffect } from "react";
import { Users, Trash2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminTeams = () => {
  const { toast } = useToast();
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const [{ data: t }, { data: m }] = await Promise.all([
      supabase.from("teams" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("team_members" as any).select("*"),
    ]);
    const teamsList = (t as any[]) || [];
    const membersList = (m as any[]) || [];
    setTeams(teamsList);
    setMembers(membersList);
    const ids = new Set([...teamsList.map((tm: any) => tm.owner_id), ...membersList.map((mm: any) => mm.user_id)]);
    if (ids.size > 0) {
      const { data: p } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", [...ids]);
      const map: Record<string, any> = {};
      ((p as any[]) || []).forEach((pr: any) => { map[pr.user_id] = pr; });
      setProfiles(map);
    }
  };

  const deleteTeam = async (id: string) => {
    await supabase.from("team_members" as any).delete().eq("team_id", id);
    await supabase.from("teams" as any).delete().eq("id", id);
    toast({ title: "Ομάδα διαγράφηκε" }); fetch();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-black text-foreground">Ομάδες ({teams.length})</h1>
        <p className="text-sm text-muted-foreground">Διαχείριση ομάδων SimRacing.</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-secondary/30 border-b border-border">
            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-display">Ομάδα</th>
            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-display">Owner</th>
            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-display">Μέλη</th>
            <th className="text-left px-4 py-3 text-xs text-muted-foreground font-display">Ημ/νία</th>
            <th className="text-right px-4 py-3 text-xs text-muted-foreground font-display">Ενέργειες</th>
          </tr></thead>
          <tbody>
            {teams.map((t: any) => {
              const owner = profiles[t.owner_id];
              const count = members.filter((m: any) => m.team_id === t.id).length;
              return (
                <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{t.name}</span>
                      {t.tag && <span className="text-[10px] rounded bg-primary/10 text-primary px-1.5">[{t.tag}]</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs flex items-center gap-1"><Crown className="h-3 w-3 text-yellow-400" />{owner?.display_name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{count}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(t.created_at).toLocaleDateString("el-GR")}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => deleteTeam(t.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
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

export default AdminTeams;
