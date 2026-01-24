import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/api-auth";
import { createMaidSchema } from "@/lib/validators/maid";


export async function GET(req: NextRequest) {
    const authContext = await requireAuth(req);

    if (!authContext) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
    const { user } = authContext;
    console.log(user);
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
    const authContext = await requireAuth(req);

    if (!authContext) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
    const { user } = authContext;

    const userId = user.id;

    const body = await req.json();

    const parsed = createMaidSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {
                error: "Validation failed",
                issues: parsed.error
            },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("maids")
        .insert({
            ...parsed.data,
            user_id: userId,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(data, { status: 201 });
}
