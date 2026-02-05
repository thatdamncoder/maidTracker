import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

interface Params {
  payment_id: string;
  maid_id: string;
}

/* ---------------- PUT: update payment ---------------- */
export async function PUT(req: Request, { params }: { params: Promise<Params> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { payment_id, maid_id } = await params;
  const body = await req.json();

  const updates = {
    amount: body.amount,
    note: body.note,
    payment_date: body.date, // ✅ correct mapping
  };

  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("payments")
    .update(updates)
    .eq("id", payment_id)
    .eq("maid_id", maid_id)
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) {
    console.error("Update payment error:", error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }

  return NextResponse.json(data);
}

/* ---------------- DELETE: delete payment + image ---------------- */
export async function DELETE( req: Request, { params }: { params: Promise<Params> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { payment_id, maid_id } = await params;
  const { image_path } = await req.json();

  if (!image_path) {
    return NextResponse.json({ error: "Missing image_path" }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();

  await supabase.storage.from("receipts").remove([image_path]);

  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", payment_id)
    .eq("maid_id", maid_id)
    .eq("user_id", session.user.id);

  if (error) {
    console.error("DB delete failed:", error);
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
