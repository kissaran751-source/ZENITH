import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Coffee, BarChart2, Trophy, User } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "./GlassCard";

export function NavBar() {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/sugar", icon: Coffee, label: "Sugar" },
    { to: "/analytics", icon: BarChart2, label: "Analytics" },
    { to: "/rewards", icon: Trophy, label: "Rewards" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-[var(--safe-bottom)] left-4 right-4 h-[var(--nav-height)] bg-glass border-glass rounded-[var(--radius-pill)] flex items-center justify-around px-2 z-50 shadow-[var(--glass-shadow)] backdrop-blur-[var(--glass-blur)]">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center w-16 h-16 rounded-full relative transition-colors",
              isActive ? "text-blue-500" : "text-white/40",
            )
          }
        >
          {({ isActive }) => (
            <motion.div
              whileTap={{ scale: 0.85 }}
              animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              className="flex flex-col items-center"
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="w-1 h-1 bg-blue-500 rounded-full mt-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          )}
        </NavLink>
      ))}
    </div>
  );
}
