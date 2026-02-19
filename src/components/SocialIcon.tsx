import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SocialIconProps {
  href: string;
  label: string;
  icon: ReactNode;
  hoverColor?: string;
  size?: "sm" | "md";
}

const SocialIcon = ({ href, label, icon, hoverColor, size = "md" }: SocialIconProps) => {
  const [ripple, setRipple] = useState(false);

  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const iconSize = size === "sm" ? "[&_svg]:h-[18px] [&_svg]:w-[18px]" : "[&_svg]:h-5 [&_svg]:w-5";
  const rounded = "rounded-xl";

  const handleClick = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
  };

  const glowColor = hoverColor || "hsl(var(--primary))";

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      onClick={handleClick}
      whileHover={{
        rotate: [0, -5, 5, -3, 3, 0],
        transition: { duration: 0.5, ease: "easeInOut" },
      }}
      whileTap={{ scale: 0.9 }}
      className={`group relative flex ${dim} ${iconSize} items-center justify-center ${rounded} border border-border/50 bg-card/50 text-foreground overflow-hidden`}
    >
      {/* Radial glow pulse background */}
      <motion.span
        className={`absolute inset-0 ${rounded} opacity-0 group-hover:opacity-100`}
        style={{
          background: `radial-gradient(circle, ${glowColor} / 0.15, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Border glow on hover */}
      <motion.span
        className={`absolute inset-0 ${rounded} pointer-events-none`}
        initial={{ boxShadow: "0 0 0px transparent" }}
        whileHover={{
          boxShadow: `0 0 16px ${glowColor} / 0.4, inset 0 0 8px ${glowColor} / 0.1`,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Shine sweep */}
      <span className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </span>

      {/* Floating bounce icon — white default, brand color on hover */}
      <motion.span
        className={`relative z-10 transition-colors duration-300 text-foreground/80 group-hover:text-primary`}
        style={{ ["--hover-color" as string]: hoverColor }}
        animate={{ y: [0, -2, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {icon}
      </motion.span>

      {/* Ripple click effect */}
      <AnimatePresence>
        {ripple && (
          <motion.span
            className={`absolute inset-0 ${rounded} pointer-events-none`}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              background: `radial-gradient(circle, ${glowColor} / 0.3, transparent 60%)`,
            }}
          />
        )}
      </AnimatePresence>
    </motion.a>
  );
};

export default SocialIcon;
