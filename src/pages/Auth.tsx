import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import gsrLogo from "@/assets/gsr-logo.png";

// Animated racing track lines on canvas
const RacingBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    // Racing lines that streak across
    interface RacingLine {
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
      hue: number;
      width: number;
    }

    const lines: RacingLine[] = [];
    for (let i = 0; i < 25; i++) {
      lines.push({
        x: Math.random() * w(),
        y: Math.random() * h(),
        speed: 2 + Math.random() * 6,
        length: 40 + Math.random() * 120,
        opacity: 0.1 + Math.random() * 0.4,
        hue: Math.random() > 0.7 ? 30 : 1, // red or orange
        width: 1 + Math.random() * 2,
      });
    }

    // Grid dots
    interface GridDot {
      x: number;
      y: number;
      baseOpacity: number;
      phase: number;
    }

    const dots: GridDot[] = [];
    const spacing = 40;
    for (let x = 0; x < w(); x += spacing) {
      for (let y = 0; y < h(); y += spacing) {
        dots.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          baseOpacity: 0.05 + Math.random() * 0.15,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    let animId: number;
    let time = 0;

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, w(), h());

      // Draw pulsing grid dots
      dots.forEach((d) => {
        const pulse = Math.sin(time * 1.5 + d.phase) * 0.5 + 0.5;
        const opacity = d.baseOpacity * (0.5 + pulse * 0.5);
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(1, 100%, 50%, ${opacity})`;
        ctx.fill();
      });

      // Draw racing streak lines
      lines.forEach((l) => {
        const grad = ctx.createLinearGradient(l.x, l.y, l.x - l.length, l.y);
        grad.addColorStop(0, `hsla(${l.hue}, 100%, 50%, ${l.opacity})`);
        grad.addColorStop(1, `hsla(${l.hue}, 100%, 50%, 0)`);

        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x - l.length, l.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = l.width;
        ctx.stroke();

        // Move
        l.x += l.speed;
        if (l.x - l.length > w()) {
          l.x = -l.length;
          l.y = Math.random() * h();
        }
      });

      // Central glow pulse
      const glowSize = 200 + Math.sin(time) * 40;
      const glowGrad = ctx.createRadialGradient(
        w() / 2, h() / 2, 0,
        w() / 2, h() / 2, glowSize
      );
      glowGrad.addColorStop(0, "hsla(1, 100%, 44%, 0.08)");
      glowGrad.addColorStop(0.5, "hsla(30, 100%, 50%, 0.03)");
      glowGrad.addColorStop(1, "hsla(1, 100%, 44%, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w(), h());

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// Small floating particles for left side
const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.3 + 0.05,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(1, 100%, 50%, ${p.o})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "Επιτυχής εγγραφή!", description: "Έλεγξε το email σου για επιβεβαίωση." });
      }
    } catch (error: any) {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Form */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
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
            {forgotPassword ? "Επαναφορά" : isLogin ? "Σύνδεση" : "Εγγραφή"}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            {forgotPassword
              ? "Συμπλήρωσε το email σου για επαναφορά κωδικού"
              : isLogin
              ? "Καλώς ήρθες πίσω στην πίστα"
              : "Γίνε μέλος της κοινότητας"}
          </p>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
            {!isLogin && !forgotPassword && (
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
            )}

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

            {!forgotPassword && (
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
            )}

            {isLogin && !forgotPassword && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setForgotPassword(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Ξέχασες τον κωδικό;
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 bg-gradient-racing font-display text-sm font-semibold tracking-wider text-primary-foreground transition-all hover:shadow-racing hover:brightness-110"
            >
              {loading
                ? "Περίμενε..."
                : forgotPassword
                ? "Αποστολή Link"
                : isLogin
                ? "Σύνδεση"
                : "Εγγραφή"}
            </Button>
          </form>

          {/* Divider */}
          {!forgotPassword && (
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">Ή συνέχισε με</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}

          {/* Social */}
          {!forgotPassword && (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 gap-2 border-border bg-secondary/30 text-foreground hover:bg-secondary/60"
                onClick={() => handleSocialLogin("google")}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 gap-2 border-border bg-secondary/30 text-foreground hover:bg-secondary/60"
                onClick={() => handleSocialLogin("facebook")}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>
          )}

          {/* Toggle */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {forgotPassword ? (
              <button onClick={() => setForgotPassword(false)} className="text-primary hover:underline">
                Πίσω στη σύνδεση
              </button>
            ) : isLogin ? (
              <>
                Δεν έχεις λογαριασμό;{" "}
                <button onClick={() => setIsLogin(false)} className="text-primary font-medium hover:underline">
                  Εγγραφή
                </button>
              </>
            ) : (
              <>
                Έχεις ήδη λογαριασμό;{" "}
                <button onClick={() => setIsLogin(true)} className="text-primary font-medium hover:underline">
                  Σύνδεση
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>

      {/* Right side - Animated Racing Background */}
      <div className="relative hidden w-1/2 overflow-hidden bg-card lg:flex lg:items-center lg:justify-center">
        {/* Animated canvas */}
        <RacingBackground />

        {/* Carbon texture overlay */}
        <div className="absolute inset-0 carbon-texture opacity-30" />

        {/* Diagonal racing stripes */}
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

        {/* Center branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 flex flex-col items-center text-center px-12"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-3xl" />
            <img src={gsrLogo} alt="GSR" className="relative h-28 w-28 object-contain drop-shadow-2xl" />
          </div>

          <h2 className="font-display text-4xl font-bold leading-tight text-foreground">
            Ζήσε την <br />
            <span className="text-gradient-racing">Αδρεναλίνη</span>
          </h2>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
            Η μεγαλύτερη ελληνική κοινότητα sim racing σε περιμένει
          </p>

          {/* Stats row */}
          <div className="mt-10 flex gap-8">
            {[
              { value: "500+", label: "Μέλη" },
              { value: "50+", label: "Αγώνες" },
              { value: "10+", label: "Πρωταθλήματα" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-bold text-gradient-racing">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom checkered flag pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-racing" />
      </div>
    </div>
  );
};

export default Auth;
