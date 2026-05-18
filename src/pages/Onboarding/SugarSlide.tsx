import React from "react";
import { GlassCard } from "../../components/GlassCard";
import { PremiumButton } from "../../components/PremiumButton";
import { CheckCircle2 } from "lucide-react";
import { cn } from "../../components/GlassCard";

export default function SugarSlide({ onNext, answers, updateAnswers }: any) {
  const sources = [
    { id: "cold_drinks", icon: "🥤", label: "Cold Drinks" },
    { id: "tea", icon: "☕", label: "Tea / Coffee" },
    { id: "sweets", icon: "🍬", label: "Sweets & Candy" },
    { id: "processed", icon: "🍕", label: "Processed Food" },
  ];

  const frequencies = ["Daily", "Few times/week", "Weekly", "Rarely", "Never"];

  const toggleSource = (id: string) => {
    const newSources = answers.sugarSources.includes(id)
      ? answers.sugarSources.filter((s: string) => s !== id)
      : [...answers.sugarSources, id];
    updateAnswers({ sugarSources: newSources });
  };

  const isNextDisabled =
    answers.sugarSources.length > 0 && !answers.sugarFrequency;

  return (
    <div className="flex-1 flex flex-col pt-8">
      <h2 className="font-sora text-[26px] font-bold leading-tight mb-2">
        How much sugar do you consume?
      </h2>
      <p className="text-white/40 text-sm mb-8">Select all that apply</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {sources.map((s) => {
          const isSelected = answers.sugarSources.includes(s.id);
          return (
            <GlassCard
              key={s.id}
              onClick={() => toggleSource(s.id)}
              className={cn(
                "cursor-pointer transition-all p-4",
                isSelected ? "border-blue-500 bg-blue-500/10" : "",
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-2xl">{s.icon}</span>
                {isSelected && (
                  <CheckCircle2 className="text-blue-500" size={20} />
                )}
              </div>
              <span className="text-sm font-medium">{s.label}</span>
            </GlassCard>
          );
        })}
      </div>

      <div className="mb-12">
        <p className="font-medium text-sm mb-4">How often?</p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {frequencies.map((f) => (
            <button
              key={f}
              onClick={() => updateAnswers({ sugarFrequency: f })}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0",
                answers.sugarFrequency === f
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <PremiumButton disabled={isNextDisabled} onClick={onNext}>
          Next →
        </PremiumButton>
      </div>
    </div>
  );
}
