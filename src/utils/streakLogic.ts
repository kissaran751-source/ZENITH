import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";
import { format, differenceInHours, parseISO } from "date-fns";

export const getTodayStr = () => format(new Date(), "yyyy-MM-dd");
export const getYesterdayStr = () =>
  format(new Date(Date.now() - 86400000), "yyyy-MM-dd");

// Add a helper for firestore errors
function handleFirestoreError(
  error: unknown,
  operationType: string,
  path: string | null,
) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function midnightStreakCheck(firebaseUid: string) {
  const today = getTodayStr();
  const yesterday = getYesterdayStr();

  const userRef = doc(db, "users", firebaseUid);
  try {
    const userDoc = await getDoc(userRef);
    const user = userDoc.data();
    if (!user || !user.streaks) return;

    // Check each streak's lastChecked
    const streaks = ["noMasturbation", "noSex"] as const;
    let updates: any = {};
    let needsUpdate = false;

    for (const streakType of streaks) {
      const streak = user.streaks[streakType];
      if (streak.broken) continue;
      if (streak.lastChecked === "") continue;

      if (streak.lastChecked !== today && streak.lastChecked !== yesterday) {
        updates[`streaks.${streakType}.broken`] = true;
        updates[`streaks.${streakType}.brokenAt`] = serverTimestamp();
        updates[`streaks.${streakType}.count`] = 0;
        needsUpdate = true;
      }
    }

    const sugarStreak = user.streaks.noSugar;
    if (sugarStreak && sugarStreak.lastChecked !== "") {
      if (
        !sugarStreak.broken &&
        sugarStreak.lastChecked !== today &&
        sugarStreak.lastChecked !== yesterday
      ) {
        updates["streaks.noSugar.broken"] = true;
        updates["streaks.noSugar.brokenAt"] = serverTimestamp();
        updates["streaks.noSugar.count"] = 0;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      await updateDoc(userRef, updates);
    }
  } catch (err) {
    handleFirestoreError(err, "write", `users/${firebaseUid}`);
  }
}

export async function dailyCheckIn(
  firebaseUid: string,
  noMasturbation: boolean,
  noSex: boolean,
) {
  if (firebaseUid === "guest") {
    // We will handle guest logic directly in the components through context updates for simplicity.
    // Instead of throwing an error, we can just return, but we want the UI components to know it's a guest
    // and update React Context directly. Wait! The components call these functions directly!
    // So if it's guest, throw a special error so the component can handle it?
    // Or we export `dailyCheckInGuest`?
    return false; // Not handled here
  }

  const today = getTodayStr();
  const userRef = doc(db, "users", firebaseUid);
  const logRef = doc(db, "users", firebaseUid, "dailyLogs", today);

  try {
    const existingLog = await getDoc(logRef);
    if (existingLog.exists() && existingLog.data().checkedIn) {
      throw new Error("Already checked in today");
    }

    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    if (!userData) throw new Error("User not found");

    const updates: any = {
      "streaks.noMasturbation.lastChecked": today,
      "streaks.noSex.lastChecked": today,
    };

    if (noMasturbation) {
      if (userData.streaks.noMasturbation.broken) {
        updates["streaks.noMasturbation.broken"] = false;
        updates["streaks.noMasturbation.brokenAt"] = null;
        updates["streaks.noMasturbation.count"] = 1;
      } else {
        updates["streaks.noMasturbation.count"] = (userData.streaks.noMasturbation.count || 0) + 1;
      }
    } else {
      updates["streaks.noMasturbation.broken"] = true;
      updates["streaks.noMasturbation.brokenAt"] = serverTimestamp();
      updates["streaks.noMasturbation.count"] = 0;
    }

    if (noSex) {
      if (userData.streaks.noSex.broken) {
        updates["streaks.noSex.broken"] = false;
        updates["streaks.noSex.brokenAt"] = null;
        updates["streaks.noSex.count"] = 1;
      } else {
        updates["streaks.noSex.count"] = (userData.streaks.noSex.count || 0) + 1;
      }
    } else {
      updates["streaks.noSex.broken"] = true;
      updates["streaks.noSex.brokenAt"] = serverTimestamp();
      updates["streaks.noSex.count"] = 0;
    }

    await updateDoc(userRef, updates);
    await setDoc(logRef, {
      checkedIn: true,
      noMasturbation,
      noSex,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, "write", `users/${firebaseUid}`);
  }
}

export async function restoreStreak(
  firebaseUid: string,
  type: "noMasturbation" | "noSex" | "noSugar" | "both",
  cost: number,
) {
  const userRef = doc(db, "users", firebaseUid);

  try {
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    if (!userData) throw new Error("User not found");

    if (userData.coins < cost) throw new Error("Not enough coins");

    const updates: any = { coins: userData.coins - cost };

    const types = type === "both" ? ["noMasturbation", "noSex"] : [type];

    for (const t of types) {
      const streak = userData.streaks[t];
      if (!streak.broken) throw new Error(`${t} streak is not broken`);

      const hoursSince = differenceInHours(
        new Date(),
        streak.brokenAt.toDate(),
      );
      if (hoursSince > 48)
        throw new Error(`Restore window expired (48h limit) for ${t}`);

      updates[`streaks.${t}.broken`] = false;
      updates[`streaks.${t}.brokenAt`] = null;
      updates[`streaks.${t}.lastChecked`] = getTodayStr();
    }

    await updateDoc(userRef, updates);
  } catch (err) {
    handleFirestoreError(err, "write", `users/${firebaseUid}`);
  }
}
