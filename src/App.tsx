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
import { Loader2 } from "lucide-react";

function ProtectedLayout() {
  const { user, loading, setUser } = useAuth();
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    if (user) {
      const initInfo = async () => {
        try {
          await import('./utils/guestLogic').then(m => m.guestMidnightStreakCheck(user, setUser));
        } catch (error) {
          console.error("Error during initialization:", error);
        } finally {
          setInitDone(true);
        }
      };
      initInfo();
    }
  }, [user]);

  if (loading || (!user && !loading)) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 text-center">
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
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/sugar" element={<SugarPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
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
