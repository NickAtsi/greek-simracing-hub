import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Gamepad2, Monitor, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import gsrLogo from "@/assets/gsr-logo.png";
import RacingBackground from "@/components/RacingBackground";
import Particles from "@/components/Particles";

// Right panel with 3D mouse-reactive text
const RightPanel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative hidden w-1/2 overflow-hidden bg-card lg:flex lg:items-center lg:justify-center"
      style={{ perspective: "1000px" }}
    >
      <RacingBackground />
      <div className="absolute inset-0 carbon-texture opacity-30" />
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -right-1/4 h-[200%] w-1/3 rotate-12 opacity-[0.03]"
          style={{ background: "var(--gradient-racing)" }}
        />
        <div
          className="absolute -top-1/2 right-1/4 h-[200%] w-px rotate-12 opacity-10"
          style={{ background: "hsl(var(--primary))" }}
        />
        <div
          className="absolute -top-1/2 right-[35%] h-[200%] w-px rotate-12 opacity-[0.06]"
          style={{ background: "hsl(var(--accent))" }}
        />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-12"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div className="relative mb-8" style={{ translateZ: 60 }}>
          <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-3xl" />
          <img src={gsrLogo} alt="GSR" className="relative h-28 w-28 object-contain drop-shadow-2xl" />
        </motion.div>
        <motion.h2
          className="font-display text-5xl font-bold leading-tight text-foreground"
          style={{
            translateZ: 40,
            textShadow: "0 4px 12px hsla(1, 100%, 44%, 0.3), 0 8px 30px hsla(0, 0%, 0%, 0.5)",
          }}
        >
          Ζήσε την <br />
          <span
            className="text-gradient-racing"
            style={{
              textShadow: "none",
              filter: "drop-shadow(0 4px 20px hsla(1, 100%, 50%, 0.4))",
            }}
          >
            Αδρεναλίνη
          </span>
        </motion.h2>
        <motion.p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed" style={{ translateZ: 20 }}>
          Η μεγαλύτερη ελληνική κοινότητα sim racing σε περιμένει
        </motion.p>
        <motion.div className="mt-10 flex gap-8" style={{ translateZ: 30 }}>
          {[{ value: "1000+", label: "Μέλη" }].map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="font-display text-2xl font-bold text-gradient-racing"
                style={{ filter: "drop-shadow(0 2px 8px hsla(1, 100%, 50%, 0.3))" }}
              >
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-racing" />
    </div>
  );
};

const SIM_OPTIONS = [
  "Assetto Corsa",
  "Assetto Corsa Competizione",
  "iRacing",
  "rFactor 2",
  "Gran Turismo",
  "Forza Motorsport",
  "F1 Series",
  "Automobilista 2",
  "Le Mans Ultimate",
  "Άλλο",
];

