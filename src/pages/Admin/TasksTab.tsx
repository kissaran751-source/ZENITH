import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { GlassCard } from "../../components/GlassCard";
import { PremiumButton } from "../../components/PremiumButton";
import { useToast } from "../../components/Toast";

export default function TasksTab() {
  const [tasks, setTasks] = useState<any[]>([]);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    pricePerUnit: 10,
    unit: "",
    hasSlider: false,
    sliderMin: 1,
    sliderMax: 10,
    sliderLabel: "",
    requiresApproval: false,
    isActive: true,
  });

  const fetchTasks = async () => {
    const q = query(collection(db, "tasks"));
    const snap = await getDocs(q);
    setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRef = doc(collection(db, "tasks"));
      await setDoc(newRef, {
        ...form,
        createdAt: serverTimestamp(),
        createdBy: "1000",
      });
      showToast("Task created", "success");
      fetchTasks();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <GlassCard className="!p-4 border border-white/20">
        <h3 className="font-semibold mb-3">Add New Task</h3>
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-white/10 px-3 py-2 rounded-md text-sm outline-none"
          />
          <input
            required
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="bg-white/10 px-3 py-2 rounded-md text-sm outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              required
              type="number"
              placeholder="Price Per Unit"
              value={form.pricePerUnit}
              onChange={(e) =>
                setForm({ ...form, pricePerUnit: Number(e.target.value) })
              }
              className="bg-white/10 px-3 py-2 rounded-md text-sm outline-none"
            />
            <input
              placeholder="Unit (e.g. min, reps)"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="bg-white/10 px-3 py-2 rounded-md text-sm outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.hasSlider}
              onChange={(e) =>
                setForm({ ...form, hasSlider: e.target.checked })
              }
            />{" "}
            Has Slider
          </label>
          {form.hasSlider && (
            <div className="grid grid-cols-3 gap-2">
              <input
                required
                type="number"
                placeholder="Min"
                value={form.sliderMin}
                onChange={(e) =>
                  setForm({ ...form, sliderMin: Number(e.target.value) })
                }
                className="bg-white/10 px-3 py-2 rounded-md text-sm outline-none"
              />
              <input
                required
                type="number"
                placeholder="Max"
                value={form.sliderMax}
                onChange={(e) =>
                  setForm({ ...form, sliderMax: Number(e.target.value) })
                }
                className="bg-white/10 px-3 py-2 rounded-md text-sm outline-none"
              />
              <input
                placeholder="Lbl"
                value={form.sliderLabel}
                onChange={(e) =>
                  setForm({ ...form, sliderLabel: e.target.value })
                }
                className="bg-white/10 px-3 py-2 rounded-md text-sm outline-none"
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.requiresApproval}
              onChange={(e) =>
                setForm({ ...form, requiresApproval: e.target.checked })
              }
            />{" "}
            Requires Approval
          </label>
          <PremiumButton size="sm" type="submit">
            Save Task
          </PremiumButton>
        </form>
      </GlassCard>

      <div className="flex flex-col gap-2">
        {tasks.map((t) => (
          <GlassCard key={t.id} className="!p-3 opacity-90">
            <div className="font-semibold text-sm">{t.name}</div>
            <div className="text-xs text-white/50">
              {t.pricePerUnit} coins / {t.unit}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
