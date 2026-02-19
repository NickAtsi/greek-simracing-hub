import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, UserPlus, UserCheck, UserX, Trophy, Gamepad2, Flag, Mic, Settings, Calendar, Users, Camera, Save, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: "", username: "", favorite_sim: "", favorite_track: "", setup_type: "" });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      .select("*, profiles!author_id(display_name, username, avatar_url)")
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

  const openEdit = () => {
    setEditForm({
      display_name: profile?.display_name || "",
      username: profile?.username || "",
      favorite_sim: profile?.favorite_sim || "",
      favorite_track: profile?.favorite_track || "",
      setup_type: profile?.setup_type || "",
    });
    setShowEditDialog(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(editForm as any).eq("user_id", user.id);
    setSaving(false);
    if (!error) {
      toast({ title: "Προφίλ αποθηκεύτηκε!" });
      setShowEditDialog(false);
      fetchProfile();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Το αρχείο είναι πολύ μεγάλο (max 5MB)", variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Σφάλμα ανεβάσματος", variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl } as any).eq("user_id", user.id);
    setUploadingAvatar(false);
    toast({ title: "Avatar ενημερώθηκε!" });
    fetchProfile();
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
        </div>

        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="relative -mt-16 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary/40">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-greek text-white text-3xl font-display font-bold">{initials}</AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      {uploadingAvatar ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                      ) : (
                        <Camera className="h-7 w-7 text-white" />
                      )}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </>
                )}
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
                    <Button onClick={handleLike} variant="outline" className={`gap-2 ${hasLiked ? "border-primary text-primary" : ""}`}>
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
                  <Button onClick={openEdit} variant="outline" className="gap-2">
                    <Edit2 className="h-4 w-4" /> Επεξεργασία Προφίλ
                  </Button>
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

                <div className="space-y-3">
                  {comments.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-6">Δεν υπάρχουν σχόλια ακόμα.</p>
                  )}
                  {comments.map((comment: any) => {
                    const authorProfile = comment.profiles;
                    const authorName = authorProfile?.display_name || authorProfile?.username || comment.author_id?.slice(0, 8) + "...";
                    return (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start gap-3 rounded-lg bg-secondary/30 p-3"
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={authorProfile?.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                            {authorName.slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <Link to={`/profile/${comment.author_id}`} className="text-xs font-medium text-foreground hover:text-primary transition-colors">
                              {authorName}
                            </Link>
                            <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString("el-GR")}</span>
                          </div>
                          <p className="text-sm text-foreground">{comment.content}</p>
                        </div>
                        {(user?.id === comment.author_id || isAdmin || isOwnProfile) && (
                          <button onClick={() => handleDeleteComment(comment.id)} className="text-muted-foreground hover:text-destructive transition-colors text-xs">✕</button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Επεξεργασία Προφίλ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Avatar upload in dialog too */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-greek text-white text-xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar} className="gap-2">
                  <Camera className="h-4 w-4" />
                  {uploadingAvatar ? "Ανεβάζει..." : "Αλλαγή φωτογραφίας"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG έως 5MB</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Εμφανιζόμενο Όνομα</label>
                <Input value={editForm.display_name} onChange={(e) => setEditForm(p => ({ ...p, display_name: e.target.value }))} className="bg-secondary/50" placeholder="Όνομα..." />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Username</label>
                <Input value={editForm.username} onChange={(e) => setEditForm(p => ({ ...p, username: e.target.value }))} className="bg-secondary/50" placeholder="@username..." />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Αγαπημένο Sim Racing Game</label>
              <Input value={editForm.favorite_sim} onChange={(e) => setEditForm(p => ({ ...p, favorite_sim: e.target.value }))} className="bg-secondary/50" placeholder="π.χ. iRacing, Assetto Corsa..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Αγαπημένη Πίστα</label>
              <Input value={editForm.favorite_track} onChange={(e) => setEditForm(p => ({ ...p, favorite_track: e.target.value }))} className="bg-secondary/50" placeholder="π.χ. Nürburgring, Spa..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Τύπος Setup</label>
              <select value={editForm.setup_type} onChange={(e) => setEditForm(p => ({ ...p, setup_type: e.target.value }))}
                className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground">
                <option value="">Επιλέξτε...</option>
                <option value="Keyboard">Keyboard</option>
                <option value="Controller">Controller</option>
                <option value="Entry Wheel">Entry Wheel</option>
                <option value="Mid-Range Wheel">Mid-Range Wheel</option>
                <option value="Direct Drive">Direct Drive</option>
                <option value="Full Motion Rig">Full Motion Rig</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Ακύρωση</Button>
              <Button onClick={handleSaveProfile} disabled={saving} className="bg-gradient-greek text-white hover:brightness-110 gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Αποθήκευση..." : "Αποθήκευση"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Profile;
