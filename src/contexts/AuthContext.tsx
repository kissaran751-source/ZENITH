import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, isFirebaseConfigured } from "../firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

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
  firebaseUid: string;
  sugarInfo?: {
    onboardingDone: boolean;
    level: string;
    dailyConsumption: string;
  };
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (!fUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Listen to user document in Firestore
      const unsubscribeDoc = onSnapshot(
        doc(db, "users", fUser.uid),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setUser({
              ...data,
              firebaseUid: fUser.uid,
              streaks: {
                noMasturbation: data.streaks?.noMasturbation || { count: 0, lastChecked: "", broken: false, brokenAt: null },
                noSex: data.streaks?.noSex || { count: 0, lastChecked: "", broken: false, brokenAt: null },
                noSugar: data.streaks?.noSugar || { count: 0, lastChecked: "", broken: false, brokenAt: null },
              },
              rankHistory: data.rankHistory || { currentRank: "novice", claimedRanks: ["novice"] },
              loginStreak: data.loginStreak || { count: 0, lastLogin: "", claimedDays: [] },
              coins: data.coins || 0,
            } as AppUser);
          } else {
            setUser(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        },
      );

      return () => unsubscribeDoc();
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
