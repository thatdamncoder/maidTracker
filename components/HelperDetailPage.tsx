
"use client"
import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Helper } from "@/types/types";
import HelperDetail from "@/components/HelperDetail";

export default function HelperDetailPage({helper_id} : {helper_id: string}) {
  const router = useRouter();

  const [helper, setHelper] = useState<Helper | null>(null);
  const [loading, setLoading] = useState(true);
  console.log("helperid", helper_id)

  useEffect(() => {
    const fetchHelper = async () => {
      try {
        const res = await fetch(`/api/maids/${helper_id}`);
        if (!res.ok) {
          router.replace("/dashboard");
          return;
        }
        setHelper(await res.json());
      } catch {
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchHelper();
  }, [helper_id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFE]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!helper) {
    notFound();
  }

  return (
    <HelperDetail
      helper={helper}
      onUpdateHelper={setHelper}
      onBack={() => router.push("/dashboard")}
    />
  );
}