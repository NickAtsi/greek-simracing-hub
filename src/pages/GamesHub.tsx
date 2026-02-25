import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Timer, Trophy, Volume2, VolumeX, Zap, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
// FantasyLeague coming soon

type GameState = "idle" | "countdown" | "waiting" | "go" | "result" | "too-early";

const F1_LIGHTS_COUNT = 5;

interface LeaderboardEntry {
  id: string;
  user_id: string;
  reaction_time: number;
  created_at: string;
  display_name?: string;
  avatar_url?: string;
}

const ReactionTimeGame = () => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [lightsOn, setLightsOn] = useState(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userBest, setUserBest] = useState<number | null>(null);
  const goTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch leaderboard (top 10 best unique per user)
  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from("reaction_scores")
      .select("id, user_id, reaction_time, created_at")
      .order("reaction_time", { ascending: true })
      .limit(50);

    if (data) {
      // Get unique best per user
      const bestPerUser = new Map<string, typeof data[0]>();
      data.forEach((entry) => {
        if (!bestPerUser.has(entry.user_id) || entry.reaction_time < bestPerUser.get(entry.user_id)!.reaction_time) {
          bestPerUser.set(entry.user_id, entry);
        }
      });
      const top10 = Array.from(bestPerUser.values()).sort((a, b) => a.reaction_time - b.reaction_time).slice(0, 10);

      // Fetch profiles
      const userIds = top10.map((e) => e.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
      setLeaderboard(
        top10.map((e) => ({
          ...e,
          display_name: profileMap.get(e.user_id)?.display_name || "Anonymous",
          avatar_url: profileMap.get(e.user_id)?.avatar_url || undefined,
        }))
      );
    }
  }, []);

  // Fetch user's personal best
  const fetchUserBest = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("reaction_scores")
      .select("reaction_time")
      .eq("user_id", user.id)
      .order("reaction_time", { ascending: true })
      .limit(1);
    if (data && data.length > 0) {
      setUserBest(data[0].reaction_time);
      setBestTime(data[0].reaction_time);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaderboard();
    fetchUserBest();
  }, [fetchLeaderboard, fetchUserBest]);

  // Save score to DB
  const saveScore = useCallback(async (time: number) => {
    if (!user) return;
    await supabase.from("reaction_scores").insert({
      user_id: user.id,
      reaction_time: time,
    });
    // Refresh leaderboard & personal best
    fetchLeaderboard();
    if (!userBest || time < userBest) setUserBest(time);
  }, [user, userBest, fetchLeaderboard]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.15;
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }, [soundEnabled, getAudioCtx]);

  const playGoSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      // Soft chime/ding for "Go!"
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }, [soundEnabled, getAudioCtx]);

  const startGame = useCallback(() => {
    setGameState("countdown");
    setLightsOn(0);
    setReactionTime(null);

    for (let i = 1; i <= F1_LIGHTS_COUNT; i++) {
      setTimeout(() => {
        setLightsOn(i);
        playBeep();
      }, i * 1000);
    }

    const randomDelay = 1000 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      setLightsOn(0);
      setGameState("go");
      goTimeRef.current = performance.now();
      playGoSound();
    }, F1_LIGHTS_COUNT * 1000 + randomDelay);
  }, [playBeep, playGoSound]);

  const handleClick = useCallback(() => {
    if (gameState === "idle" || gameState === "result" || gameState === "too-early") {
      startGame();
    } else if (gameState === "countdown") {
      clearTimeout(timeoutRef.current);
      setGameState("too-early");
      setLightsOn(0);
    } else if (gameState === "go") {
      const time = Math.round(performance.now() - goTimeRef.current);
      setReactionTime(time);
      if (!bestTime || time < bestTime) setBestTime(time);
      setGameState("result");
      saveScore(time);
    }
  }, [gameState, startGame, bestTime, saveScore]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const getTimeColor = (ms: number) => {
    if (ms < 200) return "text-green-400";
    if (ms < 300) return "text-accent";
    return "text-primary";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Game area */}
      <div className="flex-1 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-foreground">F1 Reaction Time Challenge</h3>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex flex-col items-center py-8">
          <p className="text-sm text-muted-foreground mb-8">
            {gameState === "idle" && "Πάτα START για να ξεκινήσει η F1 start sequence"}
            {gameState === "countdown" && "Περίμενε τα φώτα να σβήσουν..."}
            {gameState === "go" && "Go! ΠΑΤΑ ΤΩΡΑ!"}
            {gameState === "too-early" && "Πολύ νωρίς! Πάτα για να ξαναδοκιμάσεις"}
            {gameState === "result" && "Πάτα για να ξαναδοκιμάσεις"}
          </p>

          {/* F1-style light gantry */}
          <div className="flex gap-2 sm:gap-3 mb-10 bg-[hsl(0,0%,8%)] rounded-xl px-4 py-5 border border-[hsl(0,0%,15%)] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            {Array.from({ length: F1_LIGHTS_COUNT }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 items-center bg-[hsl(0,0%,5%)] rounded-lg px-2 py-3 border border-[hsl(0,0%,12%)]"
              >
                {[0, 1].map((row) => (
                  <div
                    key={row}
                    className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 transition-all duration-200 ${
                      lightsOn > i
                        ? "border-red-700 bg-red-600 shadow-[0_0_18px_4px_rgba(220,38,38,0.7),inset_0_-2px_4px_rgba(0,0,0,0.3)]"
                        : "border-[hsl(0,0%,18%)] bg-[hsl(0,0%,10%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>

          {gameState === "result" && reactionTime !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 text-center"
            >
              <p className={`font-display text-5xl font-bold ${getTimeColor(reactionTime)}`}>
                {reactionTime}<span className="text-2xl">ms</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {reactionTime < 200 ? "🏆 Εξαιρετικό!" : reactionTime < 250 ? "🔥 Πολύ καλό!" : reactionTime < 350 ? "👍 Καλό!" : "Προσπάθησε ξανά!"}
              </p>
              {!user && (
                <p className="mt-2 text-xs text-primary/70">Συνδέσου για να αποθηκευτεί το σκορ σου!</p>
              )}
            </motion.div>
          )}

          {gameState === "too-early" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 text-center">
              <p className="font-display text-3xl font-bold text-primary">False Start! 🚫</p>
              <p className="mt-2 text-sm text-muted-foreground">Πρέπει να περιμένεις να σβήσουν τα φώτα</p>
            </motion.div>
          )}

          <Button
            onClick={handleClick}
            className={`h-16 w-56 font-display text-lg font-bold tracking-wider transition-all ${
              gameState === "go"
                ? "bg-green-600 hover:bg-green-500 text-primary-foreground shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-pulse"
                : "bg-gradient-racing text-primary-foreground hover:shadow-racing hover:brightness-110"
            }`}
          >
            {gameState === "go" ? (
              <><Zap className="mr-2 h-5 w-5" /> Go!</>
            ) : gameState === "countdown" ? (
              "ΠΕΡΙΜΕΝΕ..."
            ) : (
              <><Timer className="mr-2 h-5 w-5" /> START</>
            )}
          </Button>
        </div>
      </div>

      {/* Leaderboard sidebar */}
      <div className="w-full lg:w-80 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-accent" />
          <h3 className="font-display text-base font-bold text-foreground">Leaderboard</h3>
        </div>

        {/* Personal best */}
        {user && userBest && (
          <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 p-3 mb-4">
            <span className="text-sm text-foreground font-medium">Το ρεκόρ σου</span>
            <span className={`font-display font-bold ${getTimeColor(userBest)}`}>{userBest}ms</span>
          </div>
        )}

        {!user && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-4 border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => navigate("/auth")}
          >
            <LogIn className="mr-2 h-4 w-4" /> Σύνδεση για σκορ
          </Button>
        )}

        {/* Top 10 */}
        {leaderboard.length > 0 ? (
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors ${
                  entry.user_id === user?.id ? "bg-primary/10 border border-primary/20" : "bg-secondary/30"
                }`}
              >
                <span className={`font-display text-sm font-bold w-6 text-center ${
                  idx === 0 ? "text-yellow-400" : idx === 1 ? "text-gray-300" : idx === 2 ? "text-amber-600" : "text-muted-foreground"
                }`}>
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                </span>
                {entry.avatar_url ? (
                  <img src={entry.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {(entry.display_name || "?")[0]}
                  </div>
                )}
                <span className="flex-1 text-sm text-foreground truncate">{entry.display_name}</span>
                <span className={`font-display text-sm font-bold ${getTimeColor(entry.reaction_time)}`}>
                  {entry.reaction_time}ms
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Κανένα σκορ ακόμα. Γίνε ο πρώτος!</p>
        )}
      </div>
    </div>
  );
};


const GamesHub = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero header */}
      <div className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background" />
        <div className="absolute inset-0 carbon-texture opacity-20" />
        <div className="relative container mx-auto px-4 text-center pt-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Zap className="mx-auto h-10 w-10 text-accent mb-4" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">Games Hub</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Τέστας τον αντανακλάστικων σου και διαχειρίσου την fantasy ομάδα σου!
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 pb-20">
        <Tabs defaultValue="reaction" className="w-full">
          <TabsList className="w-full max-w-lg mx-auto mb-8 h-12 bg-secondary/50 border border-border">
            <TabsTrigger value="reaction" className="flex-1 gap-2 font-display text-sm data-[state=active]:bg-gradient-racing data-[state=active]:text-primary-foreground">
              <Timer className="h-4 w-4" /> Reaction Time
            </TabsTrigger>
            <TabsTrigger value="fantasy" className="flex-1 gap-2 font-display text-sm data-[state=active]:bg-gradient-racing data-[state=active]:text-primary-foreground">
              <Trophy className="h-4 w-4" /> Fantasy League
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reaction">
            <ReactionTimeGame />
          </TabsContent>
          <TabsContent value="fantasy">
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-border bg-card">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="font-display text-2xl font-black text-foreground mb-2">Fantasy League</h2>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                Το Fantasy League έρχεται πολύ σύντομα! Φτιάξε την ομάδα σου, επέλεξε οδηγούς και ανέβα στο leaderboard.
              </p>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 font-display text-sm text-primary font-bold tracking-wider">ΕΡΧΕΤΑΙ ΣΥΝΤΟΜΑ</span>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default GamesHub;
