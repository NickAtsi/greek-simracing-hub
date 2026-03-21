import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, LogOut, Shield, ChevronDown, Newspaper, MessageSquare, Trophy, Bell, User, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import gsrLogo from "@/assets/gsr-logo.png";
import SocialIcon from "@/components/SocialIcon";
import { supabase } from "@/integrations/supabase/client";

const communityItems = [
  { label: "Άρθρα", href: "/articles", icon: Newspaper, desc: "Νέα & αναλύσεις" },
  { label: "Forum", href: "/forum", icon: MessageSquare, desc: "Συζητήσεις" },
  { label: "Αγώνες", href: "/championships", icon: Trophy, desc: "Πρωταθλήματα" },
];

const navItems = [
  { label: "Αρχική", href: "/home" },
  { label: "Κοινότητα", href: "#", dropdown: true },
  { label: "Μέλη", href: "/members" },
  { label: "Games Hub", href: "/games-hub" },
  { label: "Podcasts", href: "/podcasts" },
  { label: "Shop", href: "/shop" },
  { label: "Επικοινωνία", href: "/contact" },
];

const socials = [
  { label: "Discord", href: "https://discord.gg/v5RsBTnPpY", hoverColor: "#5865F2", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
  )},
  { label: "YouTube", href: "https://www.youtube.com/@GreekSimracers", hoverColor: "#FF0000", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  )},
  { label: "Facebook", href: "https://www.facebook.com/groups/greeksimracers", hoverColor: "#1877F2", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  )},
  { label: "Spotify", href: "https://open.spotify.com/show/62c9vN8ZOT4unAzzJmtOXD?si=7d89b491724e41fd", hoverColor: "#1DB954", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
  )},
];

const NavLinkItem = ({ item, active, onClick }: { item: typeof navItems[0]; active: boolean; onClick?: () => void }) => {
  const inner = (
    <motion.span className="relative block" whileHover={{ rotate: [0, -3, 3, -2, 2, 0], transition: { duration: 0.4, ease: "easeInOut" } }}>
      {item.label}
      {active && (
        <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-racing rounded-full"
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
      )}
    </motion.span>
  );

  const className = `group relative px-4 py-2 rounded-lg font-body text-sm font-medium transition-all overflow-hidden ${
    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
  }`;

  const sharedChildren = (
    <>
      <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 blur-sm" />
      <span className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg">
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
      </span>
      {inner}
    </>
  );

  return item.href.startsWith("/") && !item.href.includes("#") ? (
    <Link to={item.href} onClick={onClick} className={className}>{sharedChildren}</Link>
  ) : (
    <a href={item.href} onClick={onClick} className={className}>{sharedChildren}</a>
  );
};

