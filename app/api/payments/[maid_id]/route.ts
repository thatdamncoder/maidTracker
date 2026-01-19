import { createClientSideSupabaseClient} from "@/utils/supabase/client"
import { NextResponse, NextRequest } from "next/server";

const supabase = createClientSideSupabaseClient();

export const GET = async (req: NextRequest, {params}: {params: Promise<{maid_id : string}>}) => {
    // app/api/year/[maid_id]?year=2025
    const {maid_id} = await params;
    const year = req.nextUrl.searchParams.get("year");
    if (!year){
        return NextResponse.json({error: "Year not found in params", status: 400});
    }
    
    const {data, error} = await supabase
                        .from("attendance")
                        .select("month, year, attendance_bits, total_absent, maid(id, max_leaves)")
                        .eq('maid_id', maid_id)
                        .eq('year', year)
                        .order("month", {ascending: true});
    if (error){
        console.log("Error fetching yearly data at app/api/year/[maid_id]", error.message);
        return NextResponse.json({error, status: 500});
    }
    console.log("Yearly attendance from app/api/year/[maid_id] fetched");
    console.log(data);
    return NextResponse.json({data});
}
