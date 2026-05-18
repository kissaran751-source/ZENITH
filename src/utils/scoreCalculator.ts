export function calculateScore(answers: any) {
  let score = 100;

  const { sugarSources, sugarFrequency, masturbationFrequency, sexFrequency } =
    answers || {};

  // Sugar
  if (sugarSources && sugarSources.length > 0) {
    if (sugarFrequency === "Daily") {
      if (sugarSources.length >= 3) score -= 25;
      else if (sugarSources.length >= 2) score -= 20;
      else if (sugarSources.length >= 1) score -= 15;
    } else if (sugarFrequency === "Few times/week") {
      score -= 10;
    } else if (sugarFrequency === "Weekly") {
      score -= 5;
    } else if (sugarFrequency === "Rarely") {
      score -= 2;
    }
  }

  // Masturbation
  if (masturbationFrequency === "daily") score -= 30;
  else if (masturbationFrequency === "few_times_week") score -= 20;
  else if (masturbationFrequency === "weekly") score -= 10;
  else if (masturbationFrequency === "monthly") score -= 5;

  // Sex
  if (sexFrequency === "daily") score -= 20;
  else if (sexFrequency === "few_times_week") score -= 10;
  else if (sexFrequency === "weekly") score -= 5;
  else if (sexFrequency === "monthly") score -= 2;

  return Math.max(0, score);
}
