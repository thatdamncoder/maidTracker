import { createClientSideSupabaseClient} from "@/utils/supabase/client"
import { NextResponse, NextRequest } from "next/server";

const supabase = createClientSideSupabaseClient();

export const GET = async (req: NextRequest, {params} : {params: Promise<{maid_id : string}>}) => {
    // console.log(params);
    // app/api/attendance/[maid_id]?month=1&year=12
    const {maid_id} = await params;
    const month = req.nextUrl.searchParams.get("month");
    const year = req.nextUrl.searchParams.get("year");
    if (!maid_id){
        return NextResponse.json({error: "Maid_id not found in params", status: 400});
    }
    if (!month){
        return NextResponse.json({error: "Month not found in params", status: 400});
    } 
    if (!year){
        return NextResponse.json({error: "Year not found in params", status: 400});
    }   

    const {data, error} = await supabase
                        .from("attendance")
                        .select()
                        .eq('maid_id', maid_id)
                        .eq('month', month)
                        .eq("year", year);
    if (error){
        console.log("Error fetching attendance at app/api/attendance/GET", error.message);
        return NextResponse.json({error, status: 500});
    }
    console.log("Attendance from app/api/attendance/GET fetched");
    console.log(data);
    return NextResponse.json({data});
}

export const POST = async (req : NextRequest, {params} : {params: Promise<{maid_id : string}>}) => {
    // app/api/attendance/[maid_id]
    //request.json() -> {status, day, month, year, reason}
    const {maid_id} = await params;
    const {status, day, month, year, reason} = await req.json();
    console.log(maid_id, status, day, month, year, reason);
    const {data, error} = await supabase.rpc("update_attendance_and_reason", {
                            _maid_id: maid_id,
                            _status: status,
                            _day: day,
                            _month: month,
                            _year: year,
                            _reason_text: reason
                        });
    if(error){
        console.log("Could not mark attendance at app/api/attendance/POST");
        return NextResponse.json({error: error, status: 500})
    }
    console.log("Data inserted successfully");
    return NextResponse.json({data});
}

