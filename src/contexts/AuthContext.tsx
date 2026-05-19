import React, { createContext, useContext, useEffect, useState } from "react";
import { getGuestUser, saveGuestUser } from "../utils/guestLogic";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role?: string;
  adminAccess?: boolean;
  createdAt: any;
  theme: "dark" | "light";
  coins: number;
  onboardingDone: boolean;
  onboardingScore: number;
  onboardingAnswers: any;
  streaks: {
    noMasturbation: {
      count: number;
      lastChecked: string;
      broken: boolean;
      brokenAt: any;
    };
    noSex: {
      count: number;
      lastChecked: string;
      broken: boolean;
      brokenAt: any;
    };
    noSugar: {
      count: number;
      lastChecked: string;
      broken: boolean;
      brokenAt: any;
    };
  };
  loginStreak: { count: number; lastLogin: string; claimedDays: string[] };
  rankHistory: { currentRank: string; claimedRanks: string[] };
  streakFreezes: number;
  auraLevel: number;
  sugarInfo?: {
    onboardingDone: boolean;
    level: string;
    dailyConsumption: string;
  };
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSetUser = (newUser: AppUser | null) => {
    setUser(newUser);
    if (newUser) {
      saveGuestUser(newUser);
    }
  };

  useEffect(() => {
    handleSetUser(getGuestUser());
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
