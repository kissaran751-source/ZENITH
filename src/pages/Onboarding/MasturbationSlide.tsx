import React from "react";
import { GlassCard } from "../../components/GlassCard";
import { PremiumButton } from "../../components/PremiumButton";
import { cn } from "../../components/GlassCard";

export default function MasturbationSlide({
  onNext,
  answers,
  updateAnswers,
}: any) {
  const options = [
    { id: "daily", icon: "🔄", label: "Daily", sub: "Every day" },
    {
      id: "few_times_week",
      icon: "📅",
      label: "Few times/week",
      sub: "3-5 times per week",
    },
    { id: "weekly", icon: "📆", label: "Weekly", sub: "Once or twice a week" },
    { id: "monthly", icon: "🗓️", label: "Monthly", sub: "A few times a month" },
    { id: "never", icon: "✨", label: "Never", sub: "I don't masturbate" },
  ];

  return (
    <div className="flex-1 flex flex-col pt-8">
      <h2 className="font-sora text-[26px] font-bold leading-tight mb-2">
        How often do you masturbate?
      </h2>
      <p className="text-white/40 text-sm mb-8">
        Be honest — this shapes your starting score
      </p>

      <div className="flex flex-col gap-3 mb-8 overflow-y-auto">
        {options.map((opt) => {
          const isSelected = answers.masturbationFrequency === opt.id;
          return (
            <GlassCard
              key={opt.id}
              onClick={() => updateAnswers({ masturbationFrequency: opt.id })}
              className={cn(
                "cursor-pointer transition-all p-4 flex items-center gap-4",
                isSelected
                  ? "border-l-4 border-l-blue-500 border-y-blue-500/30 border-r-blue-500/30 bg-blue-500/10"
                  : "",
              )}
            >
              <span className="text-2xl w-10 text-center">{opt.icon}</span>
              <div>
                <div className="font-semibold text-[15px]">{opt.label}</div>
                <div className="text-sm text-white/50 bg-transparent">
                  {opt.sub}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-auto">
        <PremiumButton
          disabled={!answers.masturbationFrequency}
          onClick={onNext}
        >
          Next →
        </PremiumButton>
      </div>
    </div>
  );
}
