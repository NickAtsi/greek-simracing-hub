import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Flag } from "lucide-react";

const navItems = [
  { label: "Αρχική", href: "#" },
  { label: "Live Races", href: "#live-races" },
  { label: "Games Hub", href: "#games-hub" },
  { label: "Podcasts", href: "#podcasts" },
  { label: "Forum", href: "#community" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <a href="#" className="flex items-center gap-2">
          <Flag className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold tracking-wider text-foreground">
            GR<span className="text-primary">SIM</span>RACING
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#community"
            className="bg-gradient-racing rounded-md px-5 py-2 font-display text-xs font-semibold tracking-wider text-primary-foreground transition-shadow hover:shadow-racing"
          >
            ΕΓΓΡΑΦΗ
          </a>
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
          className="border-t border-border bg-background md:hidden"
        >
          <div className="flex flex-col gap-4 px-4 py-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="font-body text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#community"
              className="bg-gradient-racing rounded-md px-5 py-2 text-center font-display text-xs font-semibold tracking-wider text-primary-foreground"
            >
              ΕΓΓΡΑΦΗ
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
