import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DATA_COLUMNS =
  "id, upload_id, nama_salut, total_admisi, maba_bayar_admisi, maba_belum_bayar_admisi, dapat_nim, belum_registrasi_mtk, maba_registrasi_belum_bayar_spp, maba_registrasi_bayar_spp, maba_registrasi_total, ongoing_belum_bayar_spp, ongoing_bayar_spp, ongoing_total_registrasi, total_bayar_spp_gabungan, target_maba, realisasi_maba, created_at";

const UPLOAD_COLUMNS = "id, nama_file, status, created_at";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get("upload_id");

  if (uploadId) {
    // Get data for specific upload
    const { data, error } = await supabase
      .from("salut_data")
      .select(DATA_COLUMNS)
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
    .select(UPLOAD_COLUMNS)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!latestUpload) {
    return NextResponse.json({ data: [], upload: null });
  }

  const { data, error } = await supabase
    .from("salut_data")
    .select(DATA_COLUMNS)
    .eq("upload_id", latestUpload.id)
    .order("total_admisi", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, upload: latestUpload });
}
