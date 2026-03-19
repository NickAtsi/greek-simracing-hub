import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, FileText, MessageSquare, Headphones, BarChart3, Settings,
  Trash2, Edit, Plus, Shield, Pin, Lock, Eye, TrendingUp, Activity,
  ChevronRight, Check, X, RefreshCw, BookOpen, Ticket, CheckCircle, Clock, AlertCircle, Send,
  Globe, Link2, Mail, Youtube, Music, ShoppingCart, Package, Upload, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { refreshSettingsCache, defaultSettings } from "@/hooks/useSiteSettings";

type AdminTab = "dashboard" | "users" | "articles" | "forum" | "podcasts" | "categories" | "support" | "shop" | "settings";

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
  const [stats, setStats] = useState({ users: 0, articles: 0, threads: 0, posts: 0, podcasts: 0, pendingUsers: 0, openTickets: 0, totalViews: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [recentThreads, setRecentThreads] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userSort, setUserSort] = useState("newest");
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [forumCats, setForumCats] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [adminReply, setAdminReply] = useState("");
  const [ticketFilter, setTicketFilter] = useState<string>("all");

  // Form states
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<any>(null);
  const [podcastForm, setPodcastForm] = useState({ title: "", description: "", spotify_url: "", host: "", episode_number: "", duration: "", category: "Γενικά", published: true });
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", slug: "", color: "#1565C0", type: "article" });
  const [editProfile, setEditProfile] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({ display_name: "", username: "", favorite_sim: "", favorite_track: "", setup_type: "" });
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({ ...defaultSettings });
  const [confirmAction, setConfirmAction] = useState<{ title: string; description: string; action: () => void } | null>(null);
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [shopOrders, setShopOrders] = useState<any[]>([]);
  const [shopTab, setShopTab] = useState<"products" | "orders">("orders");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", original_price: "", image_url: "", category: "Ρούχα", badge: "", sizes: "", stock: "10", active: true });

  useEffect(() => {
    if (!loading && user) checkAdmin();
  }, [user, loading]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      if (tab === "dashboard") { fetchRecentActivity(); }
      if (tab === "users") fetchUsers();
      if (tab === "articles") fetchArticles();
      if (tab === "forum") fetchThreads();
      if (tab === "podcasts") fetchPodcasts();
      if (tab === "categories") { fetchCategories(); fetchForumCats(); }
      if (tab === "support") fetchSupportTickets();
      if (tab === "shop") { fetchShopProducts(); fetchShopOrders(); }
      if (tab === "settings") fetchSiteSettings();
    }
  }, [isAdmin, tab]);

  const checkAdmin = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_roles" as any).select("role").eq("user_id", user.id).eq("role", "admin").single();
    setIsAdmin(!!data);
  };

  const fetchStats = async () => {
    const [{ count: u }, { count: a }, { count: t }, { count: p }, { count: pods }, { count: pending }, { count: openTix }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("articles" as any).select("*", { count: "exact", head: true }),
      supabase.from("forum_threads" as any).select("*", { count: "exact", head: true }),
      supabase.from("forum_posts" as any).select("*", { count: "exact", head: true }),
      supabase.from("podcast_episodes" as any).select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_approved", false),
      supabase.from("support_tickets" as any).select("*", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
    ]);
    // Get total article views
    const { data: viewsData } = await supabase.from("articles" as any).select("views");
    const totalViews = ((viewsData as any[]) || []).reduce((sum: number, a: any) => sum + (a.views || 0), 0);
    setStats({ users: u || 0, articles: a || 0, threads: t || 0, posts: p || 0, podcasts: pods || 0, pendingUsers: pending || 0, openTickets: openTix || 0, totalViews });
  };

  const fetchRecentActivity = async () => {
    const { data: ru } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(5);
    setRecentUsers((ru as any[]) || []);
    const { data: ra } = await supabase.from("articles" as any).select("id, title, created_at, views, author_id").order("created_at", { ascending: false }).limit(5);
    setRecentArticles((ra as any[]) || []);
    const { data: rt } = await supabase.from("forum_threads" as any).select("id, title, created_at, views, author_id").order("created_at", { ascending: false }).limit(5);
    setRecentThreads((rt as any[]) || []);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers((data as any[]) || []);
    // Fetch roles for all users
    const { data: rolesData } = await supabase.from("user_roles" as any).select("user_id, role");
    const rolesMap: Record<string, string> = {};
    ((rolesData as any[]) || []).forEach((r: any) => {
      if (r.role === "admin") rolesMap[r.user_id] = "Admin";
      else if (r.role === "moderator") rolesMap[r.user_id] = "Moderator";
      else rolesMap[r.user_id] = "Member";
    });
    setUserRoles(rolesMap);
  };

  const fetchArticles = async () => {
    const { data } = await supabase.from("articles" as any).select("*, article_categories(name)").order("created_at", { ascending: false });
    setArticles((data as any[]) || []);
  };

  const fetchThreads = async () => {
    const { data } = await supabase.from("forum_threads" as any).select("*, forum_categories(name)").order("created_at", { ascending: false });
    setThreads((data as any[]) || []);
  };

  const fetchSupportTickets = async () => {
    const { data } = await supabase.from("support_tickets" as any).select("*, profiles!user_id(display_name, username, avatar_url)").order("updated_at", { ascending: false });
    setSupportTickets((data as any[]) || []);
  };

  const fetchTicketMessages = async (ticketId: string) => {
    const { data } = await supabase.from("support_messages" as any).select("*, profiles!sender_id(display_name, username)").eq("ticket_id", ticketId).order("created_at");
    setTicketMessages((data as any[]) || []);
  };

  const fetchSiteSettings = async () => {
    const { data } = await supabase.from("site_settings" as any).select("*");
    const map: Record<string, string> = {};
    ((data as any[]) || []).forEach((s: any) => { map[s.key] = s.value || ""; });
    setSiteSettings(prev => ({ ...prev, ...map }));
  };

  const saveSiteSetting = async (key: string, value: string) => {
    await supabase.from("site_settings" as any).upsert({ key, value, updated_at: new Date().toISOString() } as any, { onConflict: "key" });
    await refreshSettingsCache();
    toast({ title: "Ρύθμιση αποθηκεύτηκε! ✅", description: "Η αλλαγή εφαρμόστηκε αμέσως στο site." });
  };

  const handleAdminReply = async () => {
    if (!user || !selectedTicket || !adminReply.trim()) return;
    await supabase.from("support_messages" as any).insert({ ticket_id: selectedTicket.id, sender_id: user.id, content: adminReply.trim(), is_admin: true });
    await supabase.from("support_tickets" as any).update({ status: "in_progress", updated_at: new Date().toISOString() } as any).eq("id", selectedTicket.id);
    setAdminReply("");
    fetchTicketMessages(selectedTicket.id);
    fetchSupportTickets();
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    await supabase.from("support_tickets" as any).update({ status } as any).eq("id", ticketId);
    fetchSupportTickets();
    if (selectedTicket?.id === ticketId) setSelectedTicket((p: any) => ({ ...p, status }));
    toast({ title: "Κατάσταση ενημερώθηκε!" });
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

  const fetchShopProducts = async () => {
    const { data } = await supabase.from("shop_products" as any).select("*").order("created_at", { ascending: false });
    setShopProducts((data as any[]) || []);
  };

  const fetchShopOrders = async () => {
    const { data: ordersData } = await supabase.from("shop_orders" as any).select("*, shop_order_items(*)").order("created_at", { ascending: false });
    const orders = (ordersData as any[]) || [];
    // Fetch profile display names for each unique user_id
    const userIds = [...new Set(orders.map((o: any) => o.user_id))];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", userIds);
      const profilesMap: Record<string, any> = {};
      ((profilesData as any[]) || []).forEach((p: any) => { profilesMap[p.user_id] = p; });
      orders.forEach((o: any) => { o.profiles = profilesMap[o.user_id] || null; });
    }
    setShopOrders(orders);
  };

  const saveProduct = async () => {
    const payload = {
      name: productForm.name,
      description: productForm.description || null,
      price: parseFloat(productForm.price) || 0,
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      image_url: productForm.image_url || null,
      category: productForm.category,
      badge: productForm.badge || null,
      sizes: productForm.sizes ? productForm.sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
      stock: parseInt(productForm.stock) || 0,
      active: productForm.active,
    };
    if (editingProduct) {
      await supabase.from("shop_products" as any).update(payload as any).eq("id", editingProduct.id);
      toast({ title: "Προϊόν ενημερώθηκε!" });
    } else {
      await supabase.from("shop_products" as any).insert(payload as any);
      toast({ title: "Προϊόν προστέθηκε!" });
    }
    setShowProductForm(false);
    setEditingProduct(null);
    fetchShopProducts();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("shop_products" as any).delete().eq("id", id);
    toast({ title: "Προϊόν διαγράφηκε" });
    fetchShopProducts();
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from("shop_orders" as any).update({ status } as any).eq("id", orderId);
    toast({ title: "Κατάσταση παραγγελίας ενημερώθηκε!" });
    fetchShopOrders();
  };

  const openEditProduct = (p: any) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price?.toString() || "",
      original_price: p.original_price?.toString() || "",
      image_url: p.image_url || "",
      category: p.category || "Ρούχα",
      badge: p.badge || "",
      sizes: (p.sizes || []).join(", "),
      stock: p.stock?.toString() || "0",
      active: p.active ?? true,
    });
    setShowProductForm(true);
  };


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

  const openNewPodcast = () => {
    setEditingPodcast(null);
    setPodcastForm({ title: "", description: "", spotify_url: "", host: "", episode_number: "", duration: "", category: "Γενικά", published: true });
    setShowPodcastForm(true);
  };

  const openEditPodcast = (ep: any) => {
    setEditingPodcast(ep);
    setPodcastForm({
      title: ep.title || "",
      description: ep.description || "",
      spotify_url: ep.spotify_url || "",
      host: ep.host || "",
      episode_number: ep.episode_number?.toString() || "",
      duration: ep.duration || "",
      category: ep.category || "Γενικά",
      published: ep.published ?? true,
    });
    setShowPodcastForm(true);
  };

  const handleSavePodcast = async () => {
    const payload = {
      title: podcastForm.title,
      description: podcastForm.description,
      spotify_url: podcastForm.spotify_url,
      host: podcastForm.host,
      episode_number: parseInt(podcastForm.episode_number) || null,
      duration: podcastForm.duration,
      category: podcastForm.category,
      published: podcastForm.published,
    };

    if (editingPodcast) {
      const { error } = await supabase.from("podcast_episodes" as any).update(payload as any).eq("id", editingPodcast.id);
      if (!error) {
        toast({ title: "Επεισόδιο ενημερώθηκε!" });
        setShowPodcastForm(false);
        setEditingPodcast(null);
        fetchPodcasts();
        fetchStats();
      }
    } else {
      const { error } = await supabase.from("podcast_episodes" as any).insert(payload as any);
      if (!error) {
        toast({ title: "Επεισόδιο προστέθηκε!" });
        setShowPodcastForm(false);
        fetchPodcasts();
        fetchStats();
      }
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

  const toggleApproval = async (userId: string, currentlyApproved: boolean) => {
    await supabase.from("profiles").update({ is_approved: !currentlyApproved } as any).eq("user_id", userId);
    toast({ title: currentlyApproved ? "Χρήστης απορρίφθηκε" : "Χρήστης εγκρίθηκε! ✅" });
    fetchUsers();
  };

  const handleDeleteUser = async (userId: string, displayName: string) => {
    if (!confirm(`Σίγουρα θέλεις να διαγράψεις τον χρήστη "${displayName || userId}";\n\nΑυτή η ενέργεια δεν μπορεί να αναιρεθεί!`)) return;
    const { data, error } = await supabase.functions.invoke("delete-user", { body: { user_id: userId } });
    if (error) {
      toast({ title: "Σφάλμα κατά τη διαγραφή", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ο χρήστης διαγράφηκε επιτυχώς! 🗑️" });
      fetchUsers();
      fetchStats();
    }
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
    { key: "support", icon: Ticket, label: "Support Tickets" },
    { key: "shop", icon: ShoppingCart, label: "Shop" },
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="font-display text-2xl font-black text-foreground">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Καλώς ήρθες πίσω! Ορίστε μια σύνοψη της πλατφόρμας.</p>
                </div>
                <Button onClick={() => { fetchStats(); fetchRecentActivity(); }} variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-3.5 w-3.5" /> Ανανέωση
                </Button>
              </div>

              {/* Primary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Users} label="Σύνολο Χρηστών" value={stats.users} color="bg-primary" />
                <StatCard icon={FileText} label="Άρθρα" value={stats.articles} color="bg-green-700" />
                <StatCard icon={MessageSquare} label="Threads" value={stats.threads} color="bg-purple-700" />
                <StatCard icon={Eye} label="Συνολικές Προβολές" value={stats.totalViews.toLocaleString()} color="bg-blue-700" />
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xl font-display font-black text-amber-500">{stats.pendingUsers}</p>
                    <p className="text-xs text-muted-foreground">Σε αναμονή</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Ticket className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xl font-display font-black text-orange-500">{stats.openTickets}</p>
                    <p className="text-xs text-muted-foreground">Ανοιχτά Tickets</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-display font-black text-foreground">{stats.posts}</p>
                    <p className="text-xs text-muted-foreground">Forum Posts</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Headphones className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xl font-display font-black text-foreground">{stats.podcasts}</p>
                    <p className="text-xs text-muted-foreground">Επεισόδια Podcast</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Recent Users */}
                <div className="rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" /> Πρόσφατοι Χρήστες
                    </h3>
                    <button onClick={() => setTab("users")} className="text-xs text-primary hover:underline">Δες όλους →</button>
                  </div>
                  <div className="divide-y divide-border/50">
                    {recentUsers.map((u: any) => (
                      <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{(u.display_name || "?").slice(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{u.display_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">@{u.username || "—"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {u.is_approved ? (
                            <span className="inline-flex items-center rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-500">Εγκρίθηκε</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-500">Αναμονή</span>
                          )}
                          <span className="text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString("el-GR")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Articles */}
                <div className="rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Πρόσφατα Άρθρα
                    </h3>
                    <button onClick={() => setTab("articles")} className="text-xs text-primary hover:underline">Δες όλα →</button>
                  </div>
                  <div className="divide-y divide-border/50">
                    {recentArticles.length === 0 ? (
                      <p className="px-5 py-8 text-center text-sm text-muted-foreground">Δεν υπάρχουν άρθρα ακόμα.</p>
                    ) : recentArticles.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                          <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("el-GR")}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" /> {a.views || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Threads + Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Threads */}
                <div className="rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" /> Πρόσφατα Threads
                    </h3>
                    <button onClick={() => setTab("forum")} className="text-xs text-primary hover:underline">Δες όλα →</button>
                  </div>
                  <div className="divide-y divide-border/50">
                    {recentThreads.length === 0 ? (
                      <p className="px-5 py-8 text-center text-sm text-muted-foreground">Δεν υπάρχουν threads ακόμα.</p>
                    ) : recentThreads.map((t: any) => (
                      <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                          <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("el-GR")}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" /> {t.views || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl border border-border bg-card">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Γρήγορες Ενέργειες
                    </h3>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {[
                      { label: "Διαχείριση Χρηστών", onClick: () => setTab("users"), icon: Users },
                      { label: "Νέο Podcast", onClick: () => { setTab("podcasts"); setShowPodcastForm(true); }, icon: Headphones },
                      { label: "Support Tickets", onClick: () => setTab("support"), icon: Ticket },
                      { label: "Διαχείριση Άρθρων", onClick: () => setTab("articles"), icon: FileText },
                      { label: "Κατηγορίες", onClick: () => setTab("categories"), icon: BookOpen },
                      { label: "Ρυθμίσεις", onClick: () => setTab("settings"), icon: Settings },
                    ].map((a) => (
                      <button key={a.label} onClick={a.onClick}
                        className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/60 transition-all px-4 py-3 text-sm font-medium text-foreground text-left">
                        <a.icon className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="flex-1">{a.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {tab === "users" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="font-display text-2xl font-black text-foreground">Χρήστες ({users.length})</h1>
                  <p className="text-sm text-muted-foreground">Διαχείριση εγκρίσεων, admin ρόλων και στοιχείων προφίλ.</p>
                </div>
                <Button onClick={fetchUsers} variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-3.5 w-3.5" /> Ανανέωση
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Εγκεκριμένοι</p>
                  <p className="text-2xl font-display font-black text-primary">{users.filter((u: any) => u.is_approved).length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Σε αναμονή</p>
                  <p className="text-2xl font-display font-black text-amber-500">{users.filter((u: any) => !u.is_approved).length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-display font-black text-primary">{Object.values(userRoles).filter(r => r === "Admin").length}</p>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 mb-6">
                <Input
                  placeholder="Αναζήτηση χρήστη, username, sim, track..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="h-10 bg-secondary/50 border-border"
                />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="h-10 rounded-md border border-border bg-secondary/50 px-3 text-sm text-foreground"
                >
                  <option value="all">Όλοι</option>
                  <option value="approved">Εγκεκριμένοι</option>
                  <option value="pending">Σε αναμονή</option>
                  <option value="admin">Admins</option>
                </select>
                <select
                  value={userSort}
                  onChange={(e) => setUserSort(e.target.value)}
                  className="h-10 rounded-md border border-border bg-secondary/50 px-3 text-sm text-foreground"
                >
                  <option value="newest">Νεότεροι πρώτα</option>
                  <option value="oldest">Παλαιότεροι πρώτα</option>
                  <option value="name">Αλφαβητικά</option>
                </select>
                <Button variant="outline" className="h-10" onClick={() => { setUserSearch(""); setUserRoleFilter("all"); setUserSort("newest"); }}>
                  Καθαρισμός φίλτρων
                </Button>
              </div>

              {/* Users Table */}
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/30 border-b border-border">
                      <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase">Χρήστης</th>
                      <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase">Κατάσταση</th>
                      <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase">Ρόλος</th>
                      <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase">Εγγραφή</th>
                      <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase">Sim</th>
                      <th className="text-left px-4 py-3 font-display text-xs text-muted-foreground uppercase">Track</th>
                      <th className="text-right px-4 py-3 font-display text-xs text-muted-foreground uppercase">Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u: any) => {
                        const search = userSearch.toLowerCase();
                        const matchesSearch = !search ||
                          (u.display_name || "").toLowerCase().includes(search) ||
                          (u.username || "").toLowerCase().includes(search) ||
                          (u.favorite_sim || "").toLowerCase().includes(search) ||
                          (u.favorite_track || "").toLowerCase().includes(search);
                        const matchesRole =
                          userRoleFilter === "all" ||
                          (userRoleFilter === "approved" && u.is_approved) ||
                          (userRoleFilter === "pending" && !u.is_approved) ||
                          (userRoleFilter === "admin" && userRoles[u.user_id] === "Admin");
                        return matchesSearch && matchesRole;
                      })
                      .sort((a: any, b: any) => {
                        if (userSort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                        if (userSort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                        return (a.display_name || "").localeCompare(b.display_name || "");
                      })
                      .map((u: any) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{(u.display_name || u.username || "?").slice(0, 1).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium text-foreground block">{u.display_name || "—"}</span>
                              <span className="text-xs text-muted-foreground">@{u.username || "—"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {u.is_approved ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-[10px] font-bold text-green-500 uppercase tracking-wider">
                              Εγκρίθηκε
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                              Αναμονή
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{userRoles[u.user_id] || "Member"}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString("el-GR")}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{u.favorite_sim || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{u.favorite_track || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => setConfirmAction({
                              title: u.is_approved ? "Αφαίρεση έγκρισης" : "Έγκριση χρήστη",
                              description: u.is_approved
                                ? `Σίγουρα θέλεις να αφαιρέσεις την έγκριση του "${u.display_name || u.username}";\nΔεν θα μπορεί πλέον να χρησιμοποιήσει την πλατφόρμα.`
                                : `Σίγουρα θέλεις να εγκρίνεις τον χρήστη "${u.display_name || u.username}";`,
                              action: () => toggleApproval(u.user_id, u.is_approved),
                            })}
                              className={`h-7 px-2.5 text-xs gap-1 ${u.is_approved ? "text-amber-500 border-amber-500/30 hover:bg-amber-500/10" : "text-green-500 border-green-500/30 hover:bg-green-500/10"}`}>
                              {u.is_approved ? "Αφαίρεση έγκρισης" : "Έγκριση"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openEditProfile(u)} className="h-7 px-2.5 text-xs gap-1">
                              <Edit className="h-3 w-3" /> Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setConfirmAction({
                              title: "Χορήγηση Admin δικαιωμάτων",
                              description: `Σίγουρα θέλεις να κάνεις τον "${u.display_name || u.username}" Admin;\n\nΘα έχει πλήρη πρόσβαση στο Admin Panel.`,
                              action: () => handleGrantAdmin(u.user_id),
                            })} className="h-7 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1">
                              Make Admin
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteUser(u.user_id, u.display_name)} className="h-7 px-2.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1">
                              <Trash2 className="h-3 w-3" /> Διαγραφή
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
                <Button onClick={openNewPodcast} className="gap-2 bg-gradient-greek text-white hover:brightness-110">
                  <Plus className="h-4 w-4" /> Νέο Επεισόδιο
                </Button>
              </div>
              <div className="space-y-3">
                {podcasts.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 group hover:border-primary/30 transition-colors">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center">
                      <Headphones className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {!p.published && <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-display">DRAFT</span>}
                        <p className="font-medium text-foreground text-sm truncate">EP#{p.episode_number || "?"} — {p.title}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {p.host && <span>{p.host}</span>}
                        {p.duration && <span>{p.duration}</span>}
                        {p.category && <span className="bg-secondary/80 rounded px-1.5 py-0.5">{p.category}</span>}
                        {p.spotify_url && (
                          <a href={p.spotify_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Spotify ↗</a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEditPodcast(p)} className="h-7 px-2 gap-1 text-xs">
                        <Edit className="h-3 w-3" /> Επεξεργασία
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deletePodcast(p.id)} className="h-7 px-2 text-destructive border-destructive/30">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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

          {/* Support Tickets */}
          {tab === "support" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-black text-foreground">Support Tickets ({supportTickets.length})</h1>
                <Button onClick={fetchSupportTickets} variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {["all","open","in_progress","resolved","closed"].map(f => (
                    <span key={f} onClick={() => setTicketFilter(f)} className={`inline-flex mr-1 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${ticketFilter===f?"bg-primary text-primary-foreground":"bg-secondary text-muted-foreground hover:text-foreground"}`}>
                      {f==="all"?"Όλα":f==="open"?"Ανοιχτά":f==="in_progress"?"Σε Εξέλιξη":f==="resolved"?"Επιλύθηκαν":"Κλειστά"}
                    </span>
                  ))}
                  <div className="mt-3 space-y-2">
                    {supportTickets.filter(t => ticketFilter === "all" || t.status === ticketFilter).map((ticket: any) => {
                      const user_profile = ticket.profiles;
                      return (
                        <button key={ticket.id} onClick={() => { setSelectedTicket(ticket); fetchTicketMessages(ticket.id); }}
                          className={`w-full text-left rounded-xl border p-4 transition-all ${selectedTicket?.id===ticket.id?"border-primary bg-primary/5":"border-border bg-card hover:border-primary/40"}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-display text-sm font-bold text-foreground truncate">{ticket.subject}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{user_profile?.display_name || user_profile?.username || "Άγνωστος"}</p>
                            </div>
                            <span className={`text-xs font-medium flex-shrink-0 ${ticket.status==="open"?"text-amber-400":ticket.status==="in_progress"?"text-blue-400":ticket.status==="resolved"?"text-green-400":"text-muted-foreground"}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(ticket.created_at).toLocaleDateString("el-GR")} · {ticket.priority}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {selectedTicket ? (
                  <div className="rounded-xl border border-border bg-card flex flex-col" style={{ maxHeight: "600px" }}>
                    <div className="p-4 border-b border-border">
                      <p className="font-display text-sm font-bold text-foreground">{selectedTicket.subject}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {["open","in_progress","resolved","closed"].map(s => (
                          <button key={s} onClick={() => updateTicketStatus(selectedTicket.id, s)}
                            className={`text-xs rounded-full px-2 py-0.5 border transition-colors ${selectedTicket.status===s?"bg-primary text-primary-foreground border-primary":"border-border text-muted-foreground hover:text-foreground"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {ticketMessages.map((msg: any) => (
                        <div key={msg.id} className={`flex gap-2 ${msg.is_admin ? "flex-row-reverse" : ""}`}>
                          <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${msg.is_admin?"bg-primary text-primary-foreground":"bg-secondary text-foreground"}`}>
                            {!msg.is_admin && <p className="text-xs font-bold mb-1 opacity-70">{msg.profiles?.display_name || "Χρήστης"}</p>}
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-border flex gap-2">
                      <input value={adminReply} onChange={(e) => setAdminReply(e.target.value)}
                        placeholder="Απάντηση ως admin..." onKeyDown={(e) => { if (e.key==="Enter") handleAdminReply(); }}
                        className="flex-1 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground" />
                      <Button onClick={handleAdminReply} disabled={!adminReply.trim()} className="bg-gradient-greek text-white hover:brightness-110 px-3">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-card flex items-center justify-center h-64 text-muted-foreground text-sm">
                    Επίλεξε ticket για να δεις τη συνομιλία
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shop */}
          {tab === "shop" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="font-display text-2xl font-black text-foreground">Shop Management</h1>
                <div className="flex gap-2">
                  <Button variant={shopTab === "orders" ? "default" : "outline"} size="sm" onClick={() => setShopTab("orders")} className="gap-1"><Package className="h-3.5 w-3.5" /> Παραγγελίες ({shopOrders.length})</Button>
                  <Button variant={shopTab === "products" ? "default" : "outline"} size="sm" onClick={() => setShopTab("products")} className="gap-1"><ShoppingCart className="h-3.5 w-3.5" /> Προϊόντα ({shopProducts.length})</Button>
                  <Button size="sm" onClick={() => { setEditingProduct(null); setProductForm({ name: "", description: "", price: "", original_price: "", image_url: "", category: "Ρούχα", badge: "", sizes: "", stock: "10", active: true }); setShowProductForm(true); }} className="gap-1 bg-primary hover:bg-primary/90"><Plus className="h-3.5 w-3.5" /> Νέο Προϊόν</Button>
                </div>
              </div>

              {shopTab === "orders" && (
                <div className="space-y-3">
                  {shopOrders.length === 0 ? <p className="text-muted-foreground text-center py-12">Δεν υπάρχουν παραγγελίες ακόμα.</p> : shopOrders.map((order: any) => (
                    <div key={order.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</span>
                          <span className="text-sm font-medium text-foreground">{order.full_name}</span>
                          <span className="text-xs text-muted-foreground">{order.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}
                            className="h-7 rounded-md border border-border bg-secondary/50 px-2 text-xs text-foreground">
                            <option value="pending">Σε αναμονή</option>
                            <option value="confirmed">Επιβεβαιωμένη</option>
                            <option value="shipped">Απεστάλη</option>
                            <option value="delivered">Παραδόθηκε</option>
                            <option value="cancelled">Ακυρώθηκε</option>
                          </select>
                          <span className="font-display text-sm font-bold text-primary">€{Number(order.total).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">{order.address}, {order.city} {order.postal_code} {order.phone ? `| ${order.phone}` : ""}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(order.shop_order_items || []).map((item: any) => (
                          <span key={item.id} className="text-[10px] bg-secondary/50 text-foreground px-2 py-1 rounded-lg">{item.product_name} {item.size ? `(${item.size})` : ""} ×{item.quantity}</span>
                        ))}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-2">{new Date(order.created_at).toLocaleString("el-GR")}</div>
                    </div>
                  ))}
                </div>
              )}

              {shopTab === "products" && (
                <div className="space-y-2">
                  {shopProducts.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                      {p.image_url && <img src={p.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm">{p.name}</p>
                          {!p.active && <span className="text-[10px] bg-secondary px-1.5 rounded text-muted-foreground">Ανενεργό</span>}
                          {p.badge && <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded">{p.badge}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{p.category} · €{Number(p.price).toFixed(2)} · Stock: {p.stock}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openEditProduct(p)} className="h-7 px-2 text-xs"><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" onClick={() => deleteProduct(p.id)} className="h-7 px-2 text-xs text-destructive border-destructive/30"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {tab === "settings" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="font-display text-2xl font-black text-foreground">Ρυθμίσεις Site</h1>
                  <p className="text-sm text-muted-foreground">Οι αλλαγές εφαρμόζονται αμέσως σε όλο το site.</p>
                </div>
                <Button onClick={fetchSiteSettings} variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-3.5 w-3.5" /> Ανανέωση
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General */}
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Γενικές Ρυθμίσεις</h3>
                  <div className="space-y-3">
                    {[
                      { key: "site_name", label: "Όνομα Site", placeholder: "Greek SimRacers", icon: Globe },
                      { key: "site_tagline", label: "Tagline / Περιγραφή", placeholder: "Η #1 ελληνική πλατφόρμα SimRacing", icon: FileText },
                      { key: "footer_text", label: "Footer Text", placeholder: "Made with ❤️ in Greece", icon: FileText },
                      { key: "contact_email", label: "Email Επικοινωνίας", placeholder: "info@greeksimracers.gr", icon: Mail },
                      { key: "support_hours", label: "Ώρες Υποστήριξης", placeholder: "Δευτ–Παρ: 10:00–22:00", icon: Clock },
                    ].map(field => (
                      <div key={field.key} className="rounded-xl border border-border bg-card p-4">
                        <label className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <field.icon className="h-3 w-3" /> {field.label}
                        </label>
                        <div className="flex gap-2">
                          <input value={siteSettings[field.key] || ""}
                            onChange={(e) => setSiteSettings(p => ({ ...p, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="flex-1 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground" />
                          <Button size="sm" onClick={() => saveSiteSetting(field.key, siteSettings[field.key] || "")} className="bg-primary hover:bg-primary/90">
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social & Discord */}
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" /> Social Links & Discord</h3>
                  <div className="space-y-3">
                    {[
                      { key: "discord_server_id", label: "Discord Server ID", placeholder: "459797812251590677", icon: MessageSquare },
                      { key: "discord_invite", label: "Discord Invite Link", placeholder: "https://discord.gg/...", icon: MessageSquare },
                      { key: "youtube_url", label: "YouTube URL", placeholder: "https://www.youtube.com/@...", icon: Youtube },
                      { key: "facebook_url", label: "Facebook URL", placeholder: "https://www.facebook.com/...", icon: Users },
                      { key: "spotify_url", label: "Spotify URL", placeholder: "https://open.spotify.com/show/...", icon: Music },
                    ].map(field => (
                      <div key={field.key} className="rounded-xl border border-border bg-card p-4">
                        <label className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <field.icon className="h-3 w-3" /> {field.label}
                        </label>
                        <div className="flex gap-2">
                          <input value={siteSettings[field.key] || ""}
                            onChange={(e) => setSiteSettings(p => ({ ...p, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="flex-1 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground" />
                          <Button size="sm" onClick={() => saveSiteSetting(field.key, siteSettings[field.key] || "")} className="bg-primary hover:bg-primary/90">
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Toggles */}
                  <h3 className="font-display text-sm font-bold text-foreground mt-6 mb-3 flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Λειτουργικές Ρυθμίσεις</h3>
                  <div className="space-y-3">
                    {[
                      { key: "maintenance_mode", label: "Maintenance Mode", desc: "Εμφανίζει μήνυμα συντήρησης στους χρήστες" },
                      { key: "registration_enabled", label: "Εγγραφές Ενεργές", desc: "Επιτρέπει νέες εγγραφές χρηστών" },
                    ].map(toggle => (
                      <div key={toggle.key} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                          <p className="text-xs text-muted-foreground">{toggle.desc}</p>
                        </div>
                        <button
                          onClick={() => {
                            const newVal = siteSettings[toggle.key] === "true" ? "false" : "true";
                            setSiteSettings(p => ({ ...p, [toggle.key]: newVal }));
                            saveSiteSetting(toggle.key, newVal);
                          }}
                          className={`relative h-6 w-11 rounded-full transition-colors ${siteSettings[toggle.key] === "true" ? "bg-primary" : "bg-secondary"}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card transition-transform ${siteSettings[toggle.key] === "true" ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 max-w-2xl">
                <p className="text-xs font-display font-bold text-primary uppercase tracking-wider mb-1">💡 Πληροφορία</p>
                <p className="text-xs text-muted-foreground">Κάθε αλλαγή εφαρμόζεται αμέσως σε: Footer, Σελίδα Επικοινωνίας, Discord Widget, Social Links. Οι ρυθμίσεις αποθηκεύονται στη βάση δεδομένων.</p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Add/Edit Podcast Dialog */}
      <Dialog open={showPodcastForm} onOpenChange={(v) => { setShowPodcastForm(v); if (!v) setEditingPodcast(null); }}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {editingPodcast ? "Επεξεργασία Επεισοδίου" : "Νέο Podcast Επεισόδιο"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Τίτλος *</label>
                <Input placeholder="Τίτλος επεισοδίου" value={podcastForm.title} onChange={(e) => setPodcastForm(p => ({ ...p, title: e.target.value }))} className="bg-secondary/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Αρ. Επεισοδίου</label>
                <Input placeholder="π.χ. 42" type="number" value={podcastForm.episode_number} onChange={(e) => setPodcastForm(p => ({ ...p, episode_number: e.target.value }))} className="bg-secondary/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Διάρκεια</label>
                <Input placeholder="π.χ. 45:30" value={podcastForm.duration} onChange={(e) => setPodcastForm(p => ({ ...p, duration: e.target.value }))} className="bg-secondary/50" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Host</label>
              <Input placeholder="π.χ. Γιάννης Κ." value={podcastForm.host} onChange={(e) => setPodcastForm(p => ({ ...p, host: e.target.value }))} className="bg-secondary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Spotify Episode URL</label>
              <Input placeholder="https://open.spotify.com/episode/..." value={podcastForm.spotify_url} onChange={(e) => setPodcastForm(p => ({ ...p, spotify_url: e.target.value }))} className="bg-secondary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Κατηγορία</label>
              <Input placeholder="π.χ. Γενικά, F1, SimRacing..." value={podcastForm.category} onChange={(e) => setPodcastForm(p => ({ ...p, category: e.target.value }))} className="bg-secondary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Περιγραφή</label>
              <Textarea placeholder="Περιγραφή επεισοδίου..." value={podcastForm.description} onChange={(e) => setPodcastForm(p => ({ ...p, description: e.target.value }))} rows={3} className="resize-none bg-secondary/50" />
            </div>
            {/* Published toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Δημοσιευμένο</p>
                <p className="text-xs text-muted-foreground">Εμφανίζεται στο site</p>
              </div>
              <button
                onClick={() => setPodcastForm(p => ({ ...p, published: !p.published }))}
                className={`relative h-6 w-11 rounded-full transition-colors ${podcastForm.published ? "bg-primary" : "bg-secondary"}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card transition-transform ${podcastForm.published ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => { setShowPodcastForm(false); setEditingPodcast(null); }}>Ακύρωση</Button>
              <Button onClick={handleSavePodcast} disabled={!podcastForm.title.trim()} className="bg-gradient-greek text-white hover:brightness-110 gap-2">
                {editingPodcast ? <><Edit className="h-4 w-4" /> Ενημέρωση</> : <><Plus className="h-4 w-4" /> Προσθήκη</>}
              </Button>
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

      {/* Product Form Dialog */}
      <Dialog open={showProductForm} onOpenChange={(v) => { setShowProductForm(v); if (!v) setEditingProduct(null); }}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">{editingProduct ? "Επεξεργασία Προϊόντος" : "Νέο Προϊόν"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Όνομα προϊόντος *" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} className="bg-secondary/50" />
            <Textarea placeholder="Περιγραφή..." value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} rows={2} className="bg-secondary/50 resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Τιμή *" type="number" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} className="bg-secondary/50" />
              <Input placeholder="Αρχική τιμή" type="number" value={productForm.original_price} onChange={e => setProductForm(p => ({ ...p, original_price: e.target.value }))} className="bg-secondary/50" />
            </div>
            <Input placeholder="Image URL ή key (π.χ. tshirt-black)" value={productForm.image_url} onChange={e => setProductForm(p => ({ ...p, image_url: e.target.value }))} className="bg-secondary/50" />
            <div className="grid grid-cols-3 gap-3">
              <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} className="rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground">
                <option>Ρούχα</option><option>Αξεσουάρ</option><option>Μπρελόκ</option>
              </select>
              <Input placeholder="Badge" value={productForm.badge} onChange={e => setProductForm(p => ({ ...p, badge: e.target.value }))} className="bg-secondary/50" />
              <Input placeholder="Stock" type="number" value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: e.target.value }))} className="bg-secondary/50" />
            </div>
            <Input placeholder="Μεγέθη (S, M, L, XL)" value={productForm.sizes} onChange={e => setProductForm(p => ({ ...p, sizes: e.target.value }))} className="bg-secondary/50" />
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-4 py-3">
              <div><p className="text-sm font-medium text-foreground">Ενεργό</p><p className="text-xs text-muted-foreground">Εμφανίζεται στο Shop</p></div>
              <button onClick={() => setProductForm(p => ({ ...p, active: !p.active }))} className={`relative h-6 w-11 rounded-full transition-colors ${productForm.active ? "bg-primary" : "bg-secondary"}`}>
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card transition-transform ${productForm.active ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowProductForm(false); setEditingProduct(null); }}>Ακύρωση</Button>
              <Button onClick={saveProduct} disabled={!productForm.name || !productForm.price} className="bg-primary hover:bg-primary/90 gap-2">
                {editingProduct ? <><Edit className="h-4 w-4" /> Ενημέρωση</> : <><Plus className="h-4 w-4" /> Προσθήκη</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      <AlertDialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground whitespace-pre-line">
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Ακύρωση</AlertDialogCancel>
            <AlertDialogAction onClick={() => { confirmAction?.action(); setConfirmAction(null); }} className="bg-primary hover:bg-primary/90">
              Επιβεβαίωση
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
