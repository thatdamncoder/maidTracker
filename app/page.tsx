import { auth } from "@/auth";
import Dashboard from "@/components/Dashboard";
import Login from "@/components/Login";
import { signIn } from "next-auth/react";

export default async function Home() {
  return <Login />
}
