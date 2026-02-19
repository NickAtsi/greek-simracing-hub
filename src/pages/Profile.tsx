import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, UserPlus, UserCheck, UserX, Trophy, Gamepad2, Flag, Mic, Settings, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [followStatus, setFollowStatus] = useState<"none" | "pending" | "accepted">("none");
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const profileUserId = userId || user?.id;
  const isOwnProfile = user?.id === profileUserId;

  useEffect(() => {
    if (!profileUserId) return;
    fetchProfile();
    fetchComments();
    fetchLikes();
    fetchFollowData();
    if (user) checkAdminStatus();
  }, [profileUserId, user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_roles" as any).select("role").eq("user_id", user.id).eq("role", "admin").single();
    setIsAdmin(!!data);
  };

  const fetchProfile = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").eq("user_id", profileUserId).single();
    setProfile(data);
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("profile_comments" as any)
      .select("*")
      .eq("profile_user_id", profileUserId)
      .order("created_at", { ascending: false });
    setComments((data as any[]) || []);
  };

  const fetchLikes = async () => {
    const { count } = await supabase
      .from("profile_likes" as any)
      .select("*", { count: "exact", head: true })
      .eq("profile_user_id", profileUserId);
    setLikesCount(count || 0);
    if (user) {
      const { data } = await supabase
        .from("profile_likes" as any)
        .select("id")
        .eq("user_id", user.id)
        .eq("profile_user_id", profileUserId)
        .single();
      setHasLiked(!!data);
    }
  };

  const fetchFollowData = async () => {
    const { count: fc } = await supabase
      .from("follows" as any)
      .select("*", { count: "exact", head: true })
      .eq("following_id", profileUserId)
      .eq("status", "accepted");
    setFollowersCount(fc || 0);

    const { count: fgc } = await supabase
      .from("follows" as any)
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profileUserId)
      .eq("status", "accepted");
    setFollowingCount(fgc || 0);

    if (user && !isOwnProfile) {
      const { data } = await supabase
        .from("follows" as any)
        .select("status")
        .eq("follower_id", user.id)
        .eq("following_id", profileUserId)
        .single();
      setFollowStatus(data ? (data as any).status : "none");
    }
  };

  const handleLike = async () => {
    if (!user) { toast({ title: "Συνδέσου πρώτα", variant: "destructive" }); return; }
    if (isOwnProfile) return;
    if (hasLiked) {
      await supabase.from("profile_likes" as any).delete().eq("user_id", user.id).eq("profile_user_id", profileUserId);
      setHasLiked(false); setLikesCount(p => p - 1);
    } else {
      await supabase.from("profile_likes" as any).insert({ user_id: user.id, profile_user_id: profileUserId });
      setHasLiked(true); setLikesCount(p => p + 1);
    }
  };

  const handleFollow = async () => {
    if (!user) { toast({ title: "Συνδέσου πρώτα", variant: "destructive" }); return; }
    if (followStatus === "none") {
      await supabase.from("follows" as any).insert({ follower_id: user.id, following_id: profileUserId, status: "pending" });
      setFollowStatus("pending");
      toast({ title: "Αίτημα φιλίας στάλθηκε!" });
    } else {
      await supabase.from("follows" as any).delete().eq("follower_id", user.id).eq("following_id", profileUserId);
      setFollowStatus("none");
    }
  };

  const handleComment = async () => {
    if (!user) { toast({ title: "Συνδέσου πρώτα", variant: "destructive" }); return; }
    if (!newComment.trim()) return;
    const { error } = await supabase.from("profile_comments" as any).insert({
      author_id: user.id,
      profile_user_id: profileUserId,
      content: newComment.trim()
    });
    if (!error) { setNewComment(""); fetchComments(); toast({ title: "Σχόλιο προστέθηκε!" }); }
  };

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from("profile_comments" as any).delete().eq("id", commentId);
    fetchComments();
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Navbar />
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-xl">Προφίλ δεν βρέθηκε</p>
      </div>
      <Footer />
    </div>
  );

  const initials = (profile.display_name || profile.username || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Hero Banner */}
        <div className="relative h-48 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10 border-b border-border overflow-hidden">
          <div className="absolute inset-0 carbon-texture opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
          {/* Greek flag stripes */}
          <div className="absolute top-0 left-0 right-0 flex flex-col">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-3 ${i % 2 === 0 ? "bg-primary/20" : "bg-transparent"}`} />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="relative -mt-16 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
                <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary/40">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-greek text-white text-3xl font-display font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-background" />
              </motion.div>

              <div className="flex-1 pb-2">
                <h1 className="font-display text-3xl font-black text-foreground">
                  {profile.display_name || profile.username || "Anonymous Racer"}
                </h1>
                {profile.username && (
                  <p className="text-muted-foreground text-sm">@{profile.username}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-muted-foreground"><span className="text-foreground font-bold">{followersCount}</span> Followers</span>
                  <span className="text-sm text-muted-foreground"><span className="text-foreground font-bold">{followingCount}</span> Following</span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Heart className="h-3.5 w-3.5 text-primary" />
                    <span className="text-foreground font-bold">{likesCount}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-2">
                {!isOwnProfile && (
                  <>
                    <Button
                      onClick={handleLike}
                      variant="outline"
                      className={`gap-2 ${hasLiked ? "border-primary text-primary" : ""}`}
                    >
                      <Heart className={`h-4 w-4 ${hasLiked ? "fill-primary" : ""}`} />
                      {hasLiked ? "Liked" : "Like"}
                    </Button>
                    <Button onClick={handleFollow} className="gap-2 bg-gradient-greek text-white hover:brightness-110">
                      {followStatus === "none" && <><UserPlus className="h-4 w-4" />Ακολουθώ</>}
                      {followStatus === "pending" && <><UserX className="h-4 w-4" />Εκκρεμεί</>}
                      {followStatus === "accepted" && <><UserCheck className="h-4 w-4" />Ακολουθείς</>}
                    </Button>
                  </>
                )}
                {isOwnProfile && (
                  <Link to="/admin">
                    <Button variant="outline" className="gap-2">
                      <Settings className="h-4 w-4" /> Επεξεργασία
                    </Button>
                  </Link>
                )}
                {isAdmin && !isOwnProfile && (
                  <span className="rounded-full bg-primary/20 border border-primary/40 px-2 py-0.5 text-xs font-display text-primary">ADMIN</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">
            {/* Left: Racing Info */}
            <div className="space-y-4">
              {/* Racing Stats Card */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Flag className="h-4 w-4 text-primary" /> Racing Info
                </h3>
                <div className="space-y-3">
                  {profile.favorite_sim && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Gamepad2 className="h-3.5 w-3.5" />Αγαπημένο Sim</span>
                      <span className="text-xs font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded-full">{profile.favorite_sim}</span>
                    </div>
                  )}
                  {profile.favorite_track && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" />Αγαπημένη Πίστα</span>
                      <span className="text-xs font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded-full">{profile.favorite_track}</span>
                    </div>
                  )}
                  {profile.setup_type && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" />Εξοπλισμός</span>
                      <span className="text-xs font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded-full">{profile.setup_type}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Μέλος από</span>
                    <span className="text-xs font-medium text-foreground">{new Date(profile.created_at).toLocaleDateString("el-GR")}</span>
                  </div>
                </div>
              </motion.div>

              {/* Friends card */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Κοινωνικό
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center rounded-lg bg-secondary/50 p-3">
                    <p className="font-display text-2xl font-black text-primary">{followersCount}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center rounded-lg bg-secondary/50 p-3">
                    <p className="font-display text-2xl font-black text-primary">{followingCount}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Comments Section */}
            <div className="lg:col-span-2 space-y-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" /> Σχόλια Προφίλ
                </h3>

                {/* Comment form */}
                {user && !isOwnProfile && (
                  <div className="mb-4 space-y-2">
                    <Textarea
                      placeholder="Γράψε ένα σχόλιο..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="resize-none bg-secondary/50 border-border text-sm"
                      rows={2}
                    />
                    <Button onClick={handleComment} size="sm" className="bg-gradient-greek text-white hover:brightness-110">
                      Αποστολή
                    </Button>
                  </div>
                )}

                {/* Comments list */}
                <div className="space-y-3">
                  {comments.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-6">Δεν υπάρχουν σχόλια ακόμα.</p>
                  )}
                  {comments.map((comment: any) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-3 rounded-lg bg-secondary/30 p-3"
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">?</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{comment.author_id?.slice(0, 8)}...</span>
                          <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString("el-GR")}</span>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                      {(user?.id === comment.author_id || isAdmin || isOwnProfile) && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="text-muted-foreground hover:text-destructive transition-colors text-xs">✕</button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
