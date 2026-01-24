"use client";

import { useState, useEffect } from "react";

import { Helper } from "@/types/types";
import Dashboard from "@/components/Dashboard";

export default function UserDashboard() {
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMaids = async () => {
      setLoading(true);
      const res = await fetch("/api/maids");
      if (res.ok) {
        const data = await res.json();
        setHelpers(
          data.map((m: any) => ({ ...m, receipts: [], records: [] }))
        );
      }
      setLoading(false);
    };

    fetchMaids();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFE]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium text-sm animate-pulse">
            Getting your maids...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      helpers={helpers}
      onAddHelper={(h) => setHelpers((p) => [...p, h])}
      onDeleteHelper={(id) =>
        setHelpers((p) => p.filter((h) => h.id !== id))
      }
    />
  );
}
