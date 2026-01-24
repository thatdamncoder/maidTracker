import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/api-auth";
import { updateMaidSchema } from "@/lib/validators/maid";

interface Params {
  maid_id: string;
}

/**
 * GET /maids/{maid_id}
 * Fetch single maid (only if owned by user)
 */


export async function GET(req: NextRequest, { params }: { params : Promise<Params>}) {
  const authContext = await requireAuth(req);

    if (!authContext) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
    const { user } = authContext;
    const {maid_id} = await params;
  const { data, error } = await supabase
    .from("maids")
    .select("*")
    .eq("id", maid_id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Maid not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

/**
 * PUT /maids/{maid_id}
 * Update maid details
 */
export async function PUT(req: NextRequest, { params }: { params : Promise<Params>}) {
  const authContext = await requireAuth(req);

    if (!authContext) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
    const { user } = authContext;
    const {maid_id} = await params;
    

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = updateMaidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("maids")
    .update(parsed.data)
    .eq("id", maid_id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

/**
 * DELETE /maids/{maid_id}
 * Delete maid and cascade related data
 */
export async function DELETE(req: NextRequest, { params }: { params : Promise<Params>}) {
  const authContext = await requireAuth(req);

    if (!authContext) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
    const { user } = authContext;
    const {maid_id} = await params;

  const { error } = await supabase
    .from("maids")
    .delete()
    .eq("id", maid_id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
