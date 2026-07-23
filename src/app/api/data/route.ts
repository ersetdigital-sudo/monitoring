import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get("upload_id");

  if (uploadId) {
    // Get data for specific upload
    const { data, error } = await supabase
      .from("salut_data")
      .select("*")
      .eq("upload_id", uploadId)
      .order("total_admisi", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  // Get latest completed upload
  const { data: latestUpload } = await supabase
    .from("uploads")
    .select("*")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!latestUpload) {
    return NextResponse.json({ data: [], upload: null });
  }

  const { data, error } = await supabase
    .from("salut_data")
    .select("*")
    .eq("upload_id", latestUpload.id)
    .order("total_admisi", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, upload: latestUpload });
}
