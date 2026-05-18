import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto"; // or '' empty string
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-white/10 rounded-t-[32px] z-[101] max-h-[90vh] flex flex-col pt-3 pb-[calc(env(safe-area-inset-bottom)+24px)]"
            style={{
              boxShadow: "0 -10px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />

            {(title || onClose) && (
              <div className="flex items-center justify-between px-6 mb-4">
                {title ? (
                  <h3 className="font-sora text-[22px] font-bold text-white">
                    {title}
                  </h3>
                ) : (
                  <div />
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/70"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="px-6 overflow-y-auto hide-scrollbar w-full flex-1">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
