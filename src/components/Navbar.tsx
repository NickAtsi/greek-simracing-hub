import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import gsrLogo from "@/assets/gsr-logo.png";

const navItems = [
  { label: "Αρχική", href: "/" },
  { label: "Live Races", href: "/#live-races" },
  { label: "Games Hub", href: "/games-hub" },
  { label: "Podcasts", href: "/#podcasts" },
  { label: "Forum", href: "/#community" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href.startsWith("/#")) return location.pathname === "/" && location.hash === href.slice(1);
    return location.pathname === href;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-2xl"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src={gsrLogo} alt="Greek SimRacers" className="h-9 w-9 object-contain" />
          <span className="font-display text-base font-bold tracking-wider text-foreground">
            Greek<span className="text-gradient-racing">SimRacers</span>
          </span>
        </Link>

        {/* Centered Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const className = `relative px-4 py-2 rounded-lg font-body text-sm font-medium transition-all ${
              active
                ? "text-foreground bg-secondary/80"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`;

            return item.href.startsWith("/") && !item.href.includes("#") ? (
              <Link key={item.label} to={item.href} className={className}>
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className={className}>
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Right side - Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                {user.user_metadata?.full_name || user.email}
              </span>
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
              className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-5 py-2 font-body text-sm font-medium text-primary transition-all hover:bg-primary/20 hover:border-primary/60"
            >
              <LogIn className="h-3.5 w-3.5" />
              Σύνδεση
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-foreground md:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-1 px-4 py-4">
            {navItems.map((item) =>
              item.href.startsWith("/") && !item.href.includes("#") ? (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-3 font-body text-sm text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-3 font-body text-sm text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground"
                >
                  {item.label}
                </a>
              )
            )}
            <div className="mt-2 pt-2 border-t border-border/50">
              {user ? (
                <button
                  onClick={() => { signOut(); setIsOpen(false); }}
                  className="w-full rounded-lg border border-border/60 px-4 py-3 text-center font-body text-sm text-muted-foreground"
                >
                  Αποσύνδεση
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-center font-body text-sm font-medium text-primary"
                >
                  Σύνδεση
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
