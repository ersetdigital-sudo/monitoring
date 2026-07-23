import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseExcelBuffer } from "@/lib/excel-parser";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Hanya admin yang bisa mengupload data" },
      { status: 403 }
    );
  }

  // Get form data
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "File tidak ditemukan" },
      { status: 400 }
    );
  }

  if (!file.name.endsWith(".xlsx")) {
    return NextResponse.json(
      { error: "Format file harus .xlsx" },
      { status: 400 }
    );
  }

  // Create upload record
  const { data: upload, error: uploadError } = await supabase
    .from("uploads")
    .insert({
      nama_file: file.name,
      uploaded_by: user.id,
      status: "processing",
    })
    .select()
    .single();

  if (uploadError || !upload) {
    return NextResponse.json(
      { error: "Gagal membuat record upload" },
      { status: 500 }
    );
  }

  try {
    // Parse Excel
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = parseExcelBuffer(buffer);

    // If critical errors (no rows), mark as failed
    if (result.rows.length === 0) {
      await supabase
        .from("uploads")
        .update({
          status: "failed",
          error_message: result.errors.join("; "),
        })
        .eq("id", upload.id);

      return NextResponse.json(
        { error: "Parsing gagal", details: result.errors },
        { status: 400 }
      );
    }

    // Insert salut_data rows
    const salutRows = result.rows.map((row) => ({
      upload_id: upload.id,
      ...row,
    }));

    const { error: insertError } = await supabase
      .from("salut_data")
      .insert(salutRows);

    if (insertError) {
      await supabase
        .from("uploads")
        .update({
          status: "failed",
          error_message: `Gagal menyimpan data: ${insertError.message}`,
        })
        .eq("id", upload.id);

      return NextResponse.json(
        { error: "Gagal menyimpan data ke database" },
        { status: 500 }
      );
    }

    // Update upload record as completed
    await supabase
      .from("uploads")
      .update({
        status: "completed",
        total_rows: result.rows.length + (result.validationRow ? 1 : 0),
        valid_rows: result.rows.length,
      })
      .eq("id", upload.id);

    // Revalidate pages that depend on upload data
    revalidatePath("/pengaturan");
    revalidatePath("/");
    revalidatePath("/tabel-data");
    revalidatePath("/data-salut");
    revalidatePath("/ranking-salut");
    revalidatePath("/grafik-analitik");
    revalidatePath("/laporan");

    return NextResponse.json({
      success: true,
      upload_id: upload.id,
      rows_imported: result.rows.length,
      warnings: result.errors.filter((e) => e.startsWith("Peringatan")),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await supabase
      .from("uploads")
      .update({
        status: "failed",
        error_message: message,
      })
      .eq("id", upload.id);

    return NextResponse.json(
      { error: "Gagal memproses file", details: message },
      { status: 500 }
    );
  }
}
