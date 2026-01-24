import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/api-auth";

interface Params {
  maid_id: string;
}

/**
 * GET /attendance-exceptions/{maid_id}?month=&year=&status? (status is optional)
 * Fetch notes / exceptions for analytics & listings
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

  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));
  const status = searchParams.get("status"); // optional

  if (!month || !year) {
    return NextResponse.json(
      { error: "month and year are required" },
      { status: 400 }
    );
  }

  let query = supabase
    .from("attendance_exceptions")
    .select("date, status, note")
    .eq("maid_id", maid_id)
    .eq("user_id", user.id)
    .gte("date", `${year}-${String(month).padStart(2, "0")}-01`)
    .lte("date", `${year}-${String(month).padStart(2, "0")}-31`)
    .order("date");

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  console.log("error inside attendance exceptions", error);

  if (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }

  return NextResponse.json({
    month,
    year,
    count: data.length,
    notes: data,
  });
}
