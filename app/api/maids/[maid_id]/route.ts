import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/api-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { maid_id: string } }
) {
  const { userId } = await requireAuth(req);
  const body = await req.json();

  const { error } = await supabase
    .from("maids")
    .update(body)
    .eq("id", params.maid_id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { maid_id: string } }
) {
  const { userId } = await requireAuth(req);

  const { error } = await supabase
    .from("maids")
    .delete()
    .eq("id", params.maid_id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ success: true });
}
