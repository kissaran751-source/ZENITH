import React, { useState, useRef } from "react";
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
import { useToast } from "../../components/Toast";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const totalCoinsEarned = user.coins;

  const handleSignOut = () => {
    // Clear out everything
    localStorage.clear();
    window.location.href = '/';
  };

  const handleExportData = () => {
    const data = {
      user: JSON.parse(localStorage.getItem('guest_user') || '{}'),
      logs: JSON.parse(localStorage.getItem('guest_logs') || '{}'),
      transactions: JSON.parse(localStorage.getItem('guest_transactions') || '[]'),
      sugarLogs: JSON.parse(localStorage.getItem('sugar_logs_v2') || '[]')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenith-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Data exported successfully!", "success");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.user) localStorage.setItem('guest_user', JSON.stringify(data.user));
        if (data.logs) localStorage.setItem('guest_logs', JSON.stringify(data.logs));
        if (data.transactions) localStorage.setItem('guest_transactions', JSON.stringify(data.transactions));
        if (data.sugarLogs) localStorage.setItem('sugar_logs_v2', JSON.stringify(data.sugarLogs));
        
        showToast("Data imported! Reloading...", "success");
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        showToast("Invalid backup file", "error");
      }
    };
    reader.readAsText(file);
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
          {user.name?.[0]?.toUpperCase() || 'G'}
        </div>
        <div className="font-sora text-[22px] font-bold">{user.name || 'Guest'}</div>
        <div className="text-[13px] text-white/40 mt-1">
          Local Storage Profile
        </div>
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
          onClick={handleExportData}
        />
        <SettingRow
          icon={<Upload size={20} />}
          label="Import Data"
          sublabel="Restore from a backup file"
          right={<ChevronRight size={18} />}
          onClick={() => fileInputRef.current?.click()}
        />
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleImportData} 
        />
        
        <SettingRow
          icon={<Info size={20} />}
          label="App Version"
          right={<span className="text-[13px]">v1.0.0 (Local Only)</span>}
        />

        <SettingRow
          icon={<LogOut size={20} />}
          label="Wipe All Data"
          sublabel="Deletes everything forever"
          right={<ChevronRight size={18} />}
          onClick={() => {
            if (confirm('Are you sure you want to delete all local data? This cannot be undone unless you export a backup first!')) {
              handleSignOut();
            }
          }}
          danger
        />
      </div>
    </div>
  );
}
