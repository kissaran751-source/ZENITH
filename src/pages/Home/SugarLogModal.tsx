import React, { useState } from "react";
import { BottomSheet } from "../../components/BottomSheet";
import { GlassCard, cn } from "../../components/GlassCard";
import { PremiumButton } from "../../components/PremiumButton";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/Toast";
import { saveGuestUser } from "../../utils/guestLogic";
import { getTodayStr } from "../../utils/streakLogic";

const SOURCES = [
  { id: "cold_drink", icon: "🥤", label: "Cold Drink" },
  { id: "tea", icon: "☕", label: "Tea" },
  { id: "sweets", icon: "🍬", label: "Sweets" },
  { id: "processed", icon: "🍕", label: "Processed" },
];

export default function SugarLogModal({ isOpen, onClose }: any) {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [hadSugar, setHadSugar] = useState<boolean | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSource = (id: string) => {
    setSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleConfirm = async () => {
    if (!user || hadSugar === null) return;
    if (hadSugar && sources.length === 0) {
      showToast("Please select at least one source", "error");
      return;
    }

    setLoading(true);
    const today = getTodayStr();

    try {
      const sugarLogsStr = localStorage.getItem("zenith_sugar_logs") || "[]";
      const sugarLogs = JSON.parse(sugarLogsStr);
      
      const existingLog = sugarLogs.find((L: any) => L.id === today);
      if (existingLog) {
        throw new Error("Already logged sugar today");
      }

      sugarLogs.unshift({
        id: today,
        timestamp: new Date().toISOString(),
        hadSugar,
        sources: hadSugar ? sources : [],
      });
      localStorage.setItem("zenith_sugar_logs", JSON.stringify(sugarLogs));

      const updatedUser = { ...user, streaks: { ...user.streaks } };
      
      if (!updatedUser.streaks.noSugar) {
        updatedUser.streaks.noSugar = { count: 0, broken: false, brokenAt: null, lastChecked: "" };
      }

      if (hadSugar) {
        updatedUser.streaks.noSugar.broken = true;
        updatedUser.streaks.noSugar.brokenAt = new Date().toISOString();
        updatedUser.streaks.noSugar.count = 0;
      } else {
        if (updatedUser.streaks.noSugar.broken) {
          updatedUser.streaks.noSugar.broken = false;
          updatedUser.streaks.noSugar.brokenAt = null;
          updatedUser.streaks.noSugar.count = 1;
        } else {
          updatedUser.streaks.noSugar.count = (updatedUser.streaks.noSugar.count || 0) + 1;
        }
        updatedUser.streaks.noSugar.lastChecked = today;
      }

      saveGuestUser(updatedUser);
      setUser(updatedUser);

      showToast("Sugar logged successfully", "success");
      onClose();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Log Today's Sugar">
      <p className="text-white/60 mb-6 font-medium">
        {format(new Date(), "EEEE, MMM do")}
      </p>

      <h3 className="text-[17px] font-semibold text-white mb-4">
        Did you consume sugar today?
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <GlassCard
          onClick={() => {
            setHadSugar(false);
            setSources([]);
          }}
          className={cn(
            "cursor-pointer text-center py-6",
            hadSugar === false ? "border-green-500/50 bg-green-500/10" : "",
          )}
        >
          <div className="text-3xl mb-2">✨</div>
          <div className="font-semibold text-sm text-white">
            No, stayed clean
          </div>
        </GlassCard>

        <GlassCard
          onClick={() => setHadSugar(true)}
          className={cn(
            "cursor-pointer text-center py-6",
            hadSugar === true ? "border-red-500/50 bg-red-500/10" : "",
          )}
        >
          <div className="text-3xl mb-2">💧</div>
          <div className="font-semibold text-sm text-white">
            Yes, I had some
          </div>
        </GlassCard>
      </div>

      {hadSugar === true && (
        <div className="mb-8">
          <p className="text-sm text-white/50 mb-3 uppercase tracking-wider font-semibold">
            Select Sources
          </p>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleSource(s.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5",
                  sources.includes(s.id)
                    ? "bg-red-500/20 border border-red-500/50 text-white"
                    : "bg-white/10 border border-white/5 text-white/70",
                )}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <PremiumButton
        onClick={handleConfirm}
        disabled={loading || hadSugar === null}
      >
        {loading ? "Logging..." : "Log Today"}
      </PremiumButton>
    </BottomSheet>
  );
}
