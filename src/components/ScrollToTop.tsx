import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? scrolled / total : 0);
      setVisible(scrolled > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const size = 48;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollUp}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="group fixed bottom-8 right-8 z-50"
          aria-label="Scroll to top"
        >
          {/* Outer glow ring */}
          <motion.span
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 0px hsl(var(--primary)/0)",
                "0 0 20px hsl(var(--primary)/0.5)",
                "0 0 0px hsl(var(--primary)/0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* SVG progress ring */}
          <svg width={size} height={size} className="rotate-[-90deg]">
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="2"
            />
            {/* Progress */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#racing-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />
            <defs>
              <linearGradient id="racing-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center button */}
          <span className="absolute inset-[6px] flex items-center justify-center rounded-full bg-card/90 backdrop-blur-sm border border-border/50 transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/40">
            {/* Shine sweep */}
            <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </span>
            <motion.span
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronUp className="h-5 w-5 text-foreground group-hover:text-primary transition-colors duration-300" />
            </motion.span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
