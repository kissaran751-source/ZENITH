import React, { useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { GlassCard } from "../../components/GlassCard";
import { PremiumButton } from "../../components/PremiumButton";
import { useToast } from "../../components/Toast";

export default function GiftsTab() {
  const [form, setForm] = useState({ uid: "", amount: 1000, note: "" });
  const { showToast } = useToast();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", form.uid));
      const snap = await getDocs(q);
      if (snap.empty) throw new Error("User UID not found");

      const target = snap.docs[0];

      const newRef = doc(collection(db, "gifts"));
      await setDoc(newRef, {
        toUid: target.data().uid,
        toFirebaseUid: target.id,
        coins: form.amount,
        note: form.note,
        sentAt: serverTimestamp(),
        claimed: false,
        claimedAt: null,
      });
      showToast(`Gift sent to ${target.data().name}!`, "success");
      setForm({ uid: "", amount: 1000, note: "" });
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <GlassCard className="!p-4 border border-white/20">
        <h3 className="font-semibold mb-3">Send Gift</h3>
        <form onSubmit={handleSend} className="flex flex-col gap-3">
          <input
            required
            placeholder="User UID (e.g. 1001)"
            value={form.uid}
            onChange={(e) => setForm({ ...form, uid: e.target.value })}
            className="bg-white/10 px-3 py-2 rounded-md text-sm outline-none"
          />
          <input
            required
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: Number(e.target.value) })
            }
            className="bg-white/10 px-3 py-2 rounded-md text-sm outline-none"
          />
          <input
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="bg-white/10 px-3 py-2 rounded-md text-sm outline-none"
          />
          <PremiumButton size="sm" type="submit">
            Send Gift
          </PremiumButton>
        </form>
      </GlassCard>
    </div>
  );
}
