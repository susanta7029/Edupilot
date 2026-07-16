import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto flex items-center justify-between gap-3 rounded-lg border bg-background p-4 shadow-lg dark:border-slate-800"
            >
              <div className="flex items-center gap-2.5">
                {t.type === "success" && <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />}
                {t.type === "error" && <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />}
                {t.type === "info" && <Info className="h-5 w-5 text-blue-500 shrink-0" />}
                <p className="text-sm font-medium">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-muted-foreground hover:text-foreground rounded p-0.5 hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
