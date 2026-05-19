import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import FireStreak from "./FireStreak";
import { GlassCard } from "../../components/GlassCard";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { getRankById } from "../../utils/rankLogic";
import { getTodayStr } from "../../utils/streakLogic";
import DailyCheckModal from "./DailyCheckModal";
import SugarLogModal from "./SugarLogModal";
import RestoreModal from "./RestoreModal";
import { getDailyTip as getTip } from "../../utils/tips";
import { RANKS } from "../../utils/rankLogic";

export default function HomePage() {
  const { user } = useAuth();
  const [showCheck, setShowCheck] = useState(false);
  const [showRestore, setShowRestore] = useState(false);

  if (!user) return null;

  const today = getTodayStr();
  const mastChecked = user.streaks.noMasturbation.lastChecked === today;
  const sexChecked = user.streaks.noSex.lastChecked === today;
  const checkCompleted = mastChecked && sexChecked;

  const mainStreak = Math.min(
    user.streaks.noMasturbation.broken ? 0 : user.streaks.noMasturbation.count,
    user.streaks.noSex.broken ? 0 : user.streaks.noSex.count,
  );

  const currentRank = getRankById(user.rankHistory.currentRank);
  const nextRank =
    RANKS.find((r) => r.minDay > mainStreak) || RANKS[RANKS.length - 1];

  const anyBroken =
    user.streaks.noMasturbation.broken ||
    user.streaks.noSex.broken ||
    user.streaks.noSugar.broken;

  // Aura calc
  const auraLevel = Math.floor(
    ((user.streaks.noMasturbation.broken
      ? 0
      : user.streaks.noMasturbation.count) +
      (user.streaks.noSex.broken ? 0 : user.streaks.noSex.count) +
      (user.streaks.noSugar.broken ? 0 : user.streaks.noSugar.count)) /
      3,
  );

  let auraLabel = "Transcendent 🪷";
  if (auraLevel < 8) auraLabel = "Weak ⚡";
  else if (auraLevel < 16) auraLabel = "Focused 🧠";
  else if (auraLevel < 31) auraLabel = "Strong 💪";
  else if (auraLevel < 61) auraLabel = "Powerful 🔥";
  else if (auraLevel < 91) auraLabel = "Unstoppable ⚡";

  return (
    <div className="pt-4 pb-8 overflow-x-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-[60px] bg-black/20 backdrop-blur-md border-b border-white/5 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center font-sora font-semibold text-[10px] text-white shadow-[0_0_10px_var(--blue-glow)]">
            Z
          </div>
          <span className="font-sora font-semibold text-white tracking-widest text-sm uppercase">
            Zenith
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 rounded-full px-3 py-1 flex items-center gap-1.5 backdrop-blur-md">
            <span className="text-amber-500 text-sm">💰</span>
            <span className="text-amber-500 font-bold font-sora text-sm">
              {new Intl.NumberFormat("en-US").format(user.coins)}
            </span>
          </div>
          <div className="text-xl">{currentRank.icon}</div>
        </div>
      </div>

      <div className="pt-[60px]">
        <FireStreak
          noMastStreak={user.streaks.noMasturbation}
          noSexStreak={user.streaks.noSex}
          currentRankId={user.rankHistory.currentRank}
        />

        {/* Aura Meter */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '1px' }}>
              AURA LEVEL
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700,
              color: auraLevel < 8 ? '#94A3B8' : auraLevel < 16 ? '#60A5FA' : auraLevel < 31 ? '#8B5CF6' : '#F59E0B' }}>
              {auraLabel} ⚡
            </span>
          </div>
          <div style={{
            height: '6px', background: 'rgba(255,255,255,0.07)',
            borderRadius: '999px', overflow: 'hidden', position: 'relative',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((auraLevel / 90) * 100, 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: '999px',
                background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #F59E0B)',
                boxShadow: '0 0 12px rgba(59,130,246,0.6)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Shimmer sweep */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                animation: 'shimmer 2s infinite',
              }} />
            </motion.div>
          </div>
        </div>

        {/* Daily Check In */}
        {checkCompleted ? (
          <div className="mx-4 mt-4 bg-green-500/10 border border-green-500/20 rounded-[18px] p-6 flex items-center gap-4 opacity-70 cursor-default">
            <span className="text-[32px]">✅</span>
            <div>
              <div className="font-sora text-[17px] font-bold text-white">
                Logged for Today
              </div>
              <div className="text-[13px] text-green-400 mt-1">
                Great job maintaining discipline.
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCheck(true)}
            className="mx-4 mt-4 rounded-[18px] p-6 cursor-pointer relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
              boxShadow:
                "0 8px 32px rgba(59,130,246,0.4), 0 0 80px rgba(59,130,246,0.1)",
            }}
          >
            {/* Shimmer */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            />

            <div className="flex items-center gap-4 relative z-10">
              <span className="text-[32px]">🔥</span>
              <div>
                <div className="font-sora text-[17px] font-bold text-white">
                  Log Today's Discipline
                </div>
                <div className="text-[13px] text-white/75 mt-1">
                  Tap to confirm your streak
                </div>
              </div>
              <ChevronRight className="ml-auto text-white/70" size={20} />
            </div>
          </motion.div>
        )}

        {anyBroken && (
          <button
            onClick={() => setShowRestore(true)}
            className="block mx-auto mt-4 bg-transparent border-none text-white/40 text-[13px] underline underline-offset-4 decoration-white/20 hover:text-white/70"
          >
            ✨ Restore Streak
          </button>
        )}

        {/* Rank */}
        <GlassCard className="m-4 !p-5">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[11px] font-semibold text-white/40 tracking-wider">
                CURRENT RANK
              </div>
              <div className="text-[24px] font-sora font-bold text-white mt-1">
                {currentRank.icon} {currentRank.label}
              </div>
              <div className="text-[13px] text-white/60 mt-1.5">
                Day {mainStreak} · Next: {nextRank.label} at day{" "}
                {nextRank.minDay}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-[12px] text-white/40 mb-1.5 font-medium">
              <span>Day {currentRank.minDay}</span>
              <span>Day {nextRank.minDay}</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${Math.min(
                    ((mainStreak - currentRank.minDay) /
                      (nextRank.minDay - currentRank.minDay)) *
                      100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Tip */}
        <GlassCard className="mx-4 mb-4 !p-5">
          <div className="flex gap-3.5 items-start">
            <span className="text-[24px]">💡</span>
            <div>
              <div className="text-[11px] font-semibold text-blue-500 tracking-wider mb-1.5">
                DAILY DISCIPLINE TIP
              </div>
              <div className="text-[14px] text-white/70 leading-relaxed font-medium">
                {getTip()}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <DailyCheckModal isOpen={showCheck} onClose={() => setShowCheck(false)} />
      <RestoreModal
        isOpen={showRestore}
        onClose={() => setShowRestore(false)}
      />
    </div>
  );
}