const CommunityDropdown = ({ onNavigate }: { onNavigate?: () => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const isActive = communityItems.some(i => location.pathname.startsWith(i.href));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleEnter = () => { clearTimeout(timeoutRef.current); setOpen(true); };
  const handleLeave = () => { timeoutRef.current = setTimeout(() => setOpen(false), 150); };

  return (
    <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        onClick={() => setOpen(!open)}
        className={`group relative flex items-center gap-1 px-4 py-2 rounded-lg font-body text-sm font-medium transition-all overflow-hidden ${
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 blur-sm" />
        <span className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg">
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
        </span>
        <motion.span className="relative" whileHover={{ rotate: [0, -3, 3, -2, 2, 0], transition: { duration: 0.4 } }}>
          Κοινότητα
          {isActive && (
            <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-racing rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
          )}
        </motion.span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="relative">
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-xl shadow-primary/5 overflow-hidden z-50"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="p-1.5 relative">
              {communityItems.map((item, i) => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.href);
                return (
                  <motion.div key={item.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.2 }}>
                    <Link
                      to={item.href}
                      onClick={() => { setOpen(false); onNavigate?.(); }}
                      className={`group/item flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                        active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                        active ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground group-hover/item:bg-primary/10 group-hover/item:text-primary"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-tight">{item.label}</span>
                        <span className="text-[11px] text-muted-foreground leading-tight">{item.desc}</span>
                      </div>
                      {active && <motion.div layoutId="dropdown-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      supabase.from("user_roles" as any).select("role").eq("user_id", user.id).eq("role", "admin").single()
        .then(({ data }) => setIsAdmin(!!data));
      fetchNotifications();
      const channel = supabase.channel('notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
          fetchNotifications();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } else {
      setIsAdmin(false);
      setUnreadCount(0);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    const notifs = (data as any[]) || [];
    setNotifications(notifs);
    setUnreadCount(notifs.filter((n: any) => !n.read).length);
  };

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;
    await supabase.from("notifications" as any).update({ read: true } as any).eq("user_id", user.id).eq("read", false);
    fetchNotifications();
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) => {
    if (href === "/home") return location.pathname === "/home" || location.pathname === "/";
    if (href.startsWith("/#")) return location.pathname === "/home" && location.hash === href.slice(1);
    return location.pathname === href;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-2xl"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/home" className="group relative flex items-center gap-2.5">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} className="relative flex items-center gap-2.5">
            <span className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/0 via-primary/20 to-accent/0 blur-md" />
            <span className="absolute -left-5 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-70 transition-all duration-300 group-hover:-translate-x-1">
              <span className="w-4 h-[2px] rounded-full bg-primary/60" />
              <span className="w-3 h-[1px] rounded-full bg-primary/40" />
            </span>
            <div className="relative overflow-hidden rounded-lg">
              <img src={gsrLogo} alt="Greek SimRacers" className="relative h-9 w-9 object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_12px_hsl(var(--primary)/0.4)]" />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            </div>
            <span className="font-display text-base font-bold tracking-wider text-foreground">
              Greek<span className="text-gradient-racing">SimRacers</span>
            </span>
          </motion.div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) =>
            item.dropdown ? (
              <CommunityDropdown key={item.label} />
            ) : (
              <NavLinkItem key={item.label} item={item} active={isActive(item.href)} />
            )
          )}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-3 border-r border-border/50 pr-3">
            {socials.map((s) => (
              <SocialIcon key={s.label} href={s.href} label={s.label} icon={s.icon} hoverColor={s.hoverColor} size="sm" />
            ))}
          </div>

          <ThemeToggle />

          {user ? (
            <>
              {/* Notifications Bell */}
              <div ref={notifsRef} className="relative">
                <button
                  onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markAllRead(); }}
                  className="relative flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-[16px] rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotifs && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-border/50 flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">Ειδοποιήσεις</span>
                        <Link to="/notifications" onClick={() => setShowNotifs(false)} className="text-xs text-primary hover:text-primary/80 transition-colors">
                          Προβολή όλων
                        </Link>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center text-muted-foreground text-sm py-8">Καμία ειδοποίηση</p>
                        ) : (
                          notifications.map((n: any) => (
                            <Link
                              key={n.id}
                              to={n.link || "#"}
                              onClick={() => setShowNotifs(false)}
                              className={`block px-3 py-2.5 text-sm border-b border-border/30 hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                            >
                              <p className="font-medium text-foreground text-xs">{n.title}</p>
                              <p className="text-muted-foreground text-xs mt-0.5">{n.message}</p>
                              <p className="text-muted-foreground/60 text-[10px] mt-1">{new Date(n.created_at).toLocaleDateString("el-GR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                            </Link>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/profile" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors truncate max-w-[150px]">
                <User className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{user.user_metadata?.full_name || user.email?.split("@")[0]}</span>
              </Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/20">
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-lg border border-border/60 px-4 py-2 text-xs font-medium text-muted-foreground transition-all hover:text-foreground hover:border-border"
              >
                <LogOut className="h-3.5 w-3.5" />
                Έξοδος
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-2 rounded-lg bg-gradient-greek px-5 py-2 font-body text-sm font-medium text-primary-foreground transition-all hover:brightness-110 hover:shadow-racing"
            >
              <LogIn className="h-3.5 w-3.5" />
              Σύνδεση
            </Link>
          )}
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="text-foreground lg:hidden">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/50 bg-background/95 backdrop-blur-xl lg:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4 max-h-[80vh] overflow-y-auto">
              {navItems.filter(i => !i.dropdown).map((item) => (
                <NavLinkItem key={item.label} item={item} active={isActive(item.href)} onClick={() => setIsOpen(false)} />
              ))}
              {/* Mobile community items inline */}
              <div className="px-4 py-1 text-xs font-display text-muted-foreground uppercase tracking-wider">Κοινότητα</div>
              {communityItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname.startsWith(item.href) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-2 px-4">
                {socials.map((s) => (
                  <SocialIcon key={s.label} href={s.href} label={s.label} icon={s.icon} hoverColor={s.hoverColor} size="sm" />
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-border/50 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2.5 text-sm font-medium text-foreground">
                      <User className="h-4 w-4" /> Προφίλ
                    </Link>
                    <Link to="/notifications" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2.5 text-sm font-medium text-foreground">
                      <Bell className="h-4 w-4" /> Ειδοποιήσεις
                      {unreadCount > 0 && (
                        <span className="ml-auto flex items-center justify-center h-5 min-w-[20px] rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary">
                        <Shield className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { signOut(); setIsOpen(false); }} className="w-full rounded-lg border border-border/60 px-4 py-3 text-center font-body text-sm text-muted-foreground">
                      Αποσύνδεση
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)} className="block rounded-lg bg-gradient-racing px-4 py-3 text-center font-body text-sm font-medium text-primary-foreground">
                    Σύνδεση
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
