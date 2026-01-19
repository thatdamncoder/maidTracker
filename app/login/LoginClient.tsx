"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Login from "@/components/Login";

export default function LoginClient() {
  const router = useRouter();

  const onLogin = async (type: "google" | "guest") => {
    if (type === "google") {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
      return;
    }

    // Guest login
    await fetch("/api/auth/guest", { method: "POST" });
    router.refresh(); // re-run server auth check
  };

  return <Login/>;
}
