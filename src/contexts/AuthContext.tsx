import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, isFirebaseConfigured } from "../firebase";
import { onAuthStateChanged, User as FirebaseUser, signInAnonymously } from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

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
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous authentication failed", error);
          setLoading(false);
        });
        return;
      }

      // Ensure user doc exists
      const userRef = doc(db, "users", fUser.uid);
      let unsubscribeDoc: () => void = () => {};
      getDoc(userRef).then(async (docSnap) => {
        if (!docSnap.exists()) {
          let nextUidNum = 1000 + Math.floor(Math.random() * 9000);
          try {
            const metaRef = doc(db, 'meta', 'metadata');
            const metaSnap = await getDoc(metaRef);
            if (metaSnap.exists()) {
              nextUidNum = (metaSnap.data().lastUid || 1000) + 1;
            }
            await setDoc(metaRef, { lastUid: nextUidNum, adminUid: "1000" }, { merge: true });
          } catch (e) {
            console.warn("Could not update meta, using random sequence fallback", e);
          }
          
          try {
            await setDoc(userRef, {
              uid: String(nextUidNum),
              name: "Seeker",
              email: "",
              role: "USER",
              adminAccess: false,
              createdAt: serverTimestamp(),
              theme: "dark",
              coins: 0,
              onboardingDone: true,
              streaks: {
                noMasturbation: { count: 0, lastChecked: "", broken: false, brokenAt: null },
                noSex:          { count: 0, lastChecked: "", broken: false, brokenAt: null },
                noSugar:        { count: 0, lastChecked: "", broken: false, brokenAt: null },
              },
              loginStreak: { count: 0, lastLogin: "", claimedDays: [] },
              rankHistory: { currentRank: "novice", claimedRanks: ["novice"] },
              auraLevel: 0,
              streakFreezes: 0,
            });
          } catch (e) {
            console.error("Failed to create user doc:", e);
          }
        }

        // Listen to user document in Firestore
        unsubscribeDoc = onSnapshot(
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

        // Save unsubscribe to a ref or just let it leak for now since AuthContext won't unmount
        // Actually, we can return it from useEffect, but we're inside the getDoc promise chain.
      });

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
