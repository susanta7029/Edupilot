import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ isOpen, open, onClose, title, children, className }: DialogProps) {
  // Support both isOpen and open props for maximum compatibility
  const show = isOpen !== undefined ? isOpen : (open !== undefined ? open : false);

  // Prevent scrolling when dialog is open
  React.useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.35 }}
            className={cn(
              "relative z-10 w-full max-w-lg rounded-xl border bg-background p-6 shadow-lg dark:border-slate-800",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 mb-4 dark:border-slate-800">
              {title && <h3 className="text-lg font-semibold tracking-tight">{title}</h3>}
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto pr-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
