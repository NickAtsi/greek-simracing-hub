import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Timer, Trophy, Volume2, VolumeX, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type GameState = "idle" | "countdown" | "waiting" | "go" | "result" | "too-early";

const F1_LIGHTS_COUNT = 5;

const ReactionTimeGame = () => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [lightsOn, setLightsOn] = useState(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const goTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.15;
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }, [soundEnabled]);

  const startGame = useCallback(() => {
    setGameState("countdown");
    setLightsOn(0);
    setReactionTime(null);

    // Light up one by one
    for (let i = 1; i <= F1_LIGHTS_COUNT; i++) {
      setTimeout(() => {
        setLightsOn(i);
        playBeep();
      }, i * 1000);
    }

    // After all lights on, wait random 1-4s then turn off
    const randomDelay = 1000 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      setLightsOn(0);
      setGameState("go");
      goTimeRef.current = performance.now();
    }, F1_LIGHTS_COUNT * 1000 + randomDelay);
  }, [playBeep]);

  const handleClick = useCallback(() => {
    if (gameState === "idle" || gameState === "result" || gameState === "too-early") {
      startGame();
    } else if (gameState === "countdown") {
      // Clicked too early
      clearTimeout(timeoutRef.current);
      setGameState("too-early");
      setLightsOn(0);
    } else if (gameState === "go") {
      const time = Math.round(performance.now() - goTimeRef.current);
      setReactionTime(time);
      if (!bestTime || time < bestTime) setBestTime(time);
      setGameState("result");
    }
  }, [gameState, startGame, bestTime]);

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
          {/* Instruction text */}
          <p className="text-sm text-muted-foreground mb-8">
            {gameState === "idle" && "Πάτα START για να ξεκινήσει η F1 start sequence"}
            {gameState === "countdown" && "Περίμενε τα φώτα να σβήσουν..."}
            {gameState === "go" && "ΓΟ! ΠΑΤΑ ΤΩΡΑ!"}
            {gameState === "too-early" && "Πολύ νωρίς! Πάτα για να ξαναδοκιμάσεις"}
            {gameState === "result" && "Πάτα για να ξαναδοκιμάσεις"}
          </p>

          {/* F1 Lights - 2 rows of 5 */}
          <div className="flex flex-col gap-3 mb-10">
            {[0, 1].map((row) => (
              <div key={row} className="flex gap-3">
                {Array.from({ length: F1_LIGHTS_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-12 w-12 rounded-full border-2 transition-all duration-200 ${
                      lightsOn > i
                        ? "border-primary bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
                        : "border-border bg-secondary/50"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Result display */}
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
            </motion.div>
          )}

          {gameState === "too-early" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 text-center"
            >
              <p className="font-display text-3xl font-bold text-primary">False Start! 🚫</p>
              <p className="mt-2 text-sm text-muted-foreground">Πρέπει να περιμένεις να σβήσουν τα φώτα</p>
            </motion.div>
          )}

          {/* Start / Click button */}
          <Button
            onClick={handleClick}
            className={`h-16 w-56 font-display text-lg font-bold tracking-wider transition-all ${
              gameState === "go"
                ? "bg-green-600 hover:bg-green-500 text-primary-foreground shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-pulse"
                : "bg-gradient-racing text-primary-foreground hover:shadow-racing hover:brightness-110"
            }`}
          >
            {gameState === "go" ? (
              <><Zap className="mr-2 h-5 w-5" /> ΓΟ!</>
            ) : gameState === "countdown" ? (
              "ΠΕΡΙΜΕΝΕ..."
            ) : (
              <><Timer className="mr-2 h-5 w-5" /> START</>
            )}
          </Button>
        </div>
      </div>

      {/* Leaderboard sidebar */}
      <div className="w-full lg:w-72 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-accent" />
          <h3 className="font-display text-base font-bold text-foreground">Top Reaction Times</h3>
        </div>

        {bestTime ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
              <span className="text-sm text-foreground">Το καλύτερό σου</span>
              <span className={`font-display font-bold ${getTimeColor(bestTime)}`}>{bestTime}ms</span>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Σύνδεσε τον λογαριασμό σου για να αποθηκεύσεις τα σκορ σου!
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No scores yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

const FantasyLeague = () => (
  <div className="rounded-xl border border-border bg-card p-12 text-center">
    <Trophy className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
    <h3 className="font-display text-2xl font-bold text-foreground mb-2">Fantasy League</h3>
    <p className="text-muted-foreground max-w-md mx-auto">
      Σύντομα κοντά σου! Δημιούργησε την ομάδα σου, διαγωνίσου με φίλους και κέρδισε βραβεία.
    </p>
    <p className="mt-4 text-sm text-primary font-display font-semibold">Coming Soon 🏁</p>
  </div>
);

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
            <FantasyLeague />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default GamesHub;
