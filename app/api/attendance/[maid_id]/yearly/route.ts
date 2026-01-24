import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/api-auth";

interface Params {
  maid_id: string;
}

/**
 * GET /attendance/{maid_id}/yearly?year=
 * Returns total absents per month
 */
export async function GET(req: NextRequest, {params} : {params: Promise<Params>}) {
  const authContext = await requireAuth(req);

    if (!authContext) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
    const { user } = authContext;
    const {maid_id} = await params;
  const { searchParams } = new URL(req.url);

  const year = Number(searchParams.get("year"));
  if (!year) {
    return NextResponse.json(
      { error: "year is required" },
      { status: 400 }
    );
  }
  console.log(maid_id, user.id, year);

  const { data, error } = await supabase
    .from("attendance_monthly")
    .select("month, total_absent")
    .eq("maid_id", maid_id)
    .eq("user_id", user.id)
    .eq("year", year)
    .order("month");

  if (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }

  return NextResponse.json({
    year,
    summary: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total_absent: data.find(d => d.month === i + 1)?.total_absent ?? 0,
    })),
  });
}
