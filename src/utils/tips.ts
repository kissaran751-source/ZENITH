export const TIPS = [
  "Energy saved is energy earned. Every day of retention is a deposit into your power account.",
  "Cold showers transmute urges into discipline. Start with 30 seconds of cold at the end.",
  "Your mind will test you. The urge lasts only 3 minutes. Outlast it.",
  "Avoid phone usage first 30 minutes of waking. Protect your morning energy.",
  "Physical exercise is the #1 tool for transmuting sexual energy into strength.",
  "When the urge hits, do 20 pushups immediately. Change the physical state.",
  "Boredom is the enemy. Keep your schedule tight and purposeful.",
  "Lust is a parasite on your focus. Starve it.",
  "True freedom is not doing whatever you want, but having the power to choose what is right.",
  "Your attention is your most valuable asset. Stop giving it away to pixels.",
  "Meditation builds the gap between stimulus and response.",
  "Sugar spikes your dopamine, leading to crashes that weaken willpower.",
  "The harder the battle, the sweeter the victory.",
  "Don't count the days, make the days count.",
  "You cannot conquer the world until you conquer yourself.",
  "Transmutation: channel the raw energy into a creative or physical pursuit.",
  "Every time you say 'no' to an urge, you say 'yes' to your potential.",
  "Fasting strengthens the will. Try pushing your first meal back by an hour.",
  "Discipline weighs ounces, regret weighs tons.",
  "Your environment dictates your habits. Clean your room, clear your mind.",
  "A slip is not a fall unless you choose to stay down.",
  "Visualize your highest self. Act from that identity today.",
  "Comparison is the thief of joy. Focus on your own streak, your own path.",
  "The pain of discipline is temporary. The glory of mastery is permanent.",
  "Sleep is the foundation. Protect your 8 hours to maintain your willpower.",
  "Small wins compound. Today's clean day is tomorrow's momentum.",
  "Forgive yourself for the past, but demand better for the future.",
  "Read something elevating for 10 minutes a day to reprogram the mind.",
  "Gratitude shifts focus from what you lack to what you have.",
  "You are the master of your vessel. Take the wheel.",
];

export function getDailyTip() {
  const dayOfYear = Math.floor(
    (new Date().getTime() -
      new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  return TIPS[dayOfYear % TIPS.length];
}
