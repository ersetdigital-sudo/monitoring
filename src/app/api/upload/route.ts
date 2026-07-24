import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseExcelBuffer } from "@/lib/excel-parser";
import type { DuplicateDetail } from "@/types/database";

type ParsedRow = ReturnType<typeof parseExcelBuffer>["rows"][number];

const VALUE_COLS: (keyof ParsedRow)[] = [
  "total_admisi",
  "maba_bayar_admisi",
  "maba_belum_bayar_admisi",
  "dapat_nim",
  "belum_registrasi_mtk",
  "maba_registrasi_belum_bayar_spp",
  "maba_registrasi_bayar_spp",
  "maba_registrasi_total",
  "ongoing_belum_bayar_spp",
  "ongoing_bayar_spp",
  "ongoing_total_registrasi",
  "total_bayar_spp_gabungan",
  "target_maba",
];

function isRowIdentical(a: ParsedRow, b: ParsedRow): boolean {
  return VALUE_COLS.every((col) => a[col] === b[col]);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const targetMabaStr = formData.get("target_maba") as string | null;
  const targetMabaPerSalut = targetMabaStr ? parseInt(targetMabaStr, 10) : 0;

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

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = parseExcelBuffer(buffer);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Parsing gagal", details: result.errors },
        { status: 400 }
      );
    }

    // Set target_maba if provided
    if (targetMabaPerSalut > 0) {
      for (const row of result.rows) {
        row.target_maba = targetMabaPerSalut;
        row.realisasi_maba = row.target_maba > 0
          ? row.maba_registrasi_bayar_spp / row.target_maba
          : 0;
      }
    }

    // === LEVEL A: Intra-file duplicate check ===
    const seenNames = new Set<string>();
    const intraDuplicates: DuplicateDetail[] = [];
    const afterIntraCheck: ParsedRow[] = [];

    for (const row of result.rows) {
      const key = row.nama_salut.toUpperCase().trim();
      if (seenNames.has(key)) {
        intraDuplicates.push({
          nama_salut: row.nama_salut,
          reason: "Duplikat dalam file",
        });
      } else {
        seenNames.add(key);
        afterIntraCheck.push(row);
      }
    }

    // === LEVEL B: Inter-upload duplicate check ===
    const { data: latestUpload } = await supabase
      .from("uploads")
      .select("id")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let existingData: ParsedRow[] = [];
    if (latestUpload) {
      const { data: existing } = await supabase
        .from("salut_data")
        .select("*")
        .eq("upload_id", latestUpload.id);

      if (existing) {
        existingData = existing as unknown as ParsedRow[];
      }
    }

    const interDuplicates: DuplicateDetail[] = [];
    const validRows: ParsedRow[] = [];

    for (const row of afterIntraCheck) {
      const existingRow = existingData.find(
        (e) => e.nama_salut.toUpperCase().trim() === row.nama_salut.toUpperCase().trim()
      );

      if (existingRow && isRowIdentical(row, existingRow)) {
        interDuplicates.push({
          nama_salut: row.nama_salut,
          reason: "Sudah ada di data sebelumnya",
        });
      } else {
        validRows.push(row);
      }
    }

    const allDuplicates = [...intraDuplicates, ...interDuplicates];

    // If ALL rows are duplicates, don't create upload record
    if (validRows.length === 0) {
      return NextResponse.json({
        success: true,
        all_duplicate: true,
        rows_imported: 0,
        rows_duplicate: allDuplicates.length,
        duplicates: allDuplicates,
        warnings: result.errors.filter((e) => e.startsWith("Peringatan")),
      });
    }

    // Create upload record
    const { data: upload, error: uploadError } = await supabase
      .from("uploads")
      .insert({
        nama_file: file.name,
        uploaded_by: user.id,
        status: "processing",
        total_rows: result.rows.length,
        valid_rows: validRows.length,
        duplicate_rows: allDuplicates.length,
      })
      .select()
      .single();

    if (uploadError || !upload) {
      return NextResponse.json(
        { error: "Gagal membuat record upload" },
        { status: 500 }
      );
    }

    // Insert valid rows
    const salutRows = validRows.map((row) => ({
      upload_id: upload.id,
      nama_salut: row.nama_salut,
      total_admisi: row.total_admisi,
      maba_bayar_admisi: row.maba_bayar_admisi,
      maba_belum_bayar_admisi: row.maba_belum_bayar_admisi,
      dapat_nim: row.dapat_nim,
      belum_registrasi_mtk: row.belum_registrasi_mtk,
      maba_registrasi_belum_bayar_spp: row.maba_registrasi_belum_bayar_spp,
      maba_registrasi_bayar_spp: row.maba_registrasi_bayar_spp,
      maba_registrasi_total: row.maba_registrasi_total,
      ongoing_belum_bayar_spp: row.ongoing_belum_bayar_spp,
      ongoing_bayar_spp: row.ongoing_bayar_spp,
      ongoing_total_registrasi: row.ongoing_total_registrasi,
      total_bayar_spp_gabungan: row.total_bayar_spp_gabungan,
      target_maba: row.target_maba,
      realisasi_maba: row.realisasi_maba,
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

    await supabase
      .from("uploads")
      .update({ status: "completed" })
      .eq("id", upload.id);

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
      rows_imported: validRows.length,
      rows_duplicate: allDuplicates.length,
      duplicates: allDuplicates,
      warnings: result.errors.filter((e) => e.startsWith("Peringatan")),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Gagal memproses file", details: message },
      { status: 500 }
    );
  }
}
