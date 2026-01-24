import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(
    req: Request,
    { params }: { params: { maid_id: string } }
) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { maid_id } = params;
    const { imageUrl, amount, note, date } = await req.json();

    if (!maid_id || !imageUrl || !amount || !date) {
        return new NextResponse("Missing required fields", { status: 400 });
    }

    const supabase = createServiceRoleSupabaseClient();

    try {
        const { data, error } = await supabase
            .from("payment_receipts") // Assuming you have a table named 'payment_receipts'
            .insert({
                maid_id,
                user_id: session.user.id,
                image_url: imageUrl,
                amount,
                note,
                date,
            })
            .select();

        if (error) {
            console.error("Error inserting receipt:", error);
            return new NextResponse("Internal Server Error", { status: 500 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error in POST /api/payments/[maid_id]/receipts:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: { maid_id: string } }
) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { maid_id } = params;

    const supabase = createServiceRoleSupabaseClient();

    try {
        const { data, error } = await supabase
            .from("payment_receipts")
            .select("*")
            .eq("maid_id", maid_id)
            .eq("user_id", session.user.id)
            .order("date", { ascending: false });

        if (error) {
            console.error("Error fetching receipts:", error);
            return new NextResponse("Internal Server Error", { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in GET /api/payments/[maid_id]/receipts:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { maid_id: string } }
) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { maid_id } = params;
    const { receiptId, imageUrl } = await req.json();

    if (!maid_id || !receiptId || !imageUrl) {
        return new NextResponse("Missing required fields", { status: 400 });
    }

    const supabase = createServiceRoleSupabaseClient();

    try {
        const imagePath = imageUrl.split('/public/receipts/')[1];
        const { error: storageError } = await supabase.storage
            .from('receipts')
            .remove([imagePath]);

        if (storageError) {
            console.error("Error deleting image from storage:", storageError);
        }

        const { error: dbError } = await supabase
            .from("payment_receipts")
            .delete()
            .eq("id", receiptId)
            .eq("maid_id", maid_id)
            .eq("user_id", session.user.id);

        if (dbError) {
            console.error("Error deleting receipt from database:", dbError);
            return new NextResponse("Internal Server Error", { status: 500 });
        }

        return new NextResponse("Receipt deleted successfully", { status: 200 });
    } catch (error) {
        console.error("Error in DELETE /api/payments/[maid_id]/receipts:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}