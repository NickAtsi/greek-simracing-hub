import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SocialIconProps {
  href: string;
  label: string;
  icon: ReactNode;
  hoverColor?: string;
  size?: "sm" | "md";
}

const SocialIcon = ({ href, label, icon, hoverColor = "#e10600", size = "md" }: SocialIconProps) => {
  const [ripple, setRipple] = useState(false);
  const [hovered, setHovered] = useState(false);

  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const rounded = "rounded-xl";

  const handleClick = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
  };

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      onClick={handleClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{
        rotate: [0, -5, 5, -3, 3, 0],
        scale: 1.1,
        transition: { duration: 0.45, ease: "easeInOut" },
      }}
      whileTap={{ scale: 0.88 }}
      className={`group relative flex ${dim} items-center justify-center ${rounded} border border-white/10 bg-white/5 text-white overflow-hidden`}
      style={{
        boxShadow: hovered ? `0 0 18px ${hoverColor}55, inset 0 0 8px ${hoverColor}22` : "none",
        borderColor: hovered ? `${hoverColor}55` : undefined,
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Glow bg fill on hover */}
      <span
        className="absolute inset-0 rounded-xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${hoverColor}30 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Shine sweep */}
      <span className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </span>

      {/* Icon — white by default, brand color on hover */}
      <motion.span
        className="relative z-10 flex items-center justify-center [&_svg]:h-[18px] [&_svg]:w-[18px]"
        style={{
          color: hovered ? hoverColor : "white",
          transition: "color 0.25s ease",
          filter: hovered ? `drop-shadow(0 0 6px ${hoverColor}99)` : "none",
        }}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon}
      </motion.span>

      {/* Ripple click effect */}
      <AnimatePresence>
        {ripple && (
          <motion.span
            className={`absolute inset-0 ${rounded} pointer-events-none`}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ background: `radial-gradient(circle, ${hoverColor}55 0%, transparent 60%)` }}
          />
        )}
      </AnimatePresence>
    </motion.a>
  );
};

export default SocialIcon;
