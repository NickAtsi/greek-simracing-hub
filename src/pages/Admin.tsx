import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, FileText, MessageSquare, Headphones, BarChart3, Settings,
  Trash2, Edit, Plus, Shield, Pin, Lock, Eye, TrendingUp, Activity,
  ChevronRight, Check, X, RefreshCw, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type AdminTab = "dashboard" | "users" | "articles" | "forum" | "podcasts" | "categories" | "settings";

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-display font-black text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  </motion.div>
);

const Admin = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [stats, setStats] = useState({ users: 0, articles: 0, threads: 0, posts: 0, podcasts: 0 });

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [forumCats, setForumCats] = useState<any[]>([]);

  // Form states
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [podcastForm, setPodcastForm] = useState({ title: "", description: "", spotify_url: "", host: "", episode_number: "", duration: "", category: "Γενικά" });
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", slug: "", color: "#1565C0", type: "article" });
  const [editProfile, setEditProfile] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({ display_name: "", username: "", favorite_sim: "", favorite_track: "", setup_type: "" });

  useEffect(() => {
    if (!loading && user) checkAdmin();
  }, [user, loading]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      if (tab === "users") fetchUsers();
      if (tab === "articles") fetchArticles();
      if (tab === "forum") fetchThreads();
      if (tab === "podcasts") fetchPodcasts();
      if (tab === "categories") { fetchCategories(); fetchForumCats(); }
    }
  }, [isAdmin, tab]);

  const checkAdmin = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_roles" as any).select("role").eq("user_id", user.id).eq("role", "admin").single();
    setIsAdmin(!!data);
  };

  const fetchStats = async () => {
    const [{ count: u }, { count: a }, { count: t }, { count: p }, { count: pods }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("articles" as any).select("*", { count: "exact", head: true }),
      supabase.from("forum_threads" as any).select("*", { count: "exact", head: true }),
      supabase.from("forum_posts" as any).select("*", { count: "exact", head: true }),
      supabase.from("podcast_episodes" as any).select("*", { count: "exact", head: true }),
    ]);
    setStats({ users: u || 0, articles: a || 0, threads: t || 0, posts: p || 0, podcasts: pods || 0 });
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers((data as any[]) || []);
  };

  const fetchArticles = async () => {
    const { data } = await supabase.from("articles" as any).select("*, article_categories(name)").order("created_at", { ascending: false });
    setArticles((data as any[]) || []);
  };

  const fetchThreads = async () => {
    const { data } = await supabase.from("forum_threads" as any).select("*, forum_categories(name)").order("created_at", { ascending: false });
    setThreads((data as any[]) || []);
  };

  const fetchPodcasts = async () => {
    const { data } = await supabase.from("podcast_episodes" as any).select("*").order("created_at", { ascending: false });
    setPodcasts((data as any[]) || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("article_categories" as any).select("*").order("name");
    setCategories((data as any[]) || []);
  };

  const fetchForumCats = async () => {
    const { data } = await supabase.from("forum_categories" as any).select("*").order("sort_order");
    setForumCats((data as any[]) || []);
  };

  // CRUD operations
  const deleteArticle = async (id: string) => {
    await supabase.from("articles" as any).delete().eq("id", id);
    toast({ title: "Άρθρο διαγράφηκε" }); fetchArticles();
  };

  const toggleArticlePin = async (id: string, pinned: boolean) => {
    await supabase.from("articles" as any).update({ pinned: !pinned } as any).eq("id", id);
    fetchArticles();
  };

  const toggleArticlePublish = async (id: string, published: boolean) => {
    await supabase.from("articles" as any).update({ published: !published } as any).eq("id", id);
    fetchArticles();
  };

  const deleteThread = async (id: string) => {
    await supabase.from("forum_threads" as any).delete().eq("id", id);
    toast({ title: "Thread διαγράφηκε" }); fetchThreads();
  };

  const toggleThreadPin = async (id: string, pinned: boolean) => {
    await supabase.from("forum_threads" as any).update({ pinned: !pinned } as any).eq("id", id);
    fetchThreads();
  };

  const toggleThreadLock = async (id: string, locked: boolean) => {
    await supabase.from("forum_threads" as any).update({ locked: !locked } as any).eq("id", id);
    fetchThreads();
  };

  const deletePodcast = async (id: string) => {
    await supabase.from("podcast_episodes" as any).delete().eq("id", id);
    toast({ title: "Επεισόδιο διαγράφηκε" }); fetchPodcasts();
  };

  const handleAddPodcast = async () => {
    const { error } = await supabase.from("podcast_episodes" as any).insert({
      title: podcastForm.title,
      description: podcastForm.description,
      spotify_url: podcastForm.spotify_url,
      host: podcastForm.host,
      episode_number: parseInt(podcastForm.episode_number) || null,
      duration: podcastForm.duration,
      category: podcastForm.category,
    });
    if (!error) {
      toast({ title: "Επεισόδιο προστέθηκε!" });
      setShowPodcastForm(false);
      setPodcastForm({ title: "", description: "", spotify_url: "", host: "", episode_number: "", duration: "", category: "Γενικά" });
      fetchPodcasts();
    }
  };

  const handleAddCategory = async () => {
    if (catForm.type === "article") {
      await supabase.from("article_categories" as any).insert({ name: catForm.name, slug: catForm.slug, color: catForm.color });
      fetchCategories();
    } else {
      await supabase.from("forum_categories" as any).insert({ name: catForm.name, color: catForm.color });
      fetchForumCats();
    }
    setShowCatForm(false);
    setCatForm({ name: "", slug: "", color: "#1565C0", type: "article" });
    toast({ title: "Κατηγορία προστέθηκε!" });
  };

  const handleGrantAdmin = async (userId: string) => {
    await supabase.from("user_roles" as any).upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    toast({ title: "Admin δικαίωμα δόθηκε!" });
    fetchUsers();
  };

  const handleRevokeAdmin = async (userId: string) => {
    await supabase.from("user_roles" as any).delete().eq("user_id", userId).eq("role", "admin");
    toast({ title: "Admin δικαίωμα αφαιρέθηκε" });
    fetchUsers();
  };

  const openEditProfile = (profile: any) => {
    setEditProfile(profile);
    setProfileForm({
      display_name: profile.display_name || "",
      username: profile.username || "",
      favorite_sim: profile.favorite_sim || "",
      favorite_track: profile.favorite_track || "",
      setup_type: profile.setup_type || "",
    });
  };

  const handleSaveProfile = async () => {
    await supabase.from("profiles").update(profileForm as any).eq("id", editProfile.id);
    toast({ title: "Προφίλ ενημερώθηκε!" });
    setEditProfile(null);
    fetchUsers();
  };

  if (loading || isAdmin === null) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );

  if (!user) return <Navigate to="/auth" />;
  if (isAdmin === false) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Shield className="h-16 w-16 text-muted-foreground" />
      <h1 className="font-display text-2xl font-bold text-foreground">Δεν έχεις πρόσβαση</h1>
      <p className="text-muted-foreground">Χρειάζεσαι admin δικαιώματα για να δεις αυτή τη σελίδα.</p>
    </div>
  );

  const sidebarItems: { key: AdminTab; icon: any; label: string }[] = [
    { key: "dashboard", icon: BarChart3, label: "Dashboard" },
    { key: "users", icon: Users, label: "Χρήστες" },
    { key: "articles", icon: FileText, label: "Άρθρα" },
    { key: "forum", icon: MessageSquare, label: "Forum" },
    { key: "podcasts", icon: Headphones, label: "Podcasts" },
    { key: "categories", icon: BookOpen, label: "Κατηγορίες" },
    { key: "settings", icon: Settings, label: "Ρυθμίσεις" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-56 border-r border-border bg-card flex-shrink-0 fixed top-16 bottom-0 overflow-y-auto">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-display text-sm font-bold text-foreground">Admin Panel</span>
            </div>
          </div>
          <nav className="p-2">
            {sidebarItems.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-56 p-6">
          {/* Dashboard */}
          {tab === "dashboard" && (
            <div>
              <h1 className="font-display text-2xl font-black text-foreground mb-6">Dashboard</h1>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                <StatCard icon={Users} label="Χρήστες" value={stats.users} color="bg-primary" />
                <StatCard icon={FileText} label="Άρθρα" value={stats.articles} color="bg-green-700" />
                <StatCard icon={MessageSquare} label="Threads" value={stats.threads} color="bg-purple-700" />
                <StatCard icon={Activity} label="Posts" value={stats.posts} color="bg-orange-700" />
                <StatCard icon={Headphones} label="Podcasts" value={stats.podcasts} color="bg-blue-700" />
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Γρήγορες Ενέργειες
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Διαχείριση Χρηστών", onClick: () => setTab("users") },
                    { label: "Νέο Podcast", onClick: () => { setTab("podcasts"); setShowPodcastForm(true); } },
                    { label: "Κατηγορίες Forum", onClick: () => setTab("categories") },
                    { label: "Διαχείριση Άρθρων", onClick: () => setTab("articles") },
                    { label: "Διαχείριση Forum", onClick: () => setTab("forum") },
                    { label: "Ρυθμίσεις Site", onClick: () => setTab("settings") },
                  ].map((a) => (
                    <button key={a.label} onClick={a.onClick}
                      className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 hover:bg-secondary/60 transition-all px-4 py-3 text-sm font-medium text-foreground">
                      {a.label} <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {tab === "users" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-black text-foreground">Χρήστες ({stats.users})</h1>
                <Button onClick={fetchUsers} variant="outline" size="sm" className="gap-1"><RefreshCw className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/30 border-b border-border">
                      <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase">Χρήστης</th>
                      <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase">Username</th>
                      <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase">Εγγραφή</th>
                      <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase">Sim</th>
                      <th className="text-right px-4 py-3 font-display text-xs text-muted-foreground uppercase">Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-primary/20 text-primary text-xs">{(u.display_name || u.username || "?").slice(0, 1).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{u.display_name || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">@{u.username || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString("el-GR")}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{u.favorite_sim || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="outline" onClick={() => openEditProfile(u)} className="h-7 px-2 text-xs gap-1"><Edit className="h-3 w-3" /></Button>
                            <Button size="sm" variant="outline" onClick={() => handleGrantAdmin(u.user_id)} className="h-7 px-2 text-xs text-primary border-primary/30 gap-1">
                              <Shield className="h-3 w-3" />Admin
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Articles */}
          {tab === "articles" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-black text-foreground">Άρθρα ({stats.articles})</h1>
                <Button onClick={fetchArticles} variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="space-y-2">
                {articles.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {a.pinned && <Pin className="h-3.5 w-3.5 text-amber-400" />}
                        {!a.published && <span className="text-xs text-muted-foreground bg-secondary px-1.5 rounded">Draft</span>}
                        {a.article_categories && <span className="text-xs text-muted-foreground">[{a.article_categories.name}]</span>}
                      </div>
                      <p className="font-medium text-foreground text-sm truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("el-GR")} · {a.views || 0} views</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => toggleArticlePin(a.id, a.pinned)} className="h-7 px-2 text-xs">
                        <Pin className={`h-3 w-3 ${a.pinned ? "text-amber-400" : ""}`} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleArticlePublish(a.id, a.published)} className="h-7 px-2 text-xs">
                        {a.published ? <Eye className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteArticle(a.id)} className="h-7 px-2 text-xs text-destructive border-destructive/30">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forum */}
          {tab === "forum" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-black text-foreground">Forum Threads ({stats.threads})</h1>
                <Button onClick={fetchThreads} variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="space-y-2">
                {threads.map((t: any) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {t.pinned && <Pin className="h-3.5 w-3.5 text-amber-400" />}
                        {t.locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                        {t.forum_categories && <span className="text-xs text-muted-foreground">[{t.forum_categories.name}]</span>}
                      </div>
                      <p className="font-medium text-foreground text-sm truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("el-GR")} · {t.views || 0} views</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => toggleThreadPin(t.id, t.pinned)} className="h-7 px-2 text-xs">
                        <Pin className={`h-3 w-3 ${t.pinned ? "text-amber-400" : ""}`} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleThreadLock(t.id, t.locked)} className="h-7 px-2 text-xs">
                        <Lock className={`h-3 w-3 ${t.locked ? "text-primary" : ""}`} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteThread(t.id)} className="h-7 px-2 text-xs text-destructive border-destructive/30">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Podcasts */}
          {tab === "podcasts" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-black text-foreground">Podcasts ({stats.podcasts})</h1>
                <Button onClick={() => setShowPodcastForm(true)} className="gap-2 bg-gradient-greek text-white hover:brightness-110">
                  <Plus className="h-4 w-4" /> Νέο Επεισόδιο
                </Button>
              </div>
              <div className="space-y-3">
                {podcasts.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-600/20 border border-green-600/40 flex items-center justify-center">
                      <Headphones className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">#{p.episode_number} — {p.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{p.host}</span>
                        <span>{p.duration}</span>
                        <span>{p.category}</span>
                        {p.spotify_url && (
                          <a href={p.spotify_url} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">Spotify ↗</a>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => deletePodcast(p.id)} className="h-7 px-2 text-destructive border-destructive/30">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                {podcasts.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Headphones className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>Δεν υπάρχουν επεισόδια. Πρόσθεσε το πρώτο!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          {tab === "categories" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-black text-foreground">Κατηγορίες</h1>
                <Button onClick={() => setShowCatForm(true)} className="gap-2 bg-gradient-greek text-white hover:brightness-110">
                  <Plus className="h-4 w-4" /> Νέα Κατηγορία
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Article Categories */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Κατηγορίες Άρθρων</h3>
                  <div className="space-y-2">
                    {categories.map((cat: any) => (
                      <div key={cat.id} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2">
                        <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm text-foreground flex-1">{cat.name}</span>
                        <span className="text-xs text-muted-foreground">{cat.slug}</span>
                        <button onClick={async () => { await supabase.from("article_categories" as any).delete().eq("id", cat.id); fetchCategories(); }} className="text-destructive hover:text-destructive/80 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Forum Categories */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" />Κατηγορίες Forum</h3>
                  <div className="space-y-2">
                    {forumCats.map((cat: any) => (
                      <div key={cat.id} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2">
                        <span className="text-base">{cat.icon}</span>
                        <span className="text-sm text-foreground flex-1">{cat.name}</span>
                        <button onClick={async () => { await supabase.from("forum_categories" as any).delete().eq("id", cat.id); fetchForumCats(); }} className="text-destructive hover:text-destructive/80 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {tab === "settings" && (
            <div>
              <h1 className="font-display text-2xl font-black text-foreground mb-6">Ρυθμίσεις Site</h1>
              <div className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-lg">
                <p className="text-sm text-muted-foreground">
                  Για να δώσεις Admin δικαιώματα σε έναν χρήστη, πήγαινε στο tab <strong>Χρήστες</strong> και πάτα το κουμπί Admin.
                </p>
                <p className="text-sm text-muted-foreground">
                  Discord Server ID: <code className="bg-secondary px-2 py-0.5 rounded text-xs">459797812251590677</code>
                </p>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">Greek SimRacers Admin Panel v1.0</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Podcast Dialog */}
      <Dialog open={showPodcastForm} onOpenChange={setShowPodcastForm}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Νέο Podcast Επεισόδιο</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Τίτλος" value={podcastForm.title} onChange={(e) => setPodcastForm(p => ({ ...p, title: e.target.value }))} className="bg-secondary/50" />
              <Input placeholder="Αρ. Επεισοδίου" type="number" value={podcastForm.episode_number} onChange={(e) => setPodcastForm(p => ({ ...p, episode_number: e.target.value }))} className="bg-secondary/50" />
            </div>
            <Input placeholder="Host (π.χ. Γιάννης Κ.)" value={podcastForm.host} onChange={(e) => setPodcastForm(p => ({ ...p, host: e.target.value }))} className="bg-secondary/50" />
            <Input placeholder="Spotify URL (π.χ. https://open.spotify.com/episode/...)" value={podcastForm.spotify_url} onChange={(e) => setPodcastForm(p => ({ ...p, spotify_url: e.target.value }))} className="bg-secondary/50" />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Διάρκεια (π.χ. 45:30)" value={podcastForm.duration} onChange={(e) => setPodcastForm(p => ({ ...p, duration: e.target.value }))} className="bg-secondary/50" />
              <Input placeholder="Κατηγορία" value={podcastForm.category} onChange={(e) => setPodcastForm(p => ({ ...p, category: e.target.value }))} className="bg-secondary/50" />
            </div>
            <Textarea placeholder="Περιγραφή..." value={podcastForm.description} onChange={(e) => setPodcastForm(p => ({ ...p, description: e.target.value }))} rows={3} className="resize-none bg-secondary/50" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPodcastForm(false)}>Ακύρωση</Button>
              <Button onClick={handleAddPodcast} className="bg-gradient-greek text-white hover:brightness-110">Προσθήκη</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={showCatForm} onOpenChange={setShowCatForm}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Νέα Κατηγορία</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <select value={catForm.type} onChange={(e) => setCatForm(p => ({ ...p, type: e.target.value }))}
              className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground">
              <option value="article">Κατηγορία Άρθρων</option>
              <option value="forum">Κατηγορία Forum</option>
            </select>
            <Input placeholder="Όνομα κατηγορίας" value={catForm.name} onChange={(e) => setCatForm(p => ({ ...p, name: e.target.value }))} className="bg-secondary/50" />
            {catForm.type === "article" && (
              <Input placeholder="Slug (π.χ. news)" value={catForm.slug} onChange={(e) => setCatForm(p => ({ ...p, slug: e.target.value }))} className="bg-secondary/50" />
            )}
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">Χρώμα:</label>
              <input type="color" value={catForm.color} onChange={(e) => setCatForm(p => ({ ...p, color: e.target.value }))} className="h-8 w-16 rounded cursor-pointer" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCatForm(false)}>Ακύρωση</Button>
              <Button onClick={handleAddCategory} className="bg-gradient-greek text-white hover:brightness-110">Προσθήκη</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editProfile} onOpenChange={() => setEditProfile(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Επεξεργασία Προφίλ</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Display Name" value={profileForm.display_name} onChange={(e) => setProfileForm(p => ({ ...p, display_name: e.target.value }))} className="bg-secondary/50" />
            <Input placeholder="Username" value={profileForm.username} onChange={(e) => setProfileForm(p => ({ ...p, username: e.target.value }))} className="bg-secondary/50" />
            <Input placeholder="Αγαπημένο Sim" value={profileForm.favorite_sim} onChange={(e) => setProfileForm(p => ({ ...p, favorite_sim: e.target.value }))} className="bg-secondary/50" />
            <Input placeholder="Αγαπημένη Πίστα" value={profileForm.favorite_track} onChange={(e) => setProfileForm(p => ({ ...p, favorite_track: e.target.value }))} className="bg-secondary/50" />
            <Input placeholder="Τύπος Setup" value={profileForm.setup_type} onChange={(e) => setProfileForm(p => ({ ...p, setup_type: e.target.value }))} className="bg-secondary/50" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditProfile(null)}>Ακύρωση</Button>
              <Button onClick={handleSaveProfile} className="bg-gradient-greek text-white hover:brightness-110">Αποθήκευση</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
