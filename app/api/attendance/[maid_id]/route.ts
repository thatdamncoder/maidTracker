import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/api-auth";
import { markAttendanceSchema } from "@/lib/validators/attendance";
import { decodeAttendanceBits } from "@/utils/calculations/attendance";

interface Params {
  maid_id: string;
}

/**
 * GET /attendance/{maid_id}?month=&year=
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
  const { maid_id } = await params;
  const { searchParams } = new URL(req.url);

  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  if (!month || !year) {
    return NextResponse.json(
      { error: "month and year are required" },
      { status: 400 }
    );
  }

  // ---- Fetch monthly attendance (OPTIONAL row) ----
  const { data } = await supabase
    .from("attendance_monthly")
    .select("attendance_bits, marked_bits, total_absent")
    .eq("maid_id", maid_id)
    .eq("user_id", user.id)
    .eq("month", month)
    .eq("year", year)
    .maybeSingle(); // 👈 IMPORTANT

  const attendanceBits = data?.attendance_bits ?? "0".repeat(31);
  const markedBits = data?.marked_bits ?? "0".repeat(31);
  const totalAbsent = data?.total_absent ?? 0;

  console.log("attendance data", data);

  const decoded = decodeAttendanceBits(attendanceBits, markedBits);

  const monthStr = String(month).padStart(2, "0");

  // ---- Fetch notes (optional) ----
  const startDate = `${year}-${monthStr}-01`;

  const nextMonth =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const { data: notes, error: fetchError } = await supabase
    .from("attendance_exceptions")
    .select("date, note")
    .eq("maid_id", maid_id)
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lt("date", nextMonth);


  
  if(fetchError){
    console.log("error while fetching", fetchError);
    return NextResponse.json({ error: fetchError }, { status: 500 });
  }
  const notesByDay = Object.fromEntries(
  notes?.map(n => [
    Number(n.date.split("-")[2]), 
    n.note
  ]) ?? []
);


  return NextResponse.json({
    month,
    year,
    totalAbsent,
    lastMarkedDay: decoded.lastMarkedDay,
    days: decoded.days.map(d => ({
      ...d,
      note: notesByDay[d.day] ?? null,
    })),
  });
}


/**
 * POST /attendance/{maid_id} (create or update)
 */
export async function POST(req: NextRequest, {params} : {params: Promise<Params>}) {
  const authContext = await requireAuth(req);

    if (!authContext) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
    const { user } = authContext;
    const { maid_id } = await params;

  const body = await req.json();
  const parsed = markAttendanceSchema.safeParse(body);
  console.log("parsed", parsed);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  // console.log(parsed.data);
  const { day, month, year, status, note} = parsed.data;
  const index = day - 1;

  const { data: existing, error } = await supabase
    .from("attendance_monthly")
    .select("attendance_bits, marked_bits")
    .eq("maid_id", maid_id)
    .eq("user_id", user.id)
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();

  if (error) {
    console.error("Fetch monthly attendance failed:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 }); 
  }

  let attendanceBits = (existing?.attendance_bits ?? "0".repeat(31)).split("");
  let markedBits = (existing?.marked_bits ?? "0".repeat(31)).split("");

   console.log("attendance bits", attendanceBits, markedBits, index);

  const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  if (status === "unmark"){
    attendanceBits[index] = "0";
    markedBits[index] = "0";
  }
  else {
    markedBits[index] = "1";
    attendanceBits[index] = status === "present" ? "1" : "0";
  }

  const { error: attendanceError } = await supabase
    .from("attendance_monthly")
    .upsert(
      {
        maid_id,
        user_id: user.id,
        month,
        year,
        attendance_bits: attendanceBits.join(""),
        marked_bits: markedBits.join(""),
      },
      {
        onConflict: "user_id,maid_id,month,year",
      }
  );

  if(attendanceError){
    console.log("an error occured ", attendanceError);
    return NextResponse.json({error: attendanceError, status: 400});
  }

  // ---- NOTES (only if present) ----
  if (note && note.trim().length > 0) {
    console.log("inside note section");
    const { error: noteError } = await supabase
      .from("attendance_exceptions")
      .upsert(
        {
          maid_id,
          user_id: user.id,
          date,
          note: note.trim(),
          status
        },
        {
          onConflict: "user_id,maid_id,date"
        }
      );

      if (noteError) {
        console.error("Note upsert failed:", noteError);
        return NextResponse.json({error: attendanceError, status: 400});
      }
  } else {
    const {error: deleteError} = await supabase
      .from("attendance_exceptions")
      .delete()
      .eq("maid_id", maid_id)
      .eq("user_id", user.id)
      .eq("date", date);

      if(deleteError){
        return NextResponse.json({error: deleteError, status: 500});
      }

  }

  return NextResponse.json({ success: true });
}
