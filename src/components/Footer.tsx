import { Flag } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-racing-dark py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              <span className="font-display text-sm font-bold tracking-wider text-foreground">
                GR<span className="text-primary">SIM</span>RACING
              </span>
            </div>
            <p className="font-body text-xs leading-relaxed text-muted-foreground">
              Η μεγαλύτερη ελληνική κοινότητα SimRacing. Αγώνες, πληροφόρηση,
              και πάθος για τη virtual μηχανοκίνηση.
            </p>
          </div>

          {[
            {
              title: "Πλοήγηση",
              links: ["Αρχική", "Live Races", "Games Hub", "Podcasts", "Forum"],
            },
            {
              title: "Κοινότητα",
              links: ["Εγγραφή", "Προφίλ", "Κατάταξη", "Κανονισμοί"],
            },
            {
              title: "Ακολουθήστε μας",
              links: ["Discord", "YouTube", "Facebook", "Instagram"],
            },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="mb-4 font-display text-xs font-semibold uppercase tracking-wider text-foreground">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-body text-xs text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="font-body text-[10px] text-muted-foreground">
            © 2026 GRSimRacing. Όλα τα δικαιώματα κατοχυρωμένα.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
