import { motion } from "framer-motion";

const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
    <motion.div
      className="relative"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
    >
      <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary" />
    </motion.div>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-xs font-display tracking-[0.3em] text-muted-foreground uppercase"
    >
      Φόρτωση...
    </motion.p>
  </div>
);

export default LoadingScreen;
