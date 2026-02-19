import { Link } from "react-router-dom";
import gsrLogo from "@/assets/gsr-logo.png";
import SocialIcon from "@/components/SocialIcon";

const socials = [
  { label: "Discord", href: "#", hoverColor: "#5865F2", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
  )},
  { label: "YouTube", href: "#", hoverColor: "#FF0000", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  )},
  { label: "Facebook", href: "#", hoverColor: "#1877F2", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  )},
  { label: "Instagram", href: "#", hoverColor: "#E4405F", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
  )},
  { label: "TikTok", href: "#", hoverColor: "#00f2ea", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
  )},
];

const Footer = () => {
  return (
    <footer className="relative border-t border-border/50 bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <img src={gsrLogo} alt="Greek SimRacers" className="h-9 w-9 object-contain" />
              <span className="font-display text-base font-bold tracking-wider text-foreground">
                Greek<span className="text-gradient-racing">SimRacers</span>
              </span>
            </div>
            <p className="max-w-xs font-body text-sm leading-relaxed text-muted-foreground">
              Η #1 ελληνική πλατφόρμα SimRacing. Αγώνες, πληροφόρηση,
              και πάθος για τη virtual μηχανοκίνηση.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map((social) => (
                <SocialIcon key={social.label} href={social.href} label={social.label} icon={social.icon} hoverColor={social.hoverColor} />
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Πλοήγηση",
              links: [
                { label: "Αρχική", href: "/" },
                { label: "Live Races", href: "/#live-races" },
                { label: "Games Hub", href: "/games-hub" },
                { label: "Podcasts", href: "/#podcasts" },
                { label: "Forum", href: "/#community" },
              ],
            },
            {
              title: "Κοινότητα",
              links: [
                { label: "Εγγραφή", href: "/auth" },
                { label: "Κατάταξη", href: "#" },
                { label: "Κανονισμοί", href: "#" },
                { label: "Fantasy League", href: "/games-hub" },
              ],
            },
            {
              title: "Πληροφορίες",
              links: [
                { label: "Σχετικά", href: "#" },
                { label: "Επικοινωνία", href: "#" },
                { label: "Όροι Χρήσης", href: "#" },
                { label: "Απορρήτο", href: "#" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-display text-xs font-semibold uppercase tracking-wider text-foreground">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") && !link.href.includes("#") ? (
                      <Link
                        to={link.href}
                        className="font-body text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="font-body text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border/40 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-body text-xs text-muted-foreground">
            © 2026 GreekSimRacers. Όλα τα δικαιώματα κατοχυρωμένα.
          </p>
          <p className="font-body text-xs text-muted-foreground/50">
            Made with ❤️ in Greece
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
