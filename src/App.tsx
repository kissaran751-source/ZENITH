import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NavBar } from "./components/NavBar";
import { ToastProvider } from "./components/Toast";

// Pages
import HomePage from "./pages/Home/HomePage";
import SugarPage from "./pages/Sugar/SugarPage";
import AnalyticsPage from "./pages/Analytics/AnalyticsPage";
import RewardsPage from "./pages/Rewards/RewardsPage";
import StorePage from "./pages/Rewards/StorePage";
import ProfilePage from "./pages/Profile/ProfilePage";
import LoginPage from "./pages/Onboarding/LoginPage";
import AdminPanel from "./pages/Admin/AdminPanel";
import { midnightStreakCheck } from "./utils/streakLogic";
import { Loader2 } from "lucide-react";
import { handleUnclaimedGifts } from "./utils/coinLogic";
import { isFirebaseConfigured, auth } from "./firebase";

function ProtectedLayout() {
  const { user, firebaseUser, loading } = useAuth();
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    if (user && firebaseUser) {
      const initInfo = async () => {
        try {
          await midnightStreakCheck(firebaseUser.uid);
          await handleUnclaimedGifts(user.uid, firebaseUser.uid);
        } catch (error) {
          console.error("Error during initialization:", error);
        } finally {
          setInitDone(true);
        }
      };
      initInfo();
    }
  }, [user, firebaseUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (!initDone) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-[calc(var(--nav-height)+var(--safe-bottom)+16px)]">
      <Outlet />
      <NavBar />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/sugar" element={<SugarPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-neutral-800 rounded-2xl p-8 border border-neutral-700 shadow-xl">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-4 text-white">Firebase Keys Required</h1>
          <p className="text-neutral-400 mb-6 text-sm leading-relaxed">
            Please open the <strong>Settings</strong> menu in AI Studio, go to <strong>Secrets</strong>, and add the following keys from your Firebase project:
          </p>
          <ul className="text-left text-sm text-neutral-300 bg-neutral-900/50 rounded-xl p-4 space-y-2 border border-neutral-700/50 mb-8 font-mono">
            <li>VITE_FIREBASE_API_KEY</li>
            <li>VITE_FIREBASE_AUTH_DOMAIN</li>
            <li>VITE_FIREBASE_PROJECT_ID</li>
            <li>VITE_FIREBASE_STORAGE_BUCKET</li>
            <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
            <li>VITE_FIREBASE_APP_ID</li>
          </ul>
          <p className="text-xs text-neutral-500">
            Once added, refresh the page to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
           <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
