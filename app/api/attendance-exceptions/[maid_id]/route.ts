import { createClientSideSupabaseClient} from "@/utils/supabase/client"
import { NextResponse, NextRequest } from "next/server";

const supabase = createClientSideSupabaseClient();

export const GET = async (req: NextRequest, {params} : {params: Promise<{maid_id : string}>}) => {
    // console.log(params);
    // GET app/api/absences/[maid_id]?month=1&year=2025
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
        return NextResponse.json({error: "Month not found in params", status: 400});
    }

    const {data, error} = await supabase
                        .from("reason")
                        .select("day, month, year, comment")
                        .eq('maid_id', maid_id)
                        .eq('month', month)
                        .eq("year", year)
                        .eq("status", false);
    if (error){
        console.log("Error fetching attendance at app/api/absences/GET", error.message);
        return NextResponse.json({error, status: 500});
    }
    console.log("Absences from app/api/absences/GET fetched");
    console.log(data);
    return NextResponse.json({data});
}

