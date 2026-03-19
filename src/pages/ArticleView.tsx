import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Eye, ArrowLeft, Clock, Pin, Pencil, Trash2, Send } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import { MarkdownContent } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ArticleView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [article, setArticle] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentProfiles, setCommentProfiles] = useState<Record<string, any>>({});
  const [likes, setLikes] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  useEffect(() => {
    if (id) {
      fetchArticle();
      fetchComments();
      fetchLikes();
      // Increment views
      supabase.from("articles" as any).update({ views: 1 } as any).eq("id", id);
    }
  }, [id]);

  const fetchArticle = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("articles" as any)
      .select("*, article_categories(name, color, slug)")
      .eq("id", id!)
      .single();
    const art = data as any;
    setArticle(art);
    setLoading(false);
    if (art?.author_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url")
        .eq("user_id", art.author_id)
        .single();
      setAuthor(profile);
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("article_comments" as any)
      .select("*")
      .eq("article_id", id!)
      .order("created_at");
    const commentData = (data as any[]) || [];
    setComments(commentData);
    if (commentData.length > 0) {
      const ids = [...new Set(commentData.map((c: any) => c.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url")
        .in("user_id", ids as string[]);
      const map: Record<string, any> = {};
      ((profiles as any[]) || []).forEach((p: any) => { map[p.user_id] = p; });
      setCommentProfiles(map);
    }
  };

  const fetchLikes = async () => {
    const { data } = await supabase
      .from("article_likes" as any)
      .select("*")
      .eq("article_id", id!);
    setLikes((data as any[]) || []);
  };

  const hasLiked = user ? likes.some((l: any) => l.user_id === user.id) : false;

  const handleLike = async () => {
    if (!user) { toast({ title: "Συνδέσου πρώτα", variant: "destructive" }); return; }
    if (hasLiked) {
      await supabase.from("article_likes" as any).delete().eq("article_id", id!).eq("user_id", user.id);
    } else {
      await supabase.from("article_likes" as any).insert({ article_id: id!, user_id: user.id });
    }
    fetchLikes();
  };

  const handleAddComment = async () => {
    if (!user) { toast({ title: "Συνδέσου πρώτα", variant: "destructive" }); return; }
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    const { error } = await supabase.from("article_comments" as any).insert({
      article_id: id!,
      author_id: user.id,
      content: newComment.trim(),
    });
    setSubmittingComment(false);
    if (!error) {
      setNewComment("");
      fetchComments();
      toast({ title: "Σχόλιο προστέθηκε!" });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from("article_comments" as any).delete().eq("id", commentId);
    fetchComments();
  };

  const handleEditComment = async (commentId: string) => {
    if (!editCommentContent.trim()) return;
    await supabase.from("article_comments" as any).update({ content: editCommentContent.trim() } as any).eq("id", commentId);
    setEditingCommentId(null);
    setEditCommentContent("");
    fetchComments();
    toast({ title: "Σχόλιο ενημερώθηκε!" });
  };

  const handleDeleteArticle = async () => {
    if (!window.confirm("Σίγουρα θέλεις να διαγράψεις αυτό το άρθρο;")) return;
    await supabase.from("articles" as any).delete().eq("id", id!);
    toast({ title: "Άρθρο διαγράφηκε!" });
    navigate("/articles");
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Navbar />
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 text-center text-muted-foreground">Το άρθρο δεν βρέθηκε.</div>
      <Footer />
    </div>
  );

  const isAuthor = user && user.id === article.author_id;
  const authorName = author?.display_name || author?.username || "Άγνωστος";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 pt-4">
            <Link to="/articles" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Άρθρα
            </Link>
          </div>

          {/* Article Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {article.pinned && (
                <span className="flex items-center gap-1 text-xs text-amber-400 font-medium"><Pin className="h-3 w-3" />Καρφιτσωμένο</span>
              )}
              {article.article_categories && (
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-display font-bold text-white" style={{ backgroundColor: article.article_categories.color }}>
                  {article.article_categories.name}
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="font-display text-3xl font-black leading-tight group/title inline-block relative cursor-default">
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-foreground via-foreground to-foreground bg-clip-text transition-all duration-500 group-hover/title:from-primary group-hover/title:via-accent group-hover/title:to-primary group-hover/title:text-transparent">
                    {article.title}
                  </span>
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-500 group-hover/title:w-full" />
                </span>
              </h1>
              {isAuthor && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={handleDeleteArticle} className="gap-1.5 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/40">
                    <Trash2 className="h-3.5 w-3.5" /> Διαγραφή
                  </Button>
                </div>
              )}
            </div>

            {/* Author + Meta */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <Link to={`/profile/${article.author_id}`}>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={author?.avatar_url || ""} alt={authorName} />
                  <AvatarFallback className="bg-gradient-greek text-white text-sm font-bold">
                    {authorName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link to={`/profile/${article.author_id}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                  {authorName}
                </Link>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(article.created_at).toLocaleDateString("el-GR", { day: "numeric", month: "long", year: "numeric" })}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views || 0} προβολές</span>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            {article.cover_url && (
              <div className="rounded-xl overflow-hidden mb-6">
                <img src={article.cover_url} alt={article.title} className="w-full h-64 object-cover" />
              </div>
            )}

            {/* Content */}
            <div className="mb-8">
              <MarkdownContent content={article.content} />
            </div>

            {/* Like + Stats bar */}
            <div className="flex items-center gap-4 py-4 border-t border-b border-border mb-8">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${hasLiked ? "bg-primary/20 text-primary" : "bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/10"}`}
              >
                <Heart className={`h-4 w-4 ${hasLiked ? "fill-primary" : ""}`} />
                {likes.length} {likes.length === 1 ? "Like" : "Likes"}
              </button>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" /> {comments.length} σχόλια
              </span>
            </div>

            {/* Comments Section */}
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-4">Σχόλια ({comments.length})</h2>

              {/* Add comment */}
              {user ? (
                <div className="flex gap-3 mb-6">
                  <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                    <AvatarFallback className="bg-gradient-greek text-white text-xs font-bold">
                      {user.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Πρόσθεσε σχόλιο..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="resize-none bg-secondary/50 border-border text-sm"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleAddComment} disabled={submittingComment || !newComment.trim()} className="gap-2 bg-gradient-greek text-white hover:brightness-110">
                        <Send className="h-3.5 w-3.5" /> {submittingComment ? "Αποστολή..." : "Σχόλιο"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card p-4 text-center mb-6">
                  <p className="text-muted-foreground text-sm mb-2">Συνδέσου για να σχολιάσεις</p>
                  <Link to="/auth"><Button size="sm" className="bg-gradient-greek text-white hover:brightness-110">Σύνδεση</Button></Link>
                </div>
              )}

              {/* Comment list */}
              <div className="space-y-4">
                {comments.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-6">Δεν υπάρχουν σχόλια ακόμα.</p>
                )}
                {comments.map((comment: any) => {
                  const profile = commentProfiles[comment.author_id];
                  const name = profile?.display_name || profile?.username || "Χρήστης";
                  const isMyComment = user && user.id === comment.author_id;
                  const isEditing = editingCommentId === comment.id;

                  return (
                    <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3">
                      <Link to={`/profile/${comment.author_id}`} className="flex-shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url || ""} alt={name} />
                          <AvatarFallback className="bg-secondary text-foreground text-xs font-bold">
                            {name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Link to={`/profile/${comment.author_id}`} className="text-xs font-bold text-foreground hover:text-primary transition-colors">
                              {name}
                            </Link>
                            <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString("el-GR")}</span>
                          </div>
                          {isMyComment && !isEditing && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setEditingCommentId(comment.id); setEditCommentContent(comment.content); }} className="text-muted-foreground hover:text-primary transition-colors">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleDeleteComment(comment.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        {isEditing ? (
                          <div className="space-y-2">
                            <Textarea value={editCommentContent} onChange={(e) => setEditCommentContent(e.target.value)} rows={2} className="resize-none bg-secondary/50 border-border text-sm" />
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>Ακύρωση</Button>
                              <Button size="sm" onClick={() => handleEditComment(comment.id)} className="bg-gradient-greek text-white hover:brightness-110">Αποθήκευση</Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ArticleView;
