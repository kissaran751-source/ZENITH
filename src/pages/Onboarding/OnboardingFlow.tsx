import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import WelcomeSlide from "./WelcomeSlide";
import SugarSlide from "./SugarSlide";
import MasturbationSlide from "./MasturbationSlide";
import SexSlide from "./SexSlide";
import ScoreSlide from "./ScoreSlide";

export default function OnboardingFlow() {
  const [slide, setSlide] = useState(1);
  const [answers, setAnswers] = useState({
    sugarSources: [] as string[],
    sugarFrequency: "",
    masturbationFrequency: "",
    sexFrequency: "",
  });

  const nextSlide = () => setSlide((s) => Math.min(s + 1, 5));

  const updateAnswers = (data: Partial<typeof answers>) => {
    setAnswers((prev) => ({ ...prev, ...data }));
  };

  const renderSlide = () => {
    switch (slide) {
      case 1:
        return <WelcomeSlide onNext={nextSlide} />;
      case 2:
        return (
          <SugarSlide
            onNext={nextSlide}
            answers={answers}
            updateAnswers={updateAnswers}
          />
        );
      case 3:
        return (
          <MasturbationSlide
            onNext={nextSlide}
            answers={answers}
            updateAnswers={updateAnswers}
          />
        );
      case 4:
        return (
          <SexSlide
            onNext={nextSlide}
            answers={answers}
            updateAnswers={updateAnswers}
          />
        );
      case 5:
        return <ScoreSlide onNext={() => {}} answers={answers} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-hidden relative text-white">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Dots Indicator */}
      {slide < 5 && (
        <div className="absolute top-12 left-0 right-0 flex justify-center gap-2 z-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === slide ? "bg-blue-500" : "bg-white/20"}`}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-screen w-full flex flex-col pt-24 px-6 pb-12 overflow-y-auto hide-scrollbar relative z-10"
        >
          {renderSlide()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
