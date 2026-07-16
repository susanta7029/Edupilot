"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180, scale: theme === "dark" ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="h-5 w-5 text-indigo-400" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? -180 : 0, scale: theme === "dark" ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex items-center justify-center"
      >
        <Sun className="h-5 w-5 text-amber-500" />
      </motion.div>
    </button>
  );
}
