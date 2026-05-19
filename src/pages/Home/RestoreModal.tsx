import React, { useState } from "react";
import { BottomSheet } from "../../components/BottomSheet";
import { GlassCard } from "../../components/GlassCard";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/Toast";
import { differenceInHours } from "date-fns";
import { saveGuestUser } from "../../utils/guestLogic";

export default function RestoreModal({ isOpen, onClose }: any) {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (
    !user ||
    (!user.streaks.noMasturbation.broken &&
      !user.streaks.noSex.broken &&
      !user.streaks.noSugar?.broken)
  ) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        <p className="p-4 text-center text-white/60">
          No broken streaks to restore.
        </p>
      </BottomSheet>
    );
  }

  const handleRestore = async (
    type: "noMasturbation" | "noSex" | "noSugar" | "both",
    cost: number,
  ) => {
    if (confirm(`Spend ${cost} coins to restore this streak?`)) {
      setLoading(true);
      try {
        if (user.coins < cost) throw new Error("Not enough coins");

        const updatedUser = { ...user, coins: user.coins - cost, streaks: { ...user.streaks } };

        const types: ("noMasturbation" | "noSex" | "noSugar")[] = type === "both" ? ["noMasturbation", "noSex"] : [type];

        for (const t of types) {
          const streak = updatedUser.streaks[t as "noMasturbation"|"noSex"|"noSugar"];
          if (!streak || !streak.broken) throw new Error(`${t} streak is not broken`);

          const brokenDate = streak.brokenAt ? new Date(streak.brokenAt) : new Date();
          const hoursSince = differenceInHours(new Date(), brokenDate);
          
          if (hoursSince > 48)
            throw new Error(`Restore window expired (48h limit) for ${t}`);

          streak.broken = false;
          streak.brokenAt = null;
          streak.lastChecked = new Date().toISOString().split('T')[0];
        }

        saveGuestUser(updatedUser);
        setUser(updatedUser);
        
        showToast("Streak restored! 🔥", "restore");
        onClose();
      } catch (err: any) {
        showToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const Option = ({
    type,
    title,
    emoji,
    cost,
  }: {
    type: "noMasturbation" | "noSex" | "noSugar" | "both";
    title: string;
    emoji: string;
    cost: number;
  }) => {
    const s = type === "both" ? user.streaks.noMasturbation : user.streaks[type as "noMasturbation"|"noSex"|"noSugar"];
    const brokenDate = s?.brokenAt ? new Date(s.brokenAt) : new Date();
    const hours = differenceInHours(new Date(), brokenDate);
    const expired = hours > 48;
    const canAfford = user.coins >= cost;

    return (
      <GlassCard
        onClick={() => !expired && canAfford && handleRestore(type, cost)}
        className={`mb-3 transition-colors ${expired || !canAfford ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-white-[0.08]"}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 font-semibold font-sora">
            <span className="text-xl">{emoji}</span> {title}
          </div>
          <div
            className={`font-bold ${canAfford ? "text-amber-500" : "text-red-500"}`}
          >
            {new Intl.NumberFormat("en-US").format(cost)} 🪙
          </div>
        </div>
        <div className="flex justify-between items-center mt-3 text-xs">
          <span className="text-white/50 min-w-0">
            {expired ? "⚠️ Window expired" : `⏰ ${48 - hours}h remaining`}
          </span>
          {!canAfford && (
            <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
              Insufficient coins
            </span>
          )}
        </div>
      </GlassCard>
    );
  };

  const mast = user.streaks.noMasturbation;
  const sex = user.streaks.noSex;
  const sug = user.streaks.noSugar || { broken: false };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="🔄 Restore Your Streak"
    >
      <p className="text-white/60 text-sm mb-6 -mt-2">
        Available within 48 hours of a break
      </p>

      <div className="mb-6 flex justify-center">
        <div className="bg-glass rounded-full px-5 py-2 inline-flex items-center gap-2 border border-white/5">
          <span className="text-amber-500 font-bold text-lg">
            {new Intl.NumberFormat("en-US").format(user.coins)}
          </span>
          <span className="text-white/60 text-sm">Zenith Coins</span>
        </div>
      </div>

      {mast.broken && sex.broken && (
        <Option type="both" title="Restore Both" emoji="🔥" cost={500000} />
      )}
      {mast.broken && (
        <Option
          type="noMasturbation"
          title="No Masturbation"
          emoji="🚫"
          cost={200000}
        />
      )}
      {sex.broken && (
        <Option type="noSex" title="No Sex" emoji="💑" cost={20000} />
      )}
      {sug.broken && (
        <Option type="noSugar" title="No Sugar" emoji="🍬" cost={40000} />
      )}
    </BottomSheet>
  );
}
