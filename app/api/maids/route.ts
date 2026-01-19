import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const { user } = await requireAuth(req);
  const userId = user.id;

  const { data, error } = await supabase
    .from("maids")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { user } = await requireAuth(req);
  const userId = user.id;
  const body = await req.json();

  const { data, error } = await supabase
    .from("maids")
    .insert({
      ...body,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
