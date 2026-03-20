import { useState, useEffect, useMemo, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, MapPin, Gamepad2, Trophy, UserPlus, UserCheck, Clock, X, Filter, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MemberProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  nationality: string | null;
  favorite_sim: string | null;
  setup_type: string | null;
  years_simracing: string | null;
  created_at: string;
}

interface FollowStatus {
  [userId: string]: "none" | "pending" | "accepted";
}

const Members = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [simFilter, setSimFilter] = useState("all");
  const [setupFilter, setSetupFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [followStatuses, setFollowStatuses] = useState<FollowStatus>({});
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (user) fetchFollowStatuses();
  }, [user, profiles]);

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, username, avatar_url, bio, location, nationality, favorite_sim, setup_type, years_simracing, created_at")
      .eq("is_approved", true);
    if (data) setProfiles(data);
    setLoading(false);
  };

  const fetchFollowStatuses = async () => {
    if (!user) return;
    const userIds = profiles.map(p => p.user_id).filter(id => id !== user.id);
    if (userIds.length === 0) return;
    
    const { data } = await supabase
      .from("follows")
      .select("following_id, status")
      .eq("follower_id", user.id)
      .in("following_id", userIds);
    
    const statuses: FollowStatus = {};
    data?.forEach(f => { statuses[f.following_id] = f.status as "pending" | "accepted"; });
    setFollowStatuses(statuses);
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user) {
      toast({ title: "Πρέπει να συνδεθείς", variant: "destructive" });
      return;
    }
    setFollowLoading(targetUserId);
    const currentStatus = followStatuses[targetUserId];

    if (currentStatus === "pending" || currentStatus === "accepted") {
      await supabase.from("follows").delete()
        .eq("follower_id", user.id).eq("following_id", targetUserId);
      setFollowStatuses(prev => ({ ...prev, [targetUserId]: "none" }));
    } else {
      await supabase.from("follows").insert({
        follower_id: user.id,
        following_id: targetUserId,
        status: "pending",
      });
      setFollowStatuses(prev => ({ ...prev, [targetUserId]: "pending" }));
    }
    setFollowLoading(null);
  };

  const uniqueSims = useMemo(() => {
    const sims = new Set<string>();
    profiles.forEach(p => { if (p.favorite_sim) sims.add(p.favorite_sim); });
    return Array.from(sims).sort();
  }, [profiles]);

  const uniqueSetups = useMemo(() => {
    const setups = new Set<string>();
    profiles.forEach(p => { if (p.setup_type) setups.add(p.setup_type); });
    return Array.from(setups).sort();
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    let result = profiles.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        (p.display_name?.toLowerCase().includes(q)) ||
        (p.username?.toLowerCase().includes(q)) ||
        (p.location?.toLowerCase().includes(q)) ||
        (p.nationality?.toLowerCase().includes(q));
      const matchesSim = simFilter === "all" || p.favorite_sim === simFilter;
      const matchesSetup = setupFilter === "all" || p.setup_type === setupFilter;
      return matchesSearch && matchesSim && matchesSetup;
    });

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "name") return (a.display_name || "").localeCompare(b.display_name || "");
      return 0;
    });

    return result;
  }, [profiles, searchQuery, simFilter, setupFilter, sortBy]);

  const activeFilters = (simFilter !== "all" ? 1 : 0) + (setupFilter !== "all" ? 1 : 0);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <ScrollToTop />

      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-32 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Κοινότητα</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-['Orbitron'] mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Μέλη
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Γνώρισε τα μέλη της κοινότητας, βρες sim racers κοντά σου και κάνε follow!
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-4xl mx-auto space-y-4"
          >
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Αναζήτηση με όνομα, username, τοποθεσία..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-card border-border text-base"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Φίλτρα
                {activeFilters > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">{activeFilters}</Badge>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-card border border-border">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Αγαπημένο Sim</label>
                      <Select value={simFilter} onValueChange={setSimFilter}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Όλα</SelectItem>
                          {uniqueSims.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Setup</label>
                      <Select value={setupFilter} onValueChange={setSetupFilter}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Όλα</SelectItem>
                          {uniqueSetups.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Ταξινόμηση</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Νεότερα πρώτα</SelectItem>
                          <SelectItem value="oldest">Παλαιότερα πρώτα</SelectItem>
                          <SelectItem value="name">Αλφαβητικά</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {activeFilters > 0 && (
                      <div className="sm:col-span-3">
                        <Button variant="ghost" size="sm" onClick={() => { setSimFilter("all"); setSetupFilter("all"); }}>
                          <X className="w-3 h-3 mr-1" /> Καθαρισμός φίλτρων
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-sm text-muted-foreground">
              {filteredProfiles.length} {filteredProfiles.length === 1 ? "μέλος" : "μέλη"}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Members Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-card animate-pulse" />
              ))}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Δεν βρέθηκαν μέλη</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Δοκίμασε διαφορετικά φίλτρα ή αναζήτηση</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredProfiles.map((member, index) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    index={index}
                    currentUserId={user?.id}
                    followStatus={followStatuses[member.user_id] || "none"}
                    followLoading={followLoading === member.user_id}
                    onFollow={() => handleFollow(member.user_id)}
                    getInitials={getInitials}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

interface MemberCardProps {
  member: MemberProfile;
  index: number;
  currentUserId?: string;
  followStatus: "none" | "pending" | "accepted";
  followLoading: boolean;
  onFollow: () => void;
  getInitials: (name: string | null) => string;
}

const MemberCard = forwardRef<HTMLDivElement, MemberCardProps>(({ member, index, currentUserId, followStatus, followLoading, onFollow, getInitials }, ref) => {
  const isOwnProfile = currentUserId === member.user_id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Link to={`/profile/${member.user_id}`} className="block group">
        <div className="relative rounded-2xl bg-card border border-border overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.2)]">
          {/* Top gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary opacity-60 group-hover:opacity-100 transition-opacity" />

          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />

          <div className="p-5 relative">
            {/* Avatar & Follow */}
            <div className="flex items-start justify-between mb-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary to-accent rounded-full opacity-0 group-hover:opacity-60 blur-sm transition-opacity duration-500" />
                <Avatar className="w-16 h-16 relative border-2 border-border group-hover:border-primary/50 transition-colors">
                  <AvatarImage src={member.avatar_url || ""} alt={member.display_name || ""} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-bold text-lg">
                    {getInitials(member.display_name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {!isOwnProfile && currentUserId && (
                <Button
                  size="sm"
                  variant={followStatus === "accepted" ? "secondary" : followStatus === "pending" ? "outline" : "default"}
                  className="h-8 text-xs gap-1"
                  disabled={followLoading}
                  onClick={e => { e.preventDefault(); e.stopPropagation(); onFollow(); }}
                >
                  {followStatus === "accepted" ? (
                    <><UserCheck className="w-3 h-3" /> Following</>
                  ) : followStatus === "pending" ? (
                    <><Clock className="w-3 h-3" /> Pending</>
                  ) : (
                    <><UserPlus className="w-3 h-3" /> Follow</>
                  )}
                </Button>
              )}
            </div>

            {/* Name & Username */}
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate text-lg">
              {member.display_name || "Χρήστης"}
            </h3>
            {member.username && (
              <p className="text-sm text-muted-foreground truncate">@{member.username}</p>
            )}

            {/* Bio */}
            {member.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{member.bio}</p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {member.location && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                  <MapPin className="w-3 h-3" /> {member.location}
                </span>
              )}
              {member.favorite_sim && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                  <Gamepad2 className="w-3 h-3" /> {member.favorite_sim}
                </span>
              )}
              {member.setup_type && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-accent/10 text-accent border border-accent/20">
                  <Trophy className="w-3 h-3" /> {member.setup_type}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Members;
