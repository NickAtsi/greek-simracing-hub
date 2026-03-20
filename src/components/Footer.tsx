import { Link } from "react-router-dom";
import gsrLogo from "@/assets/gsr-logo.png";
import SocialIcon from "@/components/SocialIcon";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { settings } = useSiteSettings();

  // Parse custom footer links from site_settings
  let customLinks: { label: string; url: string }[] = [];
  try {
    if (settings.footer_custom_links) {
      customLinks = JSON.parse(settings.footer_custom_links);
    }
  } catch { /* ignore parse errors */ }

  const socials = [
    {
      label: "Discord",
      href: settings.discord_invite || "https://discord.gg/v5RsBTnPpY",
      hoverColor: "#5865F2",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
        </svg>
      ),
    },
    {
      label: "YouTube",
      href: settings.youtube_url || "https://www.youtube.com/@GreekSimracers",
      hoverColor: "#FF0000",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: settings.facebook_url || "https://www.facebook.com/groups/greeksimracers",
      hoverColor: "#1877F2",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: "Spotify",
      href: settings.spotify_url || "https://open.spotify.com/show/62c9vN8ZOT4unAzzJmtOXD",
      hoverColor: "#1DB954",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative border-t border-border/50 bg-background">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid gap-8 sm:gap-10 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 md:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <img src={gsrLogo} alt={settings.site_name} className="h-9 w-9 object-contain" />
              <span className="font-display text-base font-bold tracking-wider text-foreground">
                Greek<span className="text-gradient-racing">SimRacers</span>
              </span>
            </div>
            <p className="max-w-xs font-body text-sm leading-relaxed text-muted-foreground">
              {settings.site_tagline ||
                "Η #1 Ελληνική πλατφόρμα SimRacing. Αγώνες, πληροφόρηση, και πάθος για τη virtual μηχανοκίνηση."}
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map((social) => (
                <SocialIcon
                  key={social.label}
                  href={social.href}
                  label={social.label}
                  icon={social.icon}
                  hoverColor={social.hoverColor}
                />
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Πλοήγηση",
              links: [
                { label: "Αρχική", href: "/" },
                { label: "Άρθρα", href: "/articles" },
                { label: "Forum", href: "/forum" },
                { label: "Games Hub", href: "/games-hub" },
                { label: "Podcasts", href: "/#podcasts" },
                { label: "Shop", href: "/shop" },
              ],
            },
            {
              title: "Κοινότητα",
              links: [
                { label: "Εγγραφή", href: "/auth" },
                { label: "Σχετικά με εμάς", href: "/about" },
                { label: "Επικοινωνία", href: "/contact" },
                { label: "Support", href: "/support" },
              ],
            },
            {
              title: "Νομικά",
              links: [
                { label: "Όροι Χρήσης", href: "/terms" },
                { label: "Πολιτική Απορρήτου", href: "/privacy" },
                { label: "Cookies", href: "/privacy#cookies" },
                { label: "GDPR", href: "/privacy#gdpr" },
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
                    <Link
                      to={link.href}
                      className="font-body text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Custom Links from Admin */}
        {customLinks.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border/40 flex flex-wrap gap-4 justify-center">
            {customLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : undefined}
                rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                className="font-body text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 border-t border-border/40 pt-6 pb-14 sm:pb-0 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} {settings.site_name || "GreekSimRacers"}. Όλα τα δικαιώματα κατοχυρωμένα.
          </p>
          <p className="font-body text-xs text-muted-foreground/50 sm:pr-16">
            {settings.footer_text || "Made with ❤️ in Greece"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
