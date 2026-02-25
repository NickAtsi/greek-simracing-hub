import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Headphones, ChevronRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PodcastsSection = () => {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    const { data } = await supabase
      .from("podcast_episodes" as any)
      .select("*")
      .eq("published", true)
      .order("episode_number", { ascending: false })
      .limit(5);
    setPodcasts((data as any[]) || []);
    setLoading(false);
  };

  const getSpotifyEmbedId = (url: string) => {
    const match = url?.match(/episode\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  return (
    <section id="podcasts" className="relative border-t border-border/50 py-32 overflow-hidden">
      <div className="absolute inset-0 carbon-texture opacity-[0.03]" />
      <div className="absolute left-0 top-1/3 h-80 w-80 -translate-y-1/2 rounded-full bg-primary/4 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-16 flex items-end justify-between"
        >
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-8 bg-primary" />
              <span className="font-display text-[10px] tracking-[0.4em] text-primary uppercase">Audio</span>
            </div>
            <h2 className="font-display text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
              <span className="text-gradient-racing">Podcasts</span>
            </h2>
            <p className="mt-3 font-body text-muted-foreground">Ακούστε τα τελευταία επεισόδια</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : podcasts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 rounded-2xl border border-border/50 bg-card/30"
          >
            <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">Δεν υπάρχουν επεισόδια ακόμα.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ο admin μπορεί να προσθέσει επεισόδια από το Admin Panel.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {podcasts.map((ep: any, i: number) => {
              const embedId = ep.spotify_url ? getSpotifyEmbedId(ep.spotify_url) : null;
              return (
                <motion.div
                  key={ep.id}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                  className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm overflow-hidden"
                >
                  {/* Episode Info Row */}
                  <div className="flex items-center gap-5 p-5">
                    {/* Episode number */}
                    <div className="flex-shrink-0 w-10 text-center">
                      <span className="font-display text-[10px] text-muted-foreground">EP</span>
                      <p className="font-display text-base font-black text-foreground/60">
                        #{ep.episode_number || i + 1}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-10 w-px bg-border flex-shrink-0" />

                    {/* Play / Spotify icon */}
                    <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-green-600/10 border border-green-600/30">
                      {ep.spotify_url ? (
                        <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                      ) : (
                        <Play className="h-4 w-4 text-primary ml-0.5" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="rounded bg-secondary/80 px-2 py-0.5 font-display text-[9px] tracking-widest text-muted-foreground uppercase">
                          {ep.category}
                        </span>
                      </div>
                      <h3 className="font-display text-sm font-bold text-foreground">{ep.title}</h3>
                      <p className="font-body text-xs text-muted-foreground">{ep.host}</p>
                    </div>

                    {/* Duration + Spotify link */}
                    <div className="hidden flex-shrink-0 items-center gap-3 sm:flex">
                      {ep.duration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-body text-sm font-medium text-foreground">{ep.duration}</span>
                        </div>
                      )}
                      {ep.spotify_url && (
                        <a
                          href={ep.spotify_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-green-500 hover:text-green-400 transition-colors font-medium"
                        >
                          Spotify <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Spotify Embed Player */}
                  {embedId && (
                    <div className="px-5 pb-4">
                      <iframe
                        src={`https://open.spotify.com/embed/episode/${embedId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-lg"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Podcast CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm"
        >
          <Headphones className="h-5 w-5 text-primary" />
          <p className="font-body text-sm text-muted-foreground">
            Διαθέσιμο σε <span className="text-foreground font-medium">Spotify</span> και{" "}
            <span className="text-foreground font-medium">Apple Podcasts</span>.{" "}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PodcastsSection;
