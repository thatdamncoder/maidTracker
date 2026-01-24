// app/dashboard/layout.tsx
import { auth } from "@/auth";
import Header from "@/components/Header";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children } : { children: React.ReactNode}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCFE]">
      <Header/>
      <main className="grow container mx-auto px-4 py-4 md:py-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
