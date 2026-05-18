import React, { useEffect, useState } from "react";
import { calculateScore } from "../../utils/scoreCalculator";
import { PremiumButton } from "../../components/PremiumButton";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function ScoreSlide({ answers }: any) {
  const [score, setScore] = useState(0);
  const targetScore = calculateScore(answers);
  const navigate = useNavigate();

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < targetScore) {
        current += 1;
        setScore(current);
      } else {
        clearInterval(interval);
      }
    }, 2000 / targetScore);
    return () => clearInterval(interval);
  }, [targetScore]);

  const getColor = () => {
    if (score >= 70) return "#22C55E";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
  };

  const getLabel = () => {
    if (score >= 90) return "Elite Discipline 🔥";
    if (score >= 70) return "Strong Foundation 💪";
    if (score >= 50) return "Room to Grow 🌱";
    return "Starting Journey ⭐";
  };

  const ringColor = getColor();

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative">
      {/* particle dots background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              y: Math.random() * 500 - 250,
              x: Math.random() * 300 - 150,
            }}
            animate={{ opacity: [0, 0.5, 0], y: Math.random() * -100 - 50 }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full blur-[1px]"
          />
        ))}
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke={ringColor}
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ strokeDasharray: "0, 1000" }}
            animate={{
              strokeDasharray: `${(score / 100) * (2 * Math.PI * 120)}, 1000`,
            }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </svg>
        <div className="flex flex-col items-center justify-center">
          <span className="font-sora text-[64px] font-extrabold text-white leading-none">
            {score}
          </span>
        </div>
      </div>

      <h2 className="font-sora text-2xl font-bold mb-4 text-center">
        {getLabel()}
      </h2>

      <p className="text-center text-white/60 mb-12 max-w-sm px-4">
        Your choices reflect where your discipline stands today. By joining
        Zenith, you'll track and improve these habits systematically.
      </p>

      <div className="mt-auto w-full">
        <PremiumButton
          onClick={() =>
            navigate("/login", { state: { score: targetScore, answers } })
          }
        >
          Create My Profile →
        </PremiumButton>
      </div>
    </div>
  );
}
