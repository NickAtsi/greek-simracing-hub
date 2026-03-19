import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, UserPlus, UserCheck, UserX, X, Trophy, Gamepad2, Flag, Calendar, Users, Camera, Save, Edit2, Globe, MapPin, Hash, Clock3, ExternalLink, Mail, Lock } from "lucide-react";
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
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: "", username: "", favorite_sim: "", favorite_track: "", setup_type: "", bio: "", location: "", discord_username: "", nationality: "", years_simracing: "", website_url: "" });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileUserId = userId || user?.id;
  const isOwnProfile = user?.id === profileUserId;

  useEffect(() => {
    if (!profileUserId) return;
    fetchProfile();
    fetchComments();
    fetchLikes();
    fetchFollowData();
    if (user) {
      checkAdminStatus();
      if (isOwnProfile) fetchPendingRequests();
    }
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

  const fetchPendingRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("follows" as any)
      .select("*, profiles!follower_id(display_name, username, avatar_url, user_id)")
      .eq("following_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setPendingRequests((data as any[]) || []);
  };

  const acceptFollow = async (followId: string) => {
    await supabase.from("follows" as any).update({ status: "accepted" } as any).eq("id", followId);
    toast({ title: "Αίτημα αποδεκτό! ✅" });
    fetchPendingRequests();
    fetchFollowData();
  };

  const rejectFollow = async (followId: string) => {
    await supabase.from("follows" as any).delete().eq("id", followId);
    toast({ title: "Αίτημα απορρίφθηκε" });
    fetchPendingRequests();
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
      bio: profile?.bio || "",
      location: profile?.location || "",
      discord_username: profile?.discord_username || "",
      nationality: profile?.nationality || "",
      years_simracing: profile?.years_simracing || "",
      website_url: profile?.website_url || "",
    });
    setNewEmail(user?.email || "");
    setNewPassword("");
    setConfirmPassword("");
    setShowEditDialog(true);
  };

  const handleUpdateAccount = async () => {
    if (!user) return;
    setSavingAccount(true);
    try {
      // Update email if changed
      if (newEmail && newEmail !== user.email) {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) throw error;
        toast({ title: "Email επιβεβαίωσης στάλθηκε", description: "Έλεγξε το νέο και το παλιό email σου για επιβεβαίωση." });
      }
      // Update password if provided
      if (newPassword) {
        if (newPassword.length < 6) {
          toast({ title: "Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες", variant: "destructive" });
          setSavingAccount(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          toast({ title: "Οι κωδικοί δεν ταιριάζουν", variant: "destructive" });
          setSavingAccount(false);
          return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        toast({ title: "Ο κωδικός ενημερώθηκε!" });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
    } finally {
      setSavingAccount(false);
    }
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
                <h1 className="font-display text-3xl font-black text-foreground group/name inline-block relative cursor-default">
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-foreground via-foreground to-foreground bg-clip-text transition-all duration-500 group-hover/name:from-primary group-hover/name:via-accent group-hover/name:to-primary group-hover/name:text-transparent">
                      {profile.display_name || profile.username || "Anonymous Racer"}
                    </span>
                    {/* Speed underline */}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-500 group-hover/name:w-full" />
                    {/* Glow layer */}
                    <span className="absolute inset-0 blur-xl opacity-0 bg-gradient-to-r from-primary/40 to-accent/40 transition-opacity duration-500 group-hover/name:opacity-100 -z-10" />
                  </span>
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
              {/* Bio */}
              {profile.bio && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" /> Βιογραφικό
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border bg-card p-5">
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
                  {profile.years_simracing && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />Χρόνια SimRacing</span>
                      <span className="text-xs font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded-full">{profile.years_simracing}</span>
                    </div>
                  )}
                  {profile.nationality && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />Εθνικότητα</span>
                      <span className="text-xs font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded-full">{profile.nationality}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Τοποθεσία</span>
                      <span className="text-xs font-medium text-foreground">{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Μέλος από</span>
                    <span className="text-xs font-medium text-foreground">{new Date(profile.created_at).toLocaleDateString("el-GR")}</span>
                  </div>
                </div>
              </motion.div>

              {/* Social / Links */}
              {(profile.discord_username || profile.website_url) && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" /> Links
                  </h3>
                  <div className="space-y-2">
                    {profile.discord_username && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.081.118 18.105.137 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                          Discord
                        </span>
                        <span className="text-xs font-medium text-foreground">@{profile.discord_username}</span>
                      </div>
                    )}
                    {profile.website_url && (
                      <a href={profile.website_url.startsWith("http") ? profile.website_url : `https://${profile.website_url}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-primary hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" /> {profile.website_url}
                      </a>
                    )}
                  </div>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-border bg-card p-5">
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

                {/* Pending Follow Requests - only on own profile */}
                {isOwnProfile && pendingRequests.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <UserPlus className="h-3 w-3" /> Αιτήματα ({pendingRequests.length})
                    </h4>
                    <div className="space-y-2">
                      {pendingRequests.map((req: any) => {
                        const reqProfile = req.profiles;
                        return (
                          <div key={req.id} className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2">
                            <Link to={`/profile/${reqProfile?.user_id || req.follower_id}`} className="flex items-center gap-2 flex-1 min-w-0">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={reqProfile?.avatar_url || ""} />
                                <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                                  {(reqProfile?.display_name || "?")[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium text-foreground truncate">
                                {reqProfile?.display_name || reqProfile?.username || "Χρήστης"}
                              </span>
                            </Link>
                            <Button size="sm" variant="ghost" onClick={() => acceptFollow(req.id)} className="h-6 w-6 p-0 text-green-500 hover:text-green-400 hover:bg-green-500/10">
                              <UserCheck className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => rejectFollow(req.id)} className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
            {/* Avatar upload */}
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

            {/* Basic Info */}
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

            {/* Bio */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Βιογραφικό</label>
              <Textarea value={editForm.bio} onChange={(e) => setEditForm(p => ({ ...p, bio: e.target.value }))} className="bg-secondary/50 resize-none" placeholder="Πες μας λίγα πράγματα για σένα..." rows={3} maxLength={500} />
              <p className="text-xs text-muted-foreground mt-0.5 text-right">{editForm.bio.length}/500</p>
            </div>

            {/* Location & Nationality */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Τοποθεσία</label>
                <Input value={editForm.location} onChange={(e) => setEditForm(p => ({ ...p, location: e.target.value }))} className="bg-secondary/50" placeholder="π.χ. Αθήνα, Θεσσαλονίκη..." />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Εθνικότητα</label>
                <Input value={editForm.nationality} onChange={(e) => setEditForm(p => ({ ...p, nationality: e.target.value }))} className="bg-secondary/50" placeholder="π.χ. Έλληνας..." />
              </div>
            </div>

            {/* Racing Info */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-3">Racing Info</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Αγαπημένο Sim Racing Game</label>
                  <Input value={editForm.favorite_sim} onChange={(e) => setEditForm(p => ({ ...p, favorite_sim: e.target.value }))} className="bg-secondary/50" placeholder="π.χ. iRacing, Assetto Corsa..." />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Αγαπημένη Πίστα</label>
                  <Input value={editForm.favorite_track} onChange={(e) => setEditForm(p => ({ ...p, favorite_track: e.target.value }))} className="bg-secondary/50" placeholder="π.χ. Nürburgring, Spa..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Χρόνια SimRacing</label>
                    <Input value={editForm.years_simracing} onChange={(e) => setEditForm(p => ({ ...p, years_simracing: e.target.value }))} className="bg-secondary/50" placeholder="π.χ. 3, 5-10..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-3">Social Links</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Discord Username</label>
                  <Input value={editForm.discord_username} onChange={(e) => setEditForm(p => ({ ...p, discord_username: e.target.value }))} className="bg-secondary/50" placeholder="username#0000 ή username..." />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Website / Twitch / YouTube</label>
                  <Input value={editForm.website_url} onChange={(e) => setEditForm(p => ({ ...p, website_url: e.target.value }))} className="bg-secondary/50" placeholder="https://..." />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-3">Ρυθμίσεις Λογαριασμού</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-secondary/50"
                    placeholder="Το email σου..."
                  />
                  {newEmail !== user?.email && newEmail.trim() && (
                    <p className="text-xs text-accent mt-1">Θα σταλεί email επιβεβαίωσης στη νέα διεύθυνση</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Νέος Κωδικός
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-secondary/50"
                    placeholder="Άφησε κενό αν δεν θέλεις αλλαγή..."
                  />
                </div>
                {newPassword && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Επιβεβαίωση Κωδικού</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-secondary/50"
                      placeholder="Επανάληψη κωδικού..."
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive mt-1">Οι κωδικοί δεν ταιριάζουν</p>
                    )}
                  </div>
                )}
                {(newEmail !== user?.email || newPassword) && (
                  <Button
                    onClick={handleUpdateAccount}
                    disabled={savingAccount}
                    variant="outline"
                    className="w-full border-primary/30 text-primary hover:bg-primary/10 gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    {savingAccount ? "Ενημέρωση..." : "Ενημέρωση Λογαριασμού"}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Ακύρωση</Button>
              <Button onClick={handleSaveProfile} disabled={saving} className="bg-gradient-greek text-white hover:brightness-110 gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Αποθήκευση..." : "Αποθήκευση Προφίλ"}
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
