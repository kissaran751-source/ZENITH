import { AppUser } from "../contexts/AuthContext";

export const getGuestUser = (): AppUser => {
  const stored = localStorage.getItem('guest_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return {
    uid: "guest",
    name: "Guest",
    email: "",
    role: "GUEST",
    adminAccess: false,
    createdAt: new Date().toISOString(),
    theme: "dark",
    coins: 0,
    onboardingDone: true,
    streaks: {
      noMasturbation: { count: 0, lastChecked: "", broken: false, brokenAt: null },
      noSex:          { count: 0, lastChecked: "", broken: false, brokenAt: null },
      noSugar:        { count: 0, lastChecked: "", broken: false, brokenAt: null },
    },
    loginStreak: { count: 0, lastLogin: "", claimedDays: [] },
    rankHistory: { currentRank: "novice", claimedRanks: ["novice"] },
    auraLevel: 0,
    streakFreezes: 0,
    firebaseUid: "guest"
  };
};

export const saveGuestUser = (user: AppUser) => {
  localStorage.setItem('guest_user', JSON.stringify(user));
};

export const guestMidnightStreakCheck = async (user: AppUser, setUser: (u: AppUser) => void) => {
  // same logic as midnight check
  let needsUpdate = false;
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date(Date.now() - 86400000);
  const yesterday = yesterdayDate.toISOString().split('T')[0];
  const streaks = ["noMasturbation", "noSex", "noSugar"] as const;

  const newUser = { ...user, streaks: { ...user.streaks } };

  for (const streakType of streaks) {
    const streak = newUser.streaks[streakType];
    if (streak.broken) continue;
    if (streak.lastChecked === "") continue;

    if (streak.lastChecked !== today && streak.lastChecked !== yesterday) {
      streak.broken = true;
      streak.brokenAt = new Date().toISOString();
      streak.count = 0;
      needsUpdate = true;
    }
  }

  if (needsUpdate) {
    saveGuestUser(newUser);
    setUser(newUser);
  }
};

export const guestDailyCheckIn = async (user: AppUser, setUser: (u: AppUser) => void, noMasturbation: boolean, noSex: boolean) => {
  const today = new Date().toISOString().split('T')[0];
  const logsStr = localStorage.getItem('guest_logs') || '{}';
  const logs = JSON.parse(logsStr);

  if (logs[today]?.checkedIn) {
    throw new Error("Already checked in today");
  }

  const newUser = { ...user, streaks: { ...user.streaks } };

  if (noMasturbation) {
    if (newUser.streaks.noMasturbation.broken) {
      newUser.streaks.noMasturbation.broken = false;
      newUser.streaks.noMasturbation.brokenAt = null;
      newUser.streaks.noMasturbation.count = 1;
    } else {
      newUser.streaks.noMasturbation.count = (newUser.streaks.noMasturbation.count || 0) + 1;
    }
  } else {
    newUser.streaks.noMasturbation.broken = true;
    newUser.streaks.noMasturbation.brokenAt = new Date().toISOString();
    newUser.streaks.noMasturbation.count = 0;
  }

  if (noSex) {
    if (newUser.streaks.noSex.broken) {
      newUser.streaks.noSex.broken = false;
      newUser.streaks.noSex.brokenAt = null;
      newUser.streaks.noSex.count = 1;
    } else {
      newUser.streaks.noSex.count = (newUser.streaks.noSex.count || 0) + 1;
    }
  } else {
    newUser.streaks.noSex.broken = true;
    newUser.streaks.noSex.brokenAt = new Date().toISOString();
    newUser.streaks.noSex.count = 0;
  }

  newUser.streaks.noMasturbation.lastChecked = today;
  newUser.streaks.noSex.lastChecked = today;

  logs[today] = { checkedIn: true, noMasturbation, noSex, timestamp: new Date().toISOString() };
  localStorage.setItem('guest_logs', JSON.stringify(logs));
  
  saveGuestUser(newUser);
  setUser(newUser);
};
