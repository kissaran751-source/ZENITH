import React, { useState } from "react";
import { BottomSheet } from "../../components/BottomSheet";
import { GlassCard, cn } from "../../components/GlassCard";
import { PremiumButton } from "../../components/PremiumButton";
import { format } from "date-fns";
import { dailyCheckIn } from "../../utils/streakLogic";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/Toast";
import { checkAndClaimRank } from "../../utils/rankLogic";

export default function DailyCheckModal({ isOpen, onClose }: any) {
  const { firebaseUser, user, setUser } = useAuth();
  const { showToast } = useToast();
  const [noMast, setNoMast] = useState(true);
  const [noSex, setNoSex] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === "GUEST") {
        await import("../../utils/guestLogic").then(m => m.guestDailyCheckIn(user, setUser, noMast, noSex));
      } else {
        if (!firebaseUser) return;
        await dailyCheckIn(firebaseUser.uid, noMast, noSex);
      }
      showToast("Checked in successfully!", "success");

      // Calculate resulting main streak dynamically or let the next render do it
      const nextMastCount = noMast
        ? user.streaks.noMasturbation.broken ? 1 : (user.streaks.noMasturbation.count || 0) + 1
        : 0;
      const nextSexCount = noSex 
        ? user.streaks.noSex.broken ? 1 : (user.streaks.noSex.count || 0) + 1 
        : 0;
      const mainStreak = Math.min(nextMastCount, nextSexCount);

      if (user.role === "GUEST") {
        await import("../../utils/guestRankLogic").then(m => m.guestCheckAndClaimRank(user, setUser, mainStreak, showToast));
      } else {
        if (firebaseUser) {
          const newRank = await checkAndClaimRank(firebaseUser.uid, mainStreak);
          if (newRank) {
            setTimeout(
              () =>
                showToast(
                  `Rank unlocked: ${newRank.label}! +${newRank.coins} coins`,
                  "reward",
                ),
              1000,
            );
          }
        }
      }
      onClose();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Today's Discipline Check"
    >
      <p className="text-white/60 mb-6 font-medium">
        {format(new Date(), "EEEE, MMM do")}
      </p>

      <GlassCard
        onClick={() => setNoMast(!noMast)}
        className={cn(
          "mb-4 cursor-pointer transition-colors",
          noMast ? "border-blue-500/50 bg-blue-500/10" : "",
        )}
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">🚫</span>
          <div className="flex-1">
            <div className="font-semibold text-white">No Masturbation</div>
            <div className="text-xs text-white/50">
              I did not masturbate today
            </div>
          </div>
          <div
            className={cn(
              "w-6 h-6 rounded-md border flex items-center justify-center transition-colors",
              noMast
                ? "bg-blue-500 border-blue-500"
                : "border-white/20 bg-white/5",
            )}
          >
            {noMast && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
          </div>
        </div>
      </GlassCard>

      <GlassCard
        onClick={() => setNoSex(!noSex)}
        className={cn(
          "mb-8 cursor-pointer transition-colors",
          noSex ? "border-blue-500/50 bg-blue-500/10" : "",
        )}
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">💑</span>
          <div className="flex-1">
            <div className="font-semibold text-white">No Sex</div>
            <div className="text-xs text-white/50">
              I did not have sex today
            </div>
          </div>
          <div
            className={cn(
              "w-6 h-6 rounded-md border flex items-center justify-center transition-colors",
              noSex
                ? "bg-blue-500 border-blue-500"
                : "border-white/20 bg-white/5",
            )}
          >
            {noSex && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
          </div>
        </div>
      </GlassCard>

      <PremiumButton onClick={handleConfirm} disabled={loading}>
        {loading ? "Confirming..." : "Confirm Check-In"}
      </PremiumButton>
    </BottomSheet>
  );
}
