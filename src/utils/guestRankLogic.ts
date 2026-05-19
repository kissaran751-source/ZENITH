import { AppUser } from "../contexts/AuthContext";
import { saveGuestUser } from "./guestLogic";
import { RANKS } from "./rankLogic";

export const guestCheckAndClaimRank = async (user: AppUser, setUser: (u: AppUser) => void, mainStreak: number, showToast: any) => {
  const availableRanks = RANKS.filter(r => r.minDay <= mainStreak);
  const highestRank = availableRanks[availableRanks.length - 1];
  
  if (!highestRank) return null;

  const currentClaimed = user.rankHistory.claimedRanks || [];
  
  if (currentClaimed.includes(highestRank.id)) {
    return null; // Already claimed this rank
  }

  const newClaimedId = highestRank.id;
  const newClaimedRanks = [...currentClaimed, newClaimedId];
  
  const newUser = { ...user, rankHistory: { ...user.rankHistory }, coins: user.coins + highestRank.coins };
  newUser.rankHistory.currentRank = newClaimedId;
  newUser.rankHistory.claimedRanks = newClaimedRanks;

  saveGuestUser(newUser);
  setUser(newUser);

  return highestRank;
};
