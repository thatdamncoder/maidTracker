import { createServiceRoleSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

interface Params {
  maid_id: string;
}

/* ---------------- GET: list payments ---------------- */
export async function GET(_req: Request, { params }: { params: Promise<Params> }) {

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { maid_id } = await params;

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("maid_id", maid_id)
    .eq("user_id", session.user.id)
    .order("payment_date", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }

  const enriched = await Promise.all(
    data.map(async (p) => {
      const { data: signed } = await supabase.storage
        .from("receipts")
        .createSignedUrl(p.image_path, 60 * 60);

      return {
        id: p.id,
        amount: p.amount,
        note: p.note,
        paymentDate: p.payment_date, 
        imagePath: p.image_path,     
        imageUrl: signed?.signedUrl,
      };
    })
  );

  return NextResponse.json(enriched);
}

/* ---------------- POST: create payment ---------------- */
export async function POST( req: Request, { params }: { params: Promise<Params> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imagePath, amount, note, date } = await req.json();
  if (!imagePath || !amount || !date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const {maid_id} = await params;

  const { data, error } = await supabase
    .from("payments")
    .insert({
      maid_id: maid_id,
      user_id: session.user.id,
      image_path: imagePath,
      amount,
      note,
      payment_date: date,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
