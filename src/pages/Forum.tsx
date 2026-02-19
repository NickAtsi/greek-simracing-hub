import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Pin, Lock, Eye, ChevronRight, Users, TrendingUp, Clock, ArrowLeft, Send, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Forum Index - List of categories
const ForumIndex = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<{ threads: number; posts: number; users: number }>({ threads: 0, posts: 0, users: 0 });

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  const fetchCategories = async () => {
    const { data: cats } = await supabase.from("forum_categories" as any).select("*").order("sort_order");
    const cats2 = (cats as any[]) || [];

    // Get thread counts per category
    const enriched = await Promise.all(cats2.map(async (cat) => {
      const { count: tc } = await supabase.from("forum_threads" as any).select("*", { count: "exact", head: true }).eq("category_id", cat.id);
      // Last thread
      const { data: last } = await supabase.from("forum_threads" as any).select("title, updated_at").eq("category_id", cat.id).order("updated_at", { ascending: false }).limit(1).single();
      return { ...cat, thread_count: tc || 0, last_thread: last };
    }));
    setCategories(enriched);
  };

  const fetchStats = async () => {
    const { count: tc } = await supabase.from("forum_threads" as any).select("*", { count: "exact", head: true });
    const { count: pc } = await supabase.from("forum_posts" as any).select("*", { count: "exact", head: true });
    const { count: uc } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    setStats({ threads: tc || 0, posts: pc || 0, users: uc || 0 });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="relative border-b border-border/50 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container mx-auto px-4 py-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-primary" />
              <span className="font-display text-[10px] tracking-[0.4em] text-primary uppercase">Κοινότητα</span>
            </div>
            <h1 className="font-display text-4xl font-black uppercase text-foreground">
              <span className="text-gradient-racing">Forum</span>
            </h1>
            {/* Stats bar */}
            <div className="flex gap-6 mt-4">
              {[
                { icon: MessageSquare, label: "Threads", value: stats.threads },
                { icon: Send, label: "Μηνύματα", value: stats.posts },
                { icon: Users, label: "Μέλη", value: stats.users },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">{value}</span> {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-8 space-y-3">
          {categories.map((cat: any, i: number) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/forum/category/${cat.id}`}>
                <div className="group rounded-xl border border-border bg-card hover:border-primary/40 transition-all p-5 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: cat.color + "22" }}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      </div>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                    <div className="hidden md:flex flex-col items-end text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="font-bold text-foreground">{cat.thread_count}</span> threads
                      </div>
                      {cat.last_thread && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {cat.last_thread.title}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Thread List for a category
const CategoryThreads = ({ categoryId }: { categoryId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [category, setCategory] = useState<any>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategory();
    fetchThreads();
  }, [categoryId]);

  const fetchCategory = async () => {
    const { data } = await supabase.from("forum_categories" as any).select("*").eq("id", categoryId).single();
    setCategory(data);
  };

  const fetchThreads = async () => {
    const { data } = await supabase
      .from("forum_threads" as any)
      .select("*, forum_posts(count)")
      .eq("category_id", categoryId)
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false });
    setThreads((data as any[]) || []);
  };

  const handleCreate = async () => {
    if (!user) { toast({ title: "Συνδέσου πρώτα", variant: "destructive" }); return; }
    if (!newTitle.trim() || !newContent.trim()) { toast({ title: "Συμπλήρωσε τίτλο και περιεχόμενο", variant: "destructive" }); return; }
    setSubmitting(true);
    const { data, error } = await supabase.from("forum_threads" as any).insert({
      category_id: categoryId,
      author_id: user.id,
      title: newTitle.trim(),
      content: newContent.trim(),
    }).select().single();
    setSubmitting(false);
    if (!error && data) {
      toast({ title: "Thread δημιουργήθηκε!" });
      setShowCreate(false);
      setNewTitle(""); setNewContent("");
      navigate(`/forum/thread/${(data as any).id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 pt-4">
            <Link to="/forum" className="hover:text-primary transition-colors">Forum</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{category?.name}</span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category?.icon}</span>
              <div>
                <h1 className="font-display text-2xl font-black text-foreground">{category?.name}</h1>
                <p className="text-sm text-muted-foreground">{category?.description}</p>
              </div>
            </div>
            {user && (
              <Button onClick={() => setShowCreate(true)} className="gap-2 bg-gradient-greek text-white hover:brightness-110">
                <Plus className="h-4 w-4" /> Νέο Thread
              </Button>
            )}
          </div>

          {/* Threads table (XenForo style) */}
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="grid grid-cols-[1fr_80px_80px_160px] gap-4 px-5 py-3 bg-secondary/30 border-b border-border text-xs font-display font-bold text-muted-foreground uppercase tracking-wider">
              <span>Thread</span>
              <span className="text-center">Replies</span>
              <span className="text-center">Views</span>
              <span className="text-right">Τελευταία δράστη</span>
            </div>
            {threads.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Δεν υπάρχουν threads. Δημιούργησε το πρώτο!</p>
              </div>
            ) : threads.map((thread: any) => (
              <Link key={thread.id} to={`/forum/thread/${thread.id}`}>
                <div className="grid grid-cols-[1fr_80px_80px_160px] gap-4 items-center px-5 py-4 border-b border-border/50 hover:bg-secondary/20 transition-all group">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex-shrink-0 mt-0.5">
                      {thread.pinned ? <Pin className="h-4 w-4 text-amber-400" /> : <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {thread.pinned && <span className="text-amber-400 mr-1">[Καρφιτσωμένο]</span>}
                        {thread.locked && <Lock className="h-3 w-3 inline mr-1 text-muted-foreground" />}
                        {thread.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(thread.created_at).toLocaleDateString("el-GR")}</p>
                    </div>
                  </div>
                  <span className="text-center text-sm font-bold text-foreground">{thread.forum_posts?.[0]?.count || 0}</span>
                  <span className="text-center text-sm text-muted-foreground">{thread.views || 0}</span>
                  <span className="text-right text-xs text-muted-foreground">{new Date(thread.updated_at).toLocaleDateString("el-GR")}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Νέο Thread</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Τίτλος thread..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="bg-secondary/50 border-border" />
            <Textarea placeholder="Περιεχόμενο..." value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={6} className="resize-none bg-secondary/50 border-border" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Ακύρωση</Button>
              <Button onClick={handleCreate} disabled={submitting} className="bg-gradient-greek text-white hover:brightness-110">
                {submitting ? "Δημιουργία..." : "Δημιουργία Thread"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

// Single Thread View
const ThreadView = ({ threadId }: { threadId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [thread, setThread] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [newPost, setNewPost] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showEditThread, setShowEditThread] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostContent, setEditPostContent] = useState("");

  useEffect(() => {
    fetchThread();
    fetchPosts();
    supabase.from("forum_threads" as any).update({ views: (thread?.views || 0) + 1 } as any).eq("id", threadId);
  }, [threadId]);

  const fetchThread = async () => {
    const { data } = await supabase.from("forum_threads" as any).select("*, forum_categories(name, icon, id)").eq("id", threadId).single();
    const threadData = data as any;
    setThread(threadData);
    if (threadData) fetchProfilesForIds([threadData.author_id]);
  };

  const fetchPosts = async () => {
    const { data } = await supabase.from("forum_posts" as any).select("*").eq("thread_id", threadId).order("created_at");
    const postsData = (data as any[]) || [];
    setPosts(postsData);
    if (postsData.length > 0) fetchProfilesForIds(postsData.map((p: any) => p.author_id));
  };

  const fetchProfilesForIds = async (ids: string[]) => {
    const unique = [...new Set(ids)];
    const { data } = await supabase.from("profiles").select("user_id, display_name, username, avatar_url").in("user_id", unique);
    if (data) {
      setProfiles(prev => {
        const map = { ...prev };
        (data as any[]).forEach(p => { map[p.user_id] = p; });
        return map;
      });
    }
  };

  const getProfile = (userId: string) => profiles[userId] || null;
  const getDisplayName = (userId: string) => {
    const p = getProfile(userId);
    return p?.display_name || p?.username || userId?.slice(0, 8) + "...";
  };

  const handleReply = async () => {
    if (!user) { toast({ title: "Συνδέσου πρώτα", variant: "destructive" }); return; }
    if (!newPost.trim()) return;
    if (thread?.locked) { toast({ title: "Αυτό το thread είναι κλειδωμένο", variant: "destructive" }); return; }
    setSubmitting(true);
    const { error } = await supabase.from("forum_posts" as any).insert({
      thread_id: threadId,
      author_id: user.id,
      content: newPost.trim()
    });
    setSubmitting(false);
    if (!error) { setNewPost(""); fetchPosts(); toast({ title: "Απάντηση προστέθηκε!" }); }
  };

  const handleDeletePost = async (postId: string) => {
    await supabase.from("forum_posts" as any).delete().eq("id", postId);
    fetchPosts();
  };

  const handleEditPost = async (postId: string) => {
    if (!editPostContent.trim()) return;
    await supabase.from("forum_posts" as any).update({ content: editPostContent.trim() } as any).eq("id", postId);
    setEditingPostId(null);
    setEditPostContent("");
    fetchPosts();
    toast({ title: "Ανάρτηση ενημερώθηκε!" });
  };

  const handleDeleteThread = async () => {
    if (!window.confirm("Σίγουρα θέλεις να διαγράψεις αυτό το thread;")) return;
    const catId = thread?.forum_categories?.id;
    await supabase.from("forum_threads" as any).delete().eq("id", threadId);
    toast({ title: "Thread διαγράφηκε!" });
    navigate(catId ? `/forum/category/${catId}` : "/forum");
  };

  const handleEditThread = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    await supabase.from("forum_threads" as any).update({ title: editTitle.trim(), content: editContent.trim() } as any).eq("id", threadId);
    setShowEditThread(false);
    fetchThread();
    toast({ title: "Thread ενημερώθηκε!" });
  };

  const openEditThread = () => {
    setEditTitle(thread.title);
    setEditContent(thread.content);
    setShowEditThread(true);
  };

  if (!thread) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Navbar />
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  const isThreadAuthor = user && user.id === thread.author_id;

  const allMessages = [
    { id: "op", author_id: thread.author_id, content: thread.content, created_at: thread.created_at, is_op: true },
    ...(posts as any[])
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 pt-4 flex-wrap">
            <Link to="/forum" className="hover:text-primary transition-colors">Forum</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={`/forum/category/${thread.forum_categories?.id}`} className="hover:text-primary transition-colors">{thread.forum_categories?.name}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground truncate max-w-[200px]">{thread.title}</span>
          </div>

          {/* Thread Title */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {thread.pinned && <span className="text-amber-400 text-xs font-display font-bold flex items-center gap-1"><Pin className="h-3 w-3" />ΚΑΡΦΙΤΣΩΜΕΝΟ</span>}
                {thread.locked && <span className="text-muted-foreground text-xs font-display font-bold flex items-center gap-1"><Lock className="h-3 w-3" />ΚΛΕΙΔΩΜΕΝΟ</span>}
              </div>
              <h1 className="font-display text-2xl font-black text-foreground">{thread.title}</h1>
            </div>
            {isThreadAuthor && (
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={openEditThread} className="gap-1.5 text-xs">
                  <Pencil className="h-3.5 w-3.5" /> Επεξεργασία
                </Button>
                <Button size="sm" variant="outline" onClick={handleDeleteThread} className="gap-1.5 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/40">
                  <Trash2 className="h-3.5 w-3.5" /> Διαγραφή
                </Button>
              </div>
            )}
          </div>

          {/* Posts */}
          <div className="space-y-4 mb-8">
            {allMessages.map((msg: any, i: number) => {
              const profile = getProfile(msg.author_id);
              const displayName = getDisplayName(msg.author_id);
              const isMyPost = user && user.id === msg.author_id;
              const isEditingThis = editingPostId === msg.id;

              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border ${msg.is_op ? "border-primary/30 bg-primary/5" : "border-border bg-card"} p-5`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                      <Link to={`/profile/${msg.author_id}`}>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile?.avatar_url || ""} alt={displayName} />
                          <AvatarFallback className="bg-gradient-greek text-white text-sm font-bold">
                            {displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      {msg.is_op && <span className="text-[9px] font-display font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">OP</span>}
                      <span className="text-[10px] text-muted-foreground">#{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <Link to={`/profile/${msg.author_id}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                          {displayName}
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString("el-GR")}</span>
                          {!msg.is_op && isMyPost && !isEditingThis && (
                            <>
                              <button onClick={() => { setEditingPostId(msg.id); setEditPostContent(msg.content); }} className="text-muted-foreground hover:text-primary transition-colors">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleDeletePost(msg.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {isEditingThis ? (
                        <div className="space-y-2">
                          <Textarea value={editPostContent} onChange={(e) => setEditPostContent(e.target.value)} rows={4} className="resize-none bg-secondary/50 border-border text-sm" />
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => setEditingPostId(null)}>Ακύρωση</Button>
                            <Button size="sm" onClick={() => handleEditPost(msg.id)} className="bg-gradient-greek text-white hover:brightness-110">Αποθήκευση</Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Reply box */}
          {!thread.locked ? (
            user ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-display text-sm font-bold text-foreground mb-3">Απάντηση</h3>
                <Textarea
                  placeholder="Γράψε την απάντησή σου..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={4}
                  className="resize-none bg-secondary/50 border-border mb-3"
                />
                <div className="flex justify-end">
                  <Button onClick={handleReply} disabled={submitting} className="gap-2 bg-gradient-greek text-white hover:brightness-110">
                    <Send className="h-4 w-4" /> {submitting ? "Αποστολή..." : "Απάντηση"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <p className="text-muted-foreground mb-3">Συνδέσου για να απαντήσεις</p>
                <Link to="/auth"><Button className="bg-gradient-greek text-white hover:brightness-110">Σύνδεση</Button></Link>
              </div>
            )
          ) : (
            <div className="rounded-xl border border-border bg-card p-5 text-center text-muted-foreground">
              <Lock className="h-5 w-5 mx-auto mb-2" /> Αυτό το thread είναι κλειδωμένο.
            </div>
          )}
        </div>
      </div>

      {/* Edit Thread Dialog */}
      <Dialog open={showEditThread} onOpenChange={setShowEditThread}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Επεξεργασία Thread</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Τίτλος thread..." value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-secondary/50 border-border" />
            <Textarea placeholder="Περιεχόμενο..." value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6} className="resize-none bg-secondary/50 border-border" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditThread(false)}>Ακύρωση</Button>
              <Button onClick={handleEditThread} className="bg-gradient-greek text-white hover:brightness-110">Αποθήκευση</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

// Main Forum Router
const Forum = () => {
  const { categoryId, threadId } = useParams<{ categoryId?: string; threadId?: string }>();
  if (threadId) return <ThreadView threadId={threadId} />;
  if (categoryId) return <CategoryThreads categoryId={categoryId} />;
  return <ForumIndex />;
};

export default Forum;

