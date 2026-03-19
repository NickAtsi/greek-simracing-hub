import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Trash2, ExternalLink, UserCheck, UserX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Notifications = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    setFetching(true);
    const { data } = await supabase
      .from("notifications" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setNotifications((data as any[]) || []);
    setFetching(false);
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications" as any).update({ read: true } as any).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications" as any).update({ read: true } as any).eq("user_id", user.id).eq("read", false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: "Όλες σημάνθηκαν ως αναγνωσμένες" });
  };

  const deleteOne = async (id: string) => {
    await supabase.from("notifications" as any).delete().eq("id", id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const deleteAll = async () => {
    if (!user) return;
    await supabase.from("notifications" as any).delete().eq("user_id", user.id);
    setNotifications([]);
    toast({ title: "Όλες οι ειδοποιήσεις διαγράφηκαν" });
  };

  const acceptFollow = async (n: any) => {
    // Find the follow request and accept it
    const { data } = await supabase
      .from("follows" as any)
      .select("id")
      .eq("follower_id", n.from_user_id)
      .eq("following_id", user!.id)
      .eq("status", "pending")
      .single();
    if (data) {
      await supabase.from("follows" as any).update({ status: "accepted" } as any).eq("id", (data as any).id);
      toast({ title: "Αίτημα αποδεκτό! ✅" });
      // Mark notification as read and update it
      await supabase.from("notifications" as any).update({ read: true } as any).eq("id", n.id);
      setNotifications(prev => prev.map(notif =>
        notif.id === n.id ? { ...notif, read: true, _accepted: true } : notif
      ));
    }
  };

  const rejectFollow = async (n: any) => {
    await supabase.from("follows" as any).delete()
      .eq("follower_id", n.from_user_id)
      .eq("following_id", user!.id)
      .eq("status", "pending");
    toast({ title: "Αίτημα απορρίφθηκε" });
    deleteOne(n.id);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("el-GR", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">Ειδοποιήσεις</h1>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center h-6 min-w-[24px] rounded-full bg-primary text-xs font-bold text-primary-foreground px-2">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5">
                <CheckCheck className="h-3.5 w-3.5" />
                Αναγνωσμένα
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={deleteAll} className="gap-1.5 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
                Διαγραφή όλων
              </Button>
            )}
          </div>
        </div>

        {fetching ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Δεν υπάρχουν ειδοποιήσεις</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {notifications.map((n) => {
                const isFollowRequest = n.type === "follow_request" && !n.read && !n._accepted;

                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className={`group relative rounded-xl border p-4 transition-colors ${
                      !n.read
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/50 bg-card/50 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!n.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                          <p className="font-medium text-sm text-foreground">{n.title}</p>
                        </div>
                        {n.message && (
                          <p className="text-sm text-muted-foreground ml-4">{n.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground/60 mt-1.5 ml-4">
                          {formatDate(n.created_at)}
                        </p>

                        {/* Accept / Deny buttons for follow requests */}
                        {isFollowRequest && (
                          <div className="flex items-center gap-2 mt-3 ml-4">
                            <Button
                              size="sm"
                              onClick={() => acceptFollow(n)}
                              className="gap-1.5 bg-gradient-greek text-white hover:brightness-110"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Αποδοχή
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectFollow(n)}
                              className="gap-1.5 text-destructive hover:text-destructive"
                            >
                              <UserX className="h-3.5 w-3.5" />
                              Απόρριψη
                            </Button>
                          </div>
                        )}
                        {n._accepted && (
                          <p className="text-xs text-primary mt-2 ml-4 font-medium">✅ Αποδεκτό</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {n.link && (
                          <Link to={n.link} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                        {!n.read && (
                          <button onClick={() => markRead(n.id)} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button onClick={() => deleteOne(n.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Notifications;
