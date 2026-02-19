import { Link } from "react-router-dom";
import gsrLogo from "@/assets/gsr-logo.png";

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
            <div className="mt-6 flex gap-3">
              {["Discord", "YouTube", "Facebook", "Instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/50 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-primary"
                >
                  {social[0]}
                </a>
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
