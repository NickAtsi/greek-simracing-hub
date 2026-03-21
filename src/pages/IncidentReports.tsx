import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Video, Send, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
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

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Σε αναμονή", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  reviewing: { label: "Σε εξέταση", color: "bg-blue-500/20 text-blue-400", icon: Eye },
  resolved: { label: "Επιλύθηκε", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  dismissed: { label: "Απορρίφθηκε", color: "bg-red-500/20 text-red-400", icon: XCircle },
};

const IncidentReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    championship_id: "",
    race_name: "",
    description: "",
    video_url: "",
    drivers_involved: "",
  });

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    setLoading(true);
    if (user) {
      const { data } = await supabase.from("incident_reports" as any).select("*").eq("reporter_id", user.id).order("created_at", { ascending: false });
      setReports((data as any[]) || []);
    }
    const { data: ch } = await supabase.from("championships" as any).select("id, title").order("title");
    setChampionships((ch as any[]) || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) { toast({ title: "Πρέπει να συνδεθείς", variant: "destructive" }); return; }
    if (!form.description.trim()) { toast({ title: "Συμπλήρωσε την περιγραφή", variant: "destructive" }); return; }

    const { error } = await supabase.from("incident_reports" as any).insert({
      reporter_id: user.id,
      championship_id: form.championship_id || null,
      race_name: form.race_name.trim() || null,
      description: form.description.trim(),
      video_url: form.video_url.trim() || null,
      drivers_involved: form.drivers_involved ? form.drivers_involved.split(",").map((d) => d.trim()).filter(Boolean) : null,
    } as any);

    if (error) {
      toast({ title: "Σφάλμα αποστολής", variant: "destructive" });
    } else {
      toast({ title: "Η αναφορά υποβλήθηκε! ⚠️" });
      setForm({ championship_id: "", race_name: "", description: "", video_url: "", drivers_involved: "" });
      setShowForm(false);
      fetchData();
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-1.5 mb-4">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Incident Reports</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
              Αναφορά <span className="text-gradient-racing">Περιστατικού</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Ανέφερε περιστατικά αγώνων με video clips για αξιολόγηση από τους διαχειριστές.
            </p>
          </motion.div>

          {!user ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Πρέπει να συνδεθείς για να υποβάλεις αναφορά.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-8">
                <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {showForm ? "Κλείσιμο φόρμας" : "Νέα Αναφορά"}
                </Button>
              </div>

              {showForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="max-w-lg mx-auto mb-10">
                  <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4">
                    <h3 className="font-display text-lg font-bold">Φόρμα Αναφοράς</h3>
                    <select
                      value={form.championship_id}
                      onChange={(e) => setForm({ ...form, championship_id: e.target.value })}
                      className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground"
                    >
                      <option value="">Επιλογή πρωταθλήματος (προαιρετικό)</option>
                      {championships.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    <Input placeholder="Όνομα αγώνα" value={form.race_name} onChange={(e) => setForm({ ...form, race_name: e.target.value })} />
                    <Textarea placeholder="Περιγραφή περιστατικού *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
                    <Input placeholder="Εμπλεκόμενοι οδηγοί (χωρισμένοι με κόμμα)" value={form.drivers_involved} onChange={(e) => setForm({ ...form, drivers_involved: e.target.value })} />
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Video URL (YouTube, Streamable, κ.λπ.)" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSubmit} className="flex-1 gap-2"><Send className="h-4 w-4" /> Υποβολή</Button>
                      <Button variant="outline" onClick={() => setShowForm(false)}>Ακύρωση</Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* My reports */}
              <h2 className="font-display text-xl font-bold text-foreground mb-4 text-center">Οι αναφορές μου</h2>
              {loading ? (
                <div className="text-center text-muted-foreground py-8">Φόρτωση...</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Δεν έχεις υποβάλει αναφορές ακόμα</p>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-4">
                  {reports.map((r: any, i: number) => {
                    const sc = statusConfig[r.status];
                    const Icon = sc.icon;
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl border border-border/60 bg-card p-5"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.color}`}>
                              <Icon className="h-3 w-3" /> {sc.label}
                            </span>
                            {r.race_name && <span className="text-xs text-muted-foreground">{r.race_name}</span>}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString("el-GR")}</span>
                        </div>
                        <p className="text-sm text-foreground">{r.description}</p>
                        {r.drivers_involved && r.drivers_involved.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {r.drivers_involved.map((d: string, j: number) => (
                              <span key={j} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{d}</span>
                            ))}
                          </div>
                        )}
                        {r.video_url && (
                          <a href={r.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-xs mt-2 hover:underline">
                            <Video className="h-3 w-3" /> Δες το video
                          </a>
                        )}
                        {r.admin_notes && (
                          <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-xs text-primary font-medium">Σχόλιο Admin:</p>
                            <p className="text-xs text-foreground mt-1">{r.admin_notes}</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default IncidentReports;
