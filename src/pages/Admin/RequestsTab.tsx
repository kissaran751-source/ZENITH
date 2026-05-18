import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { GlassCard } from "../../components/GlassCard";
import { useToast } from "../../components/Toast";

export default function RequestsTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchReq();
  }, []);

  const fetchReq = async () => {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleAction = async (
    id: string,
    fbUid: string,
    coins: number,
    action: "approved" | "rejected",
  ) => {
    try {
      if (action === "approved") {
        const uRef = doc(db, "users", fbUid);
        await updateDoc(uRef, { coins: increment(coins) });
      }
      await updateDoc(doc(db, "requests", id), { status: action });
      showToast(`Request ${action}`, "success");
      fetchReq();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {requests
        .filter((r) => r.status === "pending")
        .map((r) => (
          <GlassCard key={r.id} className="!p-4 border border-blue-500/30">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold text-sm">Task: {r.taskName}</div>
                <div className="text-[12px] text-white/50 mt-1">
                  User UID: {r.uid}
                </div>
                <div className="text-[12px] text-white/50">
                  Amount:{" "}
                  <span className="text-amber-500 font-bold">
                    {r.coinAmount}
                  </span>{" "}
                  coins
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() =>
                    handleAction(r.id, r.firebaseUid, r.coinAmount, "approved")
                  }
                  className="bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-md font-semibold"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    handleAction(r.id, r.firebaseUid, r.coinAmount, "rejected")
                  }
                  className="bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-md font-semibold"
                >
                  Reject
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      <div className="mt-4">
        <h3 className="text-sm font-semibold opacity-50 mb-2">Processed</h3>
      </div>
      {requests
        .filter((r) => r.status !== "pending")
        .map((r) => (
          <GlassCard key={r.id} className="!p-4 opacity-50">
            <div className="font-semibold text-sm">
              Task: {r.taskName}{" "}
              <span
                className={`text-xs ml-2 ${r.status === "approved" ? "text-green-500" : "text-red-500"}`}
              >
                [{r.status}]
              </span>
            </div>
            <div className="text-[12px] text-white/50 mt-1">
              User UID: {r.uid} - {r.coinAmount} coins
            </div>
          </GlassCard>
        ))}
    </div>
  );
}
