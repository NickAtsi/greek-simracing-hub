import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Play, Clock, Headphones, ExternalLink, ChevronDown, Mic, Radio, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

// Equalizer bar animation component
const EqualizerBars = ({
  count = 12,
  className = "",
  height = 60,
}: {
  count?: number;
  className?: string;
  height?: number;
}) => {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} style={{ height, minHeight: height }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-t-sm bg-primary"
          style={{ originY: 1 }}
          animate={{
            height: [
              "8px",
              `${Math.min(20 + Math.random() * 40, height)}px`,
              "8px",
              `${Math.min(15 + Math.random() * 35, height)}px`,
              "8px",
            ],
            opacity: [0.4, 1, 0.6, 1, 0.4],
          }}
          transition={{
            duration: 1.2 + Math.random() * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.08,
          }}
        />
      ))}
    </div>
  );
};

// Neon waveform decoration
const NeonWave = () => (
  <svg
    viewBox="0 0 1200 120"
    preserveAspectRatio="none"
    className="absolute bottom-0 left-0 right-0 w-full h-16 opacity-20"
  >
    <motion.path
      d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
      fill="hsl(var(--primary))"
      animate={{
        d: [
          "M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z",
          "M0,80 C200,40 400,80 600,40 C800,0 1000,80 1200,40 L1200,120 L0,120 Z",
          "M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z",
        ],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Όλα");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    const { data } = await supabase
      .from("podcast_episodes" as any)
      .select("*")
      .eq("published", true)
      .order("episode_number", { ascending: false });
    setPodcasts((data as any[]) || []);
    setLoading(false);
  };

  const getSpotifyEmbedId = (url: string) => {
    const match = url?.match(/episode\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const categories = ["Όλα", ...Array.from(new Set(podcasts.map((p: any) => p.category).filter(Boolean)))];

  const filtered = podcasts.filter((p) => {
    const matchCat = selectedCat === "Όλα" || p.category === selectedCat;
    const matchSearch =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.host?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ═══ HERO / INTRO ═══ */}
      <section
        ref={heroRef}
        className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Deep dark background with radial glow */}
        <div className="absolute inset-0 bg-background" />
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          {/* Primary glow orbs */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[140px]" />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] rounded-full bg-accent/4 blur-[100px]" />
        </motion.div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Large equalizer bars - left */}
        <motion.div className="absolute left-0 bottom-0 flex items-end gap-1 px-4 pb-0 opacity-30" style={{ y: heroY }}>
          {[120, 180, 140, 220, 160, 100, 200, 130, 170, 90].map((h, i) => (
            <motion.div
              key={i}
              className="rounded-t-sm"
              style={{ width: "18px", backgroundColor: "hsl(var(--primary))" }}
              animate={{ height: [`${h * 0.6}px`, `${h}px`, `${h * 0.4}px`, `${h * 0.9}px`, `${h * 0.6}px`] }}
              transition={{ duration: 1.5 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
            />
          ))}
        </motion.div>

        {/* Large equalizer bars - right */}
        <motion.div
          className="absolute right-0 bottom-0 flex items-end gap-1 px-4 pb-0 opacity-30"
          style={{ y: heroY }}
        >
          {[100, 170, 90, 200, 130, 220, 140, 180, 120, 160].map((h, i) => (
            <motion.div
              key={i}
              className="rounded-t-sm"
              style={{ width: "18px", backgroundColor: "hsl(var(--primary))" }}
              animate={{ height: [`${h * 0.5}px`, `${h}px`, `${h * 0.7}px`, `${h * 0.4}px`, `${h * 0.5}px`] }}
              transition={{ duration: 1.3 + i * 0.12, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
            />
          ))}
        </motion.div>

        {/* Horizontal scan lines */}
        {[0.25, 0.5, 0.75].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            style={{ top: `${pos * 100}%` }}
            animate={{ opacity: [0.3, 0.8, 0.3], scaleX: [0.6, 1, 0.6] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
          />
        ))}

        {/* Central content */}
        <motion.div
          className="relative z-10 text-center px-4"
          style={{ opacity: heroOpacity }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Top label */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="h-px w-12 bg-primary" />
            <EqualizerBars count={8} height={30} />
            <span className="font-display text-[11px] tracking-[0.5em] text-primary uppercase">Greek SimRacers</span>
            <EqualizerBars count={8} height={30} />
            <div className="h-px w-12 bg-primary" />
          </motion.div>

          {/* Main title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="relative inline-block">
              {/* Glow behind title */}
              <div className="absolute inset-0 blur-3xl bg-primary/20 scale-150" />
              <h1 className="relative font-display text-7xl sm:text-8xl md:text-[10rem] font-black uppercase tracking-tighter leading-none">
                <span className="text-gradient-racing">PODCAST</span>
              </h1>
            </div>
          </motion.div>

          <motion.p
            className="mt-6 font-body text-lg text-muted-foreground max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Συζητάμε για sim racing, τεχνολογία και motorsport
          </motion.p>

          {/* Platform badges */}
          <motion.div
            className="flex items-center justify-center gap-4 mt-8 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            {[
              {
                name: "Spotify",
                color: "text-green-400",
                bg: "bg-green-400/10 border-green-400/30",
                icon: (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                ),
              },
              {
                name: "Apple Podcasts",
                color: "text-purple-400",
                bg: "bg-purple-400/10 border-purple-400/30",
                icon: <Mic className="h-4 w-4" />,
              },
            ].map((p) => (
              <span
                key={p.name}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${p.color} ${p.bg}`}
              >
                {p.icon} {p.name}
              </span>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="mt-16 flex flex-col items-center gap-2 cursor-pointer"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={() => document.getElementById("episodes")?.scrollIntoView({ behavior: "smooth" })}
          >
            <span className="text-xs text-muted-foreground font-display tracking-widest uppercase">Επεισόδια</span>
            <ChevronDown className="h-5 w-5 text-primary" />
          </motion.div>
        </motion.div>

        {/* Bottom wave */}
        <NeonWave />
      </section>

      {/* ═══ EPISODES SECTION ═══ */}
      <section id="episodes" className="relative py-20 overflow-hidden">
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container mx-auto px-4">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px w-8 bg-primary" />
                  <span className="font-display text-[10px] tracking-[0.4em] text-primary uppercase">Episodes</span>
                </div>
                <h2 className="font-display text-3xl font-black uppercase text-foreground">
                  Όλα τα <span className="text-gradient-racing">Επεισόδια</span>
                </h2>
                <p className="text-muted-foreground text-sm mt-1">{podcasts.length} επεισόδια</p>
              </div>

              {/* Search + Filter */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Αναζήτηση..."
                    className="pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-48"
                  />
                </div>
              </div>
            </div>

            {/* Category filter pills */}
            {categories.length > 1 && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedCat === cat ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-border"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Episodes list */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex items-end gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 rounded-t-sm bg-primary/50"
                    animate={{ height: ["8px", "32px", "8px"] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 rounded-2xl border border-border/50 bg-card/30"
            >
              <Headphones className="h-14 w-14 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground font-display font-bold">Δεν βρέθηκαν επεισόδια.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filtered.map((ep: any, i: number) => {
                const embedId = ep.spotify_url ? getSpotifyEmbedId(ep.spotify_url) : null;
                const isExpanded = expandedId === ep.id;

                return (
                  <motion.div
                    key={ep.id}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: Math.min(i * 0.06, 0.4), duration: 0.5 }}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? "border-primary/50 bg-card shadow-lg shadow-primary/5" : "border-border bg-card/70 hover:border-primary/30 hover:bg-card"}`}
                  >
                    {/* Episode row */}
                    <div
                      className="flex items-center gap-4 p-5 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : ep.id)}
                    >
                      {/* Episode number */}
                      <div className="flex-shrink-0 text-center w-10">
                        <span className="font-display text-[9px] text-muted-foreground uppercase">EP</span>
                        <p className="font-display text-lg font-black text-primary/60 leading-none">
                          {String(ep.episode_number || i + 1).padStart(2, "0")}
                        </p>
                      </div>

                      <div className="w-px h-10 bg-border flex-shrink-0" />

                      {/* Play icon / Spotify */}
                      <div
                        className={`flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center transition-all ${isExpanded ? "bg-green-600/20 border border-green-500/50" : "bg-secondary border border-border"}`}
                      >
                        {ep.spotify_url ? (
                          <svg
                            className={`h-5 w-5 transition-colors ${isExpanded ? "text-green-400" : "text-muted-foreground"}`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                          </svg>
                        ) : (
                          <Play
                            className={`h-4 w-4 ml-0.5 transition-colors ${isExpanded ? "text-primary" : "text-muted-foreground"}`}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        {ep.category && (
                          <span className="inline-block text-[9px] font-display tracking-widest text-muted-foreground uppercase bg-secondary/80 rounded px-1.5 py-0.5 mb-1">
                            {ep.category}
                          </span>
                        )}
                        <h3 className="font-display text-sm font-bold text-foreground leading-tight line-clamp-1">
                          {ep.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-0.5">
                          {ep.host && <span className="text-xs text-muted-foreground">{ep.host}</span>}
                          {ep.duration && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {ep.duration}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {ep.spotify_url && (
                          <a
                            href={ep.spotify_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="hidden sm:flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                          >
                            Spotify <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
                            {/* Description */}
                            {ep.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed">{ep.description}</p>
                            )}

                            {/* Equalizer mini animation while expanded */}
                            <div className="flex items-center gap-3">
                              <EqualizerBars count={10} />
                              <span className="text-xs text-muted-foreground font-display tracking-wider">
                                NOW PLAYING
                              </span>
                            </div>

                            {/* Spotify embed */}
                            {embedId && (
                              <iframe
                                src={`https://open.spotify.com/embed/episode/${embedId}?utm_source=generator&theme=0`}
                                width="100%"
                                height="152"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                className="rounded-xl"
                              />
                            )}

                            {/* No embed fallback */}
                            {!embedId && ep.spotify_url && (
                              <a
                                href={ep.spotify_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 rounded-xl bg-green-600/10 border border-green-600/30 hover:bg-green-600/20 transition-colors group"
                              >
                                <svg className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-bold text-green-400">Άκουσε στο Spotify</p>
                                  <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                    {ep.spotify_url}
                                  </p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-green-400 ml-auto" />
                              </a>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      {!loading && podcasts.length > 0 && (
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-primary/5 p-8 text-center overflow-hidden"
            >
              <div className="absolute inset-0 opacity-5 carbon-texture" />
              <div className="absolute left-1/2 top-0 -translate-x-1/2 h-px w-32 bg-gradient-to-r from-transparent via-primary to-transparent" />

              <Headphones className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-display text-2xl font-black text-foreground mb-2">Ακούστε μας παντού</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                Διαθέσιμο σε Spotify και Apple Podcasts. Subscribe για να μη χάσετε κανένα επεισόδιο.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {[
                  {
                    name: "Spotify",
                    color: "bg-green-600/20 border-green-600/40 text-green-400 hover:bg-green-600/30",
                  },
                  {
                    name: "Apple Podcasts",
                    color: "bg-purple-600/20 border-purple-600/40 text-purple-400 hover:bg-purple-600/30",
                  },
                ].map((p) => (
                  <button
                    key={p.name}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${p.color}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Podcasts;
