import React, { useState } from "react";
import { GlassCard } from "../../components/GlassCard";
import { PremiumButton } from "../../components/PremiumButton";
import { formatNumber } from "../../utils/formatters";
import { Clock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { saveGuestUser } from "../../utils/guestLogic";

export default function TaskCard({ task, showToast }: any) {
  const { user, setUser } = useAuth();
  const [sliderValue, setSliderValue] = useState(task.sliderMin || 1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const estimatedCoins = Math.round(
    (task.hasSlider ? sliderValue : 1) * (task.pricePerUnit || task.reward || 100),
  );

  const handleSendRequest = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updatedUser = {
        ...user,
        coins: (user.coins || 0) + estimatedCoins
      };
      
      saveGuestUser(updatedUser);
      setUser(updatedUser);
      
      setSubmitted(true);
      if (showToast) showToast(`Completed! Earned ${estimatedCoins} coins.`);
    } catch (err: any) {
      if (showToast) showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="mx-4 mb-3 !p-[22px]">
      <div className="font-sora text-[17px] font-bold text-white mb-1.5 flex items-center gap-2">
        {task.icon && <span>{task.icon}</span>}
        {task.name || task.title}
      </div>
      <div className="text-[13px] text-white/70">{task.description}</div>

      {task.hasSlider && (
        <div className="mt-5">
          <div className="flex justify-between text-[13px] text-white/50 mb-2.5">
            <span>{task.sliderLabel}</span>
            <span className="text-blue-500 font-semibold">
              {sliderValue} {task.unit}
            </span>
          </div>
          <input
            type="range"
            min={task.sliderMin}
            max={task.sliderMax}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-[11px] text-white/40 mt-1">
            <span>
              {task.sliderMin} {task.unit}
            </span>
            <span>
              {task.sliderMax} {task.unit}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-5">
        <div>
          <div className="text-[12px] text-white/50">You'll earn</div>
          <div className="text-[22px] font-sora font-bold text-amber-500">
            {formatNumber(estimatedCoins)} coins
          </div>
        </div>
        <PremiumButton
          size="sm"
          onClick={handleSendRequest}
          disabled={submitted || loading}
        >
          {submitted ? "✅ Done" : "Complete"}
        </PremiumButton>
      </div>

      {task.requiresApproval && (
        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-white/40 font-medium">
          <Clock size={12} /> Requires admin approval · coins credited after
          review
        </div>
      )}
    </GlassCard>
  );
}
