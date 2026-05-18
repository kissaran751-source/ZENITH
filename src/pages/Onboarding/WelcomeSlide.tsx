import React, { useState } from "react";
import { motion } from "motion/react";
import { GlassCard } from "../../components/GlassCard";
import { PremiumButton } from "../../components/PremiumButton";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast";

export default function WelcomeSlide({ onNext }: { onNext: () => void }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, "users", cred.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const metaRef = doc(db, "meta", "config");
        const metaDoc = await getDoc(metaRef);
        let nextUid = 1001;
        if (metaDoc.exists()) {
          nextUid = metaDoc.data().lastUid + 1;
        }
        await setDoc(
          metaRef,
          { lastUid: nextUid, adminUid: "1000" },
          { merge: true },
        );

        await setDoc(userRef, {
          uid: nextUid.toString(),
          name: cred.user.displayName || "Google User",
          email: cred.user.email,
          createdAt: serverTimestamp(),
          theme: "dark",
          coins: 0,
          onboardingDone: true,
          onboardingScore: 50,
          onboardingAnswers: {},
          streaks: {
            noMasturbation: { count: 0, lastChecked: "", broken: false, brokenAt: null },
            noSex: { count: 0, lastChecked: "", broken: false, brokenAt: null },
            noSugar: { count: 0, lastChecked: "", broken: false, brokenAt: null },
          },
          loginStreak: { count: 0, lastLogin: "", claimedDays: [] },
          rankHistory: { currentRank: "novice", claimedRanks: ["novice"] },
          streakFreezes: 0,
          auraLevel: 0,
        });
        showToast("Profile created! Welcome to Zenith.", "success");
      } else {
        showToast("Welcome back!", "success");
      }
      navigate("/");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center -mt-20">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 bg-[var(--blue-gradient)] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_var(--blue-glow)]"
        >
          <span className="font-sora font-bold text-4xl text-white">Z</span>
        </motion.div>

        <h1 className="font-sora font-extrabold text-[32px] tracking-[8px] uppercase mb-4 text-white">
          ZENITH
        </h1>

        <p className="font-sans text-base text-white/60">
          Master Yourself. Rise Above.
        </p>
      </div>

      <GlassCard className="mb-0">
        <h2 className="font-sora text-xl font-bold mb-2 text-white">
          Your discipline journey begins here.
        </h2>
        <p className="text-sm text-white/60 mb-6 leading-relaxed">
          Answer a few questions to calculate your current discipline score.
        </p>
        <PremiumButton onClick={onNext} disabled={loading}>
          Begin Journey →
        </PremiumButton>

        <div className="flex items-center gap-2 w-full my-4">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-xs text-white/30 font-semibold uppercase">Or</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl px-4 py-3 hover:bg-gray-200 transition-colors"
        >
          {loading ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </>
          )}
        </button>
      </GlassCard>
    </div>
  );
}
