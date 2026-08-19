"use client";

import { useState } from "react";

export function GardenTabs({ garden, calendar }: { garden: React.ReactNode; calendar: React.ReactNode }) {
  const [tab, setTab] = useState<"garden" | "calendar">("garden");

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-lg border border-border-soft bg-parchment-100 p-1">
        <button
          onClick={() => setTab("garden")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === "garden" ? "bg-surface text-canopy-800 shadow-sm" : "text-canopy-500"
          }`}
        >
          🌳 Mon jardin
        </button>
        <button
          onClick={() => setTab("calendar")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === "calendar" ? "bg-surface text-canopy-800 shadow-sm" : "text-canopy-500"
          }`}
        >
          📅 Calendrier
        </button>
      </div>
      <div hidden={tab !== "garden"}>{garden}</div>
      <div hidden={tab !== "calendar"}>{calendar}</div>
    </div>
  );
}
