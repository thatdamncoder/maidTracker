import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceRoleSupabaseClient } from "@/utils/supabase/server";

interface Params {
  maid_id: string;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new NextResponse("File missing", { status: 400 });
  }
  const { maid_id } = await params;
  const safeName = file.name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.-]/g, "");

  const ext = safeName.split(".").pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const filePath = `${session.user.id}/${maid_id}/${fileName}`;

  const supabase = createServiceRoleSupabaseClient();

  const { error } = await supabase.storage
    .from("receipts")
    .upload(filePath, file, { contentType: file.type });

  if (error) {
    console.error(error);
    return new NextResponse("Upload failed", { status: 500 });
  }

  const { data: signed } = await supabase.storage
    .from("receipts")
    .createSignedUrl(filePath, 60 * 60);

  return NextResponse.json({
    imagePath: filePath,
    signedUrl: signed?.signedUrl,
  });
}
