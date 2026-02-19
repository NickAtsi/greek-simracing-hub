import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, Heart, MessageCircle, Eye, Pin, BookOpen, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Articles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [selectedCategory, search]);

  const fetchCategories = async () => {
    const { data } = await supabase.from("article_categories" as any).select("*").order("name");
    setCategories((data as any[]) || []);
  };

  const fetchArticles = async () => {
    setLoading(true);
    let q = (supabase.from("article_categories" as any) as any);
    let query = supabase
      .from("articles" as any)
      .select(`*, article_categories(name, color, slug), article_likes(count), article_comments(count)`)
      .eq("published", true)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory);
    }
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    const { data } = await query;
    setArticles((data as any[]) || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user) { toast({ title: "Συνδέσου πρώτα", variant: "destructive" }); return; }
    if (!newTitle.trim() || !newContent.trim()) { toast({ title: "Συμπλήρωσε τίτλο και περιεχόμενο", variant: "destructive" }); return; }
    setSubmitting(true);
    const { error } = await supabase.from("articles" as any).insert({
      author_id: user.id,
      title: newTitle.trim(),
      content: newContent.trim(),
      category_id: newCategory || null,
    });
    setSubmitting(false);
    if (!error) {
      toast({ title: "Άρθρο δημιουργήθηκε!" });
      setShowCreate(false);
      setNewTitle(""); setNewContent(""); setNewCategory("");
      fetchArticles();
    }
  };

  const handleLike = async (articleId: string, hasLiked: boolean) => {
    if (!user) { toast({ title: "Συνδέσου πρώτα", variant: "destructive" }); return; }
    if (hasLiked) {
      await supabase.from("article_likes" as any).delete().eq("article_id", articleId).eq("user_id", user.id);
    } else {
      await supabase.from("article_likes" as any).insert({ article_id: articleId, user_id: user.id });
    }
    fetchArticles();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        {/* Header */}
        <div className="relative border-b border-border/50 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container mx-auto px-4 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px w-8 bg-primary" />
                <span className="font-display text-[10px] tracking-[0.4em] text-primary uppercase">Άρθρα & Threads</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display text-4xl font-black uppercase text-foreground">
                    <span className="text-gradient-racing">Άρθρα</span>
                  </h1>
                  <p className="text-muted-foreground mt-1">Μοιράσου νέα, οδηγούς και εμπειρίες</p>
                </div>
                {user && (
                  <Button onClick={() => setShowCreate(true)} className="gap-2 bg-gradient-greek text-white hover:brightness-110">
                    <Plus className="h-4 w-4" /> Νέο Άρθρο
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar - Categories */}
            <div className="w-full md:w-56 flex-shrink-0">
              <div className="rounded-xl border border-border bg-card p-4 sticky top-24">
                <h3 className="font-display text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Κατηγορίες</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!selectedCategory ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
                  >
                    Όλα τα άρθρα
                  </button>
                  {categories.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${selectedCategory === cat.id ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
                    >
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Αναζήτηση άρθρων..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-card border-border"
                />
              </div>

              {/* Articles Grid */}
              {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
              ) : articles.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Δεν βρέθηκαν άρθρα. Γίνε ο πρώτος που θα γράψει!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article: any, i: number) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group rounded-xl border border-border bg-card hover:border-primary/40 transition-all p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {article.pinned && (
                              <span className="flex items-center gap-1 text-xs text-amber-400 font-medium"><Pin className="h-3 w-3" />Καρφιτσωμένο</span>
                            )}
                            {article.article_categories && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-display font-bold text-white" style={{ backgroundColor: article.article_categories.color }}>
                                {article.article_categories.name}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">{new Date(article.created_at).toLocaleDateString("el-GR")}</span>
                          </div>
                          <Link to={`/articles/${article.id}`}>
                            <h2 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                              {article.title}
                            </h2>
                          </Link>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {article.content.slice(0, 200)}...
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{article.views || 0}</span>
                            <button
                              onClick={() => handleLike(article.id, false)}
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              <Heart className="h-3.5 w-3.5" />
                              {article.article_likes?.[0]?.count || 0}
                            </button>
                            <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{article.article_comments?.[0]?.count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Article Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Νέο Άρθρο</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Τίτλος άρθρου..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-secondary/50 border-border"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground"
            >
              <option value="">Επιλέξτε κατηγορία...</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <Textarea
              placeholder="Περιεχόμενο άρθρου..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={8}
              className="resize-none bg-secondary/50 border-border"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Ακύρωση</Button>
              <Button onClick={handleCreate} disabled={submitting} className="bg-gradient-greek text-white hover:brightness-110">
                {submitting ? "Αποθήκευση..." : "Δημοσίευση"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Articles;
