import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import UsersTab from "./UsersTab";
import RequestsTab from "./RequestsTab";
import TasksTab from "./TasksTab";
import GiftsTab from "./GiftsTab";
import StoreItemsTab from "./StoreItemsTab";

export default function AdminPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState("users");

  if (!user || user.role !== 'SUPER_ADMIN' || !user.adminAccess) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: "users", label: "Users" },
    { id: "requests", label: "Requests" },
    { id: "tasks", label: "Tasks" },
    { id: "gifts", label: "Gifts" },
    { id: "store", label: "Store" },
  ];

  return (
    <div className="pt-4 pb-20 overflow-x-hidden text-white min-h-screen">
      <div className="px-4 mb-4">
        <h1 className="font-sora text-2xl font-bold mb-4">Admin Panel</h1>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors flex-shrink-0 ${tab === t.id ? "bg-[var(--blue-gradient)] text-white" : "bg-white/10 text-white/70"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {tab === "users" && <UsersTab />}
        {tab === "requests" && <RequestsTab />}
        {tab === "tasks" && <TasksTab />}
        {tab === "gifts" && <GiftsTab />}
        {tab === "store" && <StoreItemsTab />}
      </div>
    </div>
  );
}
