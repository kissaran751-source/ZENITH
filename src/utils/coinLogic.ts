import {
  doc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export async function handleUnclaimedGifts(
  appUid: string,
  firebaseUid: string,
) {
  try {
    const giftsRef = collection(db, "gifts");
    const q = query(
      giftsRef,
      where("toFirebaseUid", "==", firebaseUid),
      where("claimed", "==", false),
    );

    const snap = await getDocs(q);
    if (snap.empty) return;

    const userRef = doc(db, "users", firebaseUid);
    let totalCoinsToCredit = 0;
    const updatePromises: any[] = [];

    snap.docs.forEach((giftDoc) => {
      totalCoinsToCredit += giftDoc.data().coins;
      updatePromises.push(
        updateDoc(doc(db, "gifts", giftDoc.id), {
          claimed: true,
          claimedAt: serverTimestamp(),
        }),
      );
    });

    if (totalCoinsToCredit > 0) {
      await updateDoc(userRef, {
        coins: increment(totalCoinsToCredit),
      });
      await Promise.all(updatePromises);

      // Log this in transactions? Let's skip detailed logs of gift claims for brevity unless required.
      // Often a good idea though.
    }
  } catch (err) {
    console.error("Error checking gifts:", err);
  }
}
