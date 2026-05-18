import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, Info, Trophy, RotateCcw } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "reward" | "restore";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none px-4 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="px-4 py-3 bg-[var(--bg-secondary)] border border-white/10 rounded-[var(--radius-md)] shadow-lg flex items-center gap-3 backdrop-blur-xl"
              style={{
                boxShadow:
                  toast.type === "reward"
                    ? "0 0 20px rgba(245, 158, 11, 0.2)"
                    : "0 10px 30px rgba(0,0,0,0.5)",
              }}
            >
              {toast.type === "success" && (
                <CheckCircle2 className="text-green-500" size={20} />
              )}
              {toast.type === "error" && (
                <XCircle className="text-red-500" size={20} />
              )}
              {toast.type === "info" && (
                <Info className="text-blue-500" size={20} />
              )}
              {toast.type === "reward" && (
                <Trophy className="text-amber-500" size={20} />
              )}
              {toast.type === "restore" && (
                <RotateCcw className="text-purple-500" size={20} />
              )}
              <span className="text-sm font-medium text-white shadow-black drop-shadow-md">
                {toast.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
