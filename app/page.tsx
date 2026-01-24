import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  console.log("session inside home", session);
  redirect(session ? "/dashboard" : "/login");
}
