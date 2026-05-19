import React, { useState } from "react";
import { BottomSheet } from "../../components/BottomSheet";
import { GlassCard, cn } from "../../components/GlassCard";
import { PremiumButton } from "../../components/PremiumButton";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/Toast";
import { guestDailyCheckIn } from "../../utils/guestLogic";
import { guestCheckAndClaimRank } from "../../utils/guestRankLogic";

export default function DailyCheckModal({ isOpen, onClose }: any) {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [noMast, setNoMast] = useState(true);
  const [noSex, setNoSex] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await guestDailyCheckIn(user, setUser, noMast, noSex);
      showToast("Checked in successfully!", "success");

      // Calculate resulting main streak dynamically or let the next render do it
      const nextMastCount = noMast
        ? user.streaks.noMasturbation.broken ? 1 : (user.streaks.noMasturbation.count || 0) + 1
        : 0;
      const nextSexCount = noSex 
        ? user.streaks.noSex.broken ? 1 : (user.streaks.noSex.count || 0) + 1 
        : 0;
      const mainStreak = Math.min(nextMastCount, nextSexCount);

      await guestCheckAndClaimRank(user, setUser, mainStreak, showToast);
      
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
