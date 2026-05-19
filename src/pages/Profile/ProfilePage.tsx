import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { GlassCard } from "../../components/GlassCard";
import { format } from "date-fns";
import {
  Moon,
  Download,
  Upload,
  Clock,
  Info,
  LogOut,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useToast } from "../../components/Toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  if (!user) return null;

  const totalDaysTracked = Math.max(
    user.streaks.noMasturbation.count,
    user.streaks.noSex.count,
    user.streaks.noSugar.count,
  );
  const longestStreak = Math.max(
    user.streaks.noMasturbation.count,
    user.streaks.noSex.count,
  );
  const totalCoinsEarned = user.coins; // simplify

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      showToast("Error signing out", "error");
    }
  };

  const SettingRow = ({
    icon,
    label,
    sublabel,
    right,
    onClick,
    danger,
    accent,
  }: any) => (
    <GlassCard
      onClick={onClick}
      className={`!p-4 mb-2 flex items-center justify-between transition-colors ${onClick ? "cursor-pointer hover:bg-white-[0.08]" : ""} ${danger ? "border-red-500/20" : ""} ${accent ? "border-blue-500/30 bg-blue-500/5" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`${danger ? "text-red-400" : accent ? "text-blue-400" : "text-white/70"}`}
        >
          {icon}
        </div>
        <div>
          <div
            className={`font-semibold text-[15px] ${danger ? "text-red-400" : "text-white"}`}
          >
            {label}
          </div>
          {sublabel && (
            <div className="text-[12px] text-white/50">{sublabel}</div>
          )}
        </div>
      </div>
      <div className="text-white/40">{right}</div>
    </GlassCard>
  );

  return (
    <div className="pt-4 pb-12 overflow-x-hidden text-white">
      <div className="pt-8 px-6 pb-6 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-[var(--blue-gradient)] rounded-full flex items-center justify-center font-sora text-[32px] font-bold text-white mb-4 shadow-[0_0_30px_var(--blue-glow)]">
          {user.name[0].toUpperCase()}
        </div>
        <div className="font-sora text-[22px] font-bold">{user.name}</div>
        <div className="text-[14px] text-white/50 mt-1">UID: {user.uid}</div>
        <div className="text-[13px] text-white/40 mt-1">
          Member since{" "}
          {format(user.createdAt?.toDate() || new Date(), "MMMM yyyy")}
        </div>

        {user.email ? (
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500/15 rounded-full border border-blue-500/30">
            <span className="text-blue-400 text-[13px] font-semibold">
              📧 {user.email}
            </span>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-lg hover:shadow-blue-500/30 transition-all font-sora text-[14px] font-semibold text-white"
          >
            <Shield size={16} /> Protect Account (Login)
          </button>
        )}
      </div>

      <GlassCard className="mx-4 mb-6 !p-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col gap-1">
            <div className="font-sora text-2xl font-bold text-white">
              {totalDaysTracked}
            </div>
            <div className="text-[10px] font-semibold text-white/40 tracking-wider">
              DAYS TRACKED
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-sora text-2xl font-bold text-amber-500">
              {new Intl.NumberFormat("en-US").format(totalCoinsEarned)}
            </div>
            <div className="text-[10px] font-semibold text-white/40 tracking-wider">
              COINS EARNED
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-sora text-2xl font-bold text-blue-400">
              {longestStreak}
            </div>
            <div className="text-[10px] font-semibold text-white/40 tracking-wider">
              BEST STREAK
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="px-4">
        <SettingRow
          icon={<Moon size={20} />}
          label="App Theme"
          right={
            <div className="w-10 h-6 bg-blue-500 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          }
        />
        <SettingRow
          icon={<Download size={20} />}
          label="Export My Data"
          sublabel="Download your progress as JSON"
          right={<ChevronRight size={18} />}
          onClick={() => showToast("Export initiated", "info")}
        />
        <SettingRow
          icon={<Upload size={20} />}
          label="Import Data"
          sublabel="Restore from a backup file"
          right={<ChevronRight size={18} />}
          onClick={() => showToast("Import coming soon", "info")}
        />
        <SettingRow
          icon={<Clock size={20} />}
          label="My Requests"
          sublabel="View task approval status"
          right={<ChevronRight size={18} />}
        />
        <SettingRow
          icon={<Info size={20} />}
          label="App Version"
          right={<span className="text-[13px]">v1.0.0</span>}
        />
        {user.email && (
          <SettingRow
            icon={<LogOut size={20} />}
            label="Sign Out"
            right={<ChevronRight size={18} />}
            onClick={handleSignOut}
            danger
          />
        )}

        {user.role === 'SUPER_ADMIN' && user.adminAccess && (
          <div className="mt-6 mb-4">
            <div className="text-[11px] font-semibold text-blue-400/80 tracking-wider mb-2 uppercase flex items-center gap-1">
              <Shield size={12} /> SUPER ADMIN
            </div>
            <SettingRow
              icon={<Shield size={20} />}
              label="Admin Control Panel"
              sublabel="Store, economy, users & feature settings"
              right={<ChevronRight size={18} />}
              onClick={() => navigate("/admin")}
              accent
            />
          </div>
        )}
      </div>
    </div>
  );
}
