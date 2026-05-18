import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, orderBy, limit, doc, updateDoc } from "firebase/firestore";
import { GlassCard } from "../../components/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";

export default function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const snap = await getDocs(q);
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (userToSave: any) => {
    try {
      setSaving(true);
      await updateDoc(doc(db, "users", userToSave.id), {
        coins: userToSave.coins,
        streaks: userToSave.streaks,
        ...(userToSave.rankHistory ? { rankHistory: userToSave.rankHistory } : {})
      });
      setEditingUser(null);
      fetchUsers();
    } catch (e) {
      console.error(e);
      // No alert to prevent iframe issues
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="text-white/50 text-center py-4">Loading users...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <GlassCard key={u.id} className="!p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-[15px]">
                    {u.name}{" "}
                    <span className="text-white/40 text-xs ml-2">
                       UID: {u.uid || u.id}
                    </span>
                  </div>
                  <div className="text-[12px] text-white/60 mt-1">
                    Coins:{" "}
                    <span className="text-amber-500 font-bold">{u.coins}</span>{" "}
                    &nbsp;&middot;&nbsp; Strk:{" "}
                    {Math.min(
                      u.streaks?.noMasturbation?.count || 0,
                      u.streaks?.noSex?.count || 0,
                    )}
                    d
                  </div>
                </div>
                <button
                   onClick={() => setEditingUser(JSON.parse(JSON.stringify(u)))}
                   className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold transition"
                >
                   Edit
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => !saving && setEditingUser(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: 'calc(100vh - 40px)' }}
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-sora font-semibold text-white">Edit User</h3>
                <button 
                  onClick={() => !saving && setEditingUser(null)}
                  className="text-white/50 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-white/60">Name (ReadOnly)</label>
                  <input 
                    readOnly
                    type="text" 
                    value={editingUser.name || 'Anonymous'}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-white/60">Coins</label>
                  <input 
                    type="number" 
                    value={editingUser.coins}
                    onChange={(e) => setEditingUser({ ...editingUser, coins: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-white/60">Rank</label>
                  <select 
                    value={editingUser.rankHistory?.currentRank || 'novice'}
                    onChange={(e) => {
                      const newRank = e.target.value;
                      const currentClaimed = editingUser.rankHistory?.claimedRanks || [];
                      const newClaimed = currentClaimed.includes(newRank) ? currentClaimed : [...currentClaimed, newRank];
                      setEditingUser({ 
                        ...editingUser, 
                        rankHistory: { 
                          currentRank: newRank, 
                          claimedRanks: newClaimed
                        } 
                      });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="novice">The Novice</option>
                    <option value="iron_will">Iron Will</option>
                    <option value="mind">Mind Master</option>
                    <option value="aura">Aura Awakened</option>
                    <option value="alchemist">The Alchemist</option>
                    <option value="sovereign">Sovereign</option>
                    <option value="monk">The Monk</option>
                  </select>
                </div>

                {/* NO MASTURBATION */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="font-semibold text-sm mb-2">No M Streak</div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs text-white/60 w-16">Days:</label>
                    <input 
                      type="number" 
                      value={editingUser.streaks?.noMasturbation?.count || 0}
                      onChange={(e) => setEditingUser({ 
                        ...editingUser, 
                        streaks: { 
                          ...editingUser.streaks, 
                          noMasturbation: { ...editingUser.streaks?.noMasturbation, count: parseInt(e.target.value) || 0 } 
                        } 
                      })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-1.5 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/60 w-16">Broken:</label>
                    <input 
                      type="checkbox" 
                      checked={editingUser.streaks?.noMasturbation?.broken || false}
                      onChange={(e) => setEditingUser({ 
                        ...editingUser, 
                        streaks: { 
                          ...editingUser.streaks, 
                          noMasturbation: { ...editingUser.streaks?.noMasturbation, broken: e.target.checked } 
                        } 
                      })}
                      className="w-4 h-4"
                    />
                  </div>
                </div>

                {/* NO SEX */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="font-semibold text-sm mb-2">No P Streak</div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs text-white/60 w-16">Days:</label>
                    <input 
                      type="number" 
                      value={editingUser.streaks?.noSex?.count || 0}
                      onChange={(e) => setEditingUser({ 
                        ...editingUser, 
                        streaks: { 
                          ...editingUser.streaks, 
                          noSex: { ...editingUser.streaks?.noSex, count: parseInt(e.target.value) || 0 } 
                        } 
                      })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-1.5 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/60 w-16">Broken:</label>
                    <input 
                      type="checkbox" 
                      checked={editingUser.streaks?.noSex?.broken || false}
                      onChange={(e) => setEditingUser({ 
                        ...editingUser, 
                        streaks: { 
                          ...editingUser.streaks, 
                          noSex: { ...editingUser.streaks?.noSex, broken: e.target.checked } 
                        } 
                      })}
                      className="w-4 h-4"
                    />
                  </div>
                </div>

                {/* NO SUGAR */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="font-semibold text-sm mb-2">No Sugar Streak</div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs text-white/60 w-16">Days:</label>
                    <input 
                      type="number" 
                      value={editingUser.streaks?.noSugar?.count || 0}
                      onChange={(e) => setEditingUser({ 
                        ...editingUser, 
                        streaks: { 
                          ...editingUser.streaks, 
                          noSugar: { ...editingUser.streaks?.noSugar, count: parseInt(e.target.value) || 0 } 
                        } 
                      })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-1.5 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/60 w-16">Broken:</label>
                    <input 
                      type="checkbox" 
                      checked={editingUser.streaks?.noSugar?.broken || false}
                      onChange={(e) => setEditingUser({ 
                        ...editingUser, 
                        streaks: { 
                          ...editingUser.streaks, 
                          noSugar: { ...editingUser.streaks?.noSugar, broken: e.target.checked } 
                        } 
                      })}
                      className="w-4 h-4"
                    />
                  </div>
                </div>
                
              </div>

              <div className="p-4 border-t border-white/10 bg-black/20 flex gap-3">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSave(editingUser)}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition flex justify-center items-center gap-2"
                >
                  {saving ? 'Saving...' : <><Save size={18} /> Save</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
