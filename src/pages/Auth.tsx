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

// Floating particles component
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
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        o: Math.random() * 0.5 + 0.1,
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

const testimonials = [
  {
    text: "Η κοινότητα GSR με βοήθησε να γίνω καλύτερος sim racer. Απίστευτη εμπειρία!",
    name: "Γιάννης Κ.",
    handle: "@giannis_racer",
  },
  {
    text: "Οι αγώνες είναι πάντα καλά οργανωμένοι και η ατμόσφαιρα φανταστική.",
    name: "Μαρία Π.",
    handle: "@maria_speed",
  },
  {
    text: "Βρήκα την ιδανική κοινότητα για sim racing στην Ελλάδα!",
    name: "Νίκος Δ.",
    handle: "@nikos_drift",
  },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const currentTestimonial = testimonials[testimonialIdx];

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="relative flex w-full flex-col items-center justify-center bg-background px-6 lg:w-1/2">
        <Particles />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <img src={gsrLogo} alt="GSR" className="h-10 w-10 object-contain" />
            <span className="font-display text-lg font-bold tracking-wider text-foreground">
              Greek<span className="text-primary">SimRacers</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-2 font-display text-3xl font-bold text-gradient-racing">
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
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full gap-2 border-border bg-secondary/30 text-foreground hover:bg-secondary/60"
                onClick={() => handleSocialLogin("google")}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Σύνδεση με Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full gap-2 border-border bg-secondary/30 text-foreground hover:bg-secondary/60"
                onClick={() => handleSocialLogin("facebook")}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Σύνδεση με Facebook
              </Button>
            </div>
          )}

          {/* Toggle */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
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

      {/* Right side - Hero / Branding */}
      <div className="relative hidden w-1/2 overflow-hidden bg-card lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Gradient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-accent/15 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 px-12 text-center"
        >
          <img src={gsrLogo} alt="GSR" className="mx-auto mb-8 h-24 w-24 object-contain drop-shadow-2xl" />
          <h2 className="font-display text-4xl font-bold leading-tight text-foreground">
            Ζήσε την <br />
            <span className="text-gradient-racing">Αδρεναλίνη</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Η μεγαλύτερη ελληνική κοινότητα sim racing σε περιμένει
          </p>
        </motion.div>

        {/* Testimonial card */}
        <motion.div
          key={testimonialIdx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-12 left-12 right-12 rounded-xl border border-border bg-background/60 backdrop-blur-md p-5"
        >
          <p className="text-sm text-foreground italic">"{currentTestimonial.text}"</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-racing text-xs font-bold text-primary-foreground">
              {currentTestimonial.name[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{currentTestimonial.name}</p>
              <p className="text-xs text-muted-foreground">{currentTestimonial.handle}</p>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-3.5 w-3.5 fill-accent" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="mt-3 flex justify-center gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === testimonialIdx ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
