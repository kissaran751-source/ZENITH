import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "./GlassCard";

interface PremiumButtonProps extends HTMLMotionProps<"button"> {
  size?: "sm" | "md" | "lg";
}

export function PremiumButton({
  children,
  onClick,
  disabled,
  size = "lg",
  className,
  style,
  ...props
}: PremiumButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-sora font-semibold w-full cursor-pointer transition-all duration-200 border-none outline-none flex items-center justify-center",
        size === "lg"
          ? "px-8 py-[18px] text-base rounded-[var(--radius-md)]"
          : "",
        size === "md"
          ? "px-6 py-[14px] text-[15px] rounded-[var(--radius-md)]"
          : "",
        size === "sm"
          ? "px-6 py-[12px] text-sm rounded-[var(--radius-sm)] w-auto"
          : "",
        disabled ? "cursor-not-allowed opacity-50" : "",
        className,
      )}
      style={{
        background: disabled ? "rgba(255,255,255,0.1)" : "var(--blue-gradient)",
        boxShadow: disabled
          ? "none"
          : "0 4px 24px var(--blue-glow), 0 0 60px rgba(59,130,246,0.15)",
        color: disabled ? "var(--text-disabled)" : "#fff",
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
