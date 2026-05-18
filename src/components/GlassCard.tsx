import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends HTMLMotionProps<"div"> {
  glowColor?: string;
}

export function GlassCard({
  children,
  className,
  onClick,
  glowColor,
  style,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "bg-glass border-glass rounded-[var(--radius-lg)] p-5 relative overflow-hidden",
        className,
      )}
      style={{
        boxShadow: glowColor
          ? `var(--glass-shadow), 0 0 30px ${glowColor}`
          : "var(--glass-shadow)",
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