const SETUP_OPTIONS = [
  { value: "wheel", label: "Τιμόνι", icon: "🎮" },
  { value: "controller", label: "Controller", icon: "🕹️" },
  { value: "keyboard", label: "Πληκτρολόγιο", icon: "⌨️" },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  // Extra signup fields
  const [signupStep, setSignupStep] = useState(1);
  const [favoriteSim, setFavoriteSim] = useState("");
  const [setupType, setSetupType] = useState("");
  const [favoriteTrack, setFavoriteTrack] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  const resetForm = () => {
    setSignupStep(1);
    setFavoriteSim("");
    setSetupType("");
    setFavoriteTrack("");
    setDisplayName("");
    setEmail("");
    setPassword("");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (forgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({ title: "Έλεγξε το email σου", description: "Σου στείλαμε link για επαναφορά κωδικού." });
        setForgotPassword(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // Sign up - no email confirmation needed, admin will approve
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: displayName },
          },
        });
        if (error) throw error;

        // Update profile with extra fields
        if (data.user) {
          await supabase
            .from("profiles")
            .update({
              favorite_sim: favoriteSim || null,
              setup_type: setupType || null,
              favorite_track: favoriteTrack || null,
              display_name: displayName || null,
            })
            .eq("user_id", data.user.id);
        }

        // Sign out immediately - admin needs to approve first
        await supabase.auth.signOut();
        toast({
          title: "Εγγραφή επιτυχής! 🏁",
          description: "Ο λογαριασμός σου αναμένει έγκριση από τους διαχειριστές.",
        });
        resetForm();
      }
    } catch (error: any) {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const canGoStep2 = displayName.trim().length > 0 && email.trim().length > 0 && password.length >= 6;

  // Render signup step 1 (account info)
  const renderSignupStep1 = () => (
    <>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ονοματεπώνυμο</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Το όνομά σου"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="h-11 pl-10 bg-secondary/50 border-border focus:border-primary"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Το email σου"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 pl-10 bg-secondary/50 border-border focus:border-primary"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Κωδικός</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Τουλάχιστον 6 χαρακτήρες"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 pl-10 pr-10 bg-secondary/50 border-border focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button
        type="button"
        disabled={!canGoStep2}
        onClick={() => setSignupStep(2)}
        className="h-11 bg-gradient-racing font-display text-sm font-semibold tracking-wider text-primary-foreground transition-all hover:shadow-racing hover:brightness-110"
      >
        Συνέχεια <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </>
  );

  // Render signup step 2 (racing profile)
  const renderSignupStep2 = () => (
    <>
      {/* Favorite Sim */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          <Gamepad2 className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
          Αγαπημένο Sim
        </label>
        <div className="flex flex-wrap gap-2">
          {SIM_OPTIONS.map((sim) => (
            <button
              key={sim}
              type="button"
              onClick={() => setFavoriteSim(sim)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                favoriteSim === sim
                  ? "border-primary bg-primary/20 text-primary shadow-glow"
                  : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {sim}
            </button>
          ))}
        </div>
      </div>

      {/* Setup Type */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          <Monitor className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
          Τύπος Setup
        </label>
        <div className="flex gap-3">
          {SETUP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSetupType(opt.value)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg border p-3 transition-all ${
                setupType === opt.value
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border bg-secondary/30 hover:border-primary/50"
              }`}
            >
              <span className="text-xl">{opt.icon}</span>
              <span
                className={`text-xs font-medium ${setupType === opt.value ? "text-primary" : "text-muted-foreground"}`}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Favorite Track */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          <MapPin className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
          Αγαπημένη Πίστα
        </label>
        <Input
          placeholder="π.χ. Spa-Francorchamps, Monza, Nürburgring..."
          value={favoriteTrack}
          onChange={(e) => setFavoriteTrack(e.target.value)}
          className="h-11 bg-secondary/50 border-border focus:border-primary"
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setSignupStep(1)}
          className="h-11 flex-1 border-border text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Πίσω
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-11 flex-1 bg-gradient-racing font-display text-sm font-semibold tracking-wider text-primary-foreground transition-all hover:shadow-racing hover:brightness-110"
        >
          {loading ? "Περίμενε..." : "Εγγραφή 🏁"}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        {/* Left side - Form */}
        <div className="relative flex w-full flex-col items-center justify-center px-6 pt-20 lg:w-1/2">
          <Particles />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-md"
          >
            {/* Logo */}
            <div className="mb-10 flex items-center gap-3">
              <img src={gsrLogo} alt="GSR" className="h-10 w-10 object-contain" />
              <span className="font-display text-lg font-bold tracking-wider text-foreground">
                Greek<span className="text-primary">SimRacers</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-1 font-display text-3xl font-bold text-gradient-racing">
              {forgotPassword ? "Επαναφορά" : isLogin ? "Σύνδεση" : signupStep === 1 ? "Εγγραφή" : "Ο Οδηγός σου"}
            </h1>
            <p className="mb-8 text-sm text-muted-foreground">
              {forgotPassword
                ? "Συμπλήρωσε το email σου για επαναφορά κωδικού"
                : isLogin
                  ? "Καλώς ήρθες πίσω στην πίστα"
                  : signupStep === 1
                    ? "Γίνε μέλος της κοινότητας"
                    : "Πες μας λίγα για τον αγωνιστικό σου εαυτό 🏎️"}
            </p>

            {/* Step indicators for signup */}
            {!isLogin && !forgotPassword && (
              <div className="mb-6 flex items-center gap-2">
                <div
                  className={`h-1 flex-1 rounded-full transition-all ${signupStep >= 1 ? "bg-gradient-racing" : "bg-border"}`}
                />
                <div
                  className={`h-1 flex-1 rounded-full transition-all ${signupStep >= 2 ? "bg-gradient-racing" : "bg-border"}`}
                />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
              <AnimatePresence mode="wait">
                {forgotPassword ? (
                  <motion.div
                    key="forgot"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4"
                  >
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Το email σου"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 pl-10 bg-secondary/50 border-border focus:border-primary"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-11 bg-gradient-racing font-display text-sm font-semibold tracking-wider text-primary-foreground transition-all hover:shadow-racing hover:brightness-110"
                    >
                      {loading ? "Περίμενε..." : "Αποστολή Link"}
                    </Button>
                  </motion.div>
                ) : isLogin ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4"
                  >
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Το email σου"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 pl-10 bg-secondary/50 border-border focus:border-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Κωδικός</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Ο κωδικός σου"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-11 pl-10 pr-10 bg-secondary/50 border-border focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setForgotPassword(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Ξέχασες τον κωδικό;
                      </button>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-11 bg-gradient-racing font-display text-sm font-semibold tracking-wider text-primary-foreground transition-all hover:shadow-racing hover:brightness-110"
                    >
                      {loading ? "Περίμενε..." : "Σύνδεση"}
                    </Button>
                  </motion.div>
                ) : signupStep === 1 ? (
                  <motion.div
                    key="signup1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4"
                  >
                    {renderSignupStep1()}
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4"
                  >
                    {renderSignupStep2()}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Toggle */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
              {forgotPassword ? (
                <button onClick={() => setForgotPassword(false)} className="text-primary hover:underline">
                  Πίσω στη σύνδεση
                </button>
              ) : isLogin ? (
                <>
                  Δεν έχεις λογαριασμό;{" "}
                  <button
                    onClick={() => {
                      setIsLogin(false);
                      resetForm();
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    Εγγραφή
                  </button>
                </>
              ) : (
                <>
                  Έχεις ήδη λογαριασμό;{" "}
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      resetForm();
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    Σύνδεση
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </div>

        {/* Right side - Animated Racing Background */}
        <RightPanel />
      </div>
    </div>
  );
};

export default Auth;
