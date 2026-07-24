import * as XLSX from "xlsx";
import type { SalutData, DuplicateDetail } from "@/types/database";

export type ParsedRow = Omit<SalutData, "id" | "upload_id" | "created_at">;

export interface ParsedExcelResult {
  rows: ParsedRow[];
  validationRow: ParsedRow | null;
  errors: string[];
}

export function parseExcelBuffer(buffer: Buffer): ParsedExcelResult {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  const raw: (string | number)[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: 0,
    raw: true,
  });

  const errors: string[] = [];

  if (raw.length < 6) {
    errors.push("File Excel terlalu sedikit baris. Minimal 6 baris.");
    return { rows: [], validationRow: null, errors };
  }

  // Header validation - need at least 9 columns (A-I)
  const headerRow = raw[2];
  if (!headerRow || headerRow.length < 9) {
    errors.push("Struktur header tidak sesuai template. Minimal 9 kolom diperlukan.");
    return { rows: [], validationRow: null, errors };
  }

  // Parse data rows (starting from row index 4, after 3 headers + 1 empty)
  const rows: ParsedRow[] = [];
  let validationRow: ParsedRow | null = null;

  // We need to ask user for target_maba per SALUT if not in Excel
  // For now, set target_maba = 0 (will be set from upload API or manual input)
  // The file doesn't have target_maba column, so we calculate it from JUMLAH row if available

  for (let i = 4; i < raw.length; i++) {
    const row = raw[i];
    if (!row || !row[0]) continue;

    const nama = String(row[0]).trim();
    if (!nama) continue;

    const totalAdmisi = toNum(row[1]);
    const mabaBayarAdmisi = toNum(row[2]);
    const mabaBelumBayarAdmisi = toNum(row[3]);
    const dapatNim = toNum(row[4]);
    const belumRegMtk = toNum(row[5]);
    const mabaRegBelumBayar = toNum(row[6]);
    const mabaRegBayar = toNum(row[7]);
    const mabaRegTotal = toNum(row[8]);
    const ongoingBelumBayar = toNum(row[9]);
    const ongoingBayar = toNum(row[10]);
    const ongoingTotal = toNum(row[11]);
    const totalBayarGabungan = toNum(row[12]);

    // target_maba: 100 per SALUT (exclude TIDAK TERDETEKSI)
    const isNonTarget = nama.toUpperCase().includes("TIDAK TERDETEKSI");
    const targetMaba = isNonTarget ? 0 : 100;
    const realisasi = targetMaba > 0 ? mabaRegBayar / targetMaba : 0;

    const parsed: ParsedRow = {
      nama_salut: nama,
      total_admisi: totalAdmisi,
      maba_bayar_admisi: mabaBayarAdmisi,
      maba_belum_bayar_admisi: mabaBelumBayarAdmisi,
      dapat_nim: dapatNim,
      belum_registrasi_mtk: belumRegMtk,
      maba_registrasi_belum_bayar_spp: mabaRegBelumBayar,
      maba_registrasi_bayar_spp: mabaRegBayar,
      maba_registrasi_total: mabaRegTotal,
      ongoing_belum_bayar_spp: ongoingBelumBayar,
      ongoing_bayar_spp: ongoingBayar,
      ongoing_total_registrasi: ongoingTotal,
      total_bayar_spp_gabungan: totalBayarGabungan,
      target_maba: targetMaba,
      realisasi_maba: realisasi,
    };

    if (nama.toUpperCase() === "JUMLAH") {
      validationRow = parsed;
    } else {
      rows.push(parsed);
    }
  }

  if (rows.length === 0) {
    errors.push("Tidak ada data SALUT yang ditemukan di file.");
  }

  // Cross-validate with JUMLAH row
  if (validationRow) {
    const aggTotal = rows.reduce((s, r) => s + r.total_admisi, 0);
    if (aggTotal !== validationRow.total_admisi) {
      errors.push(
        `Validasi gagal: Total admisi hasil hitung (${aggTotal}) tidak sama dengan baris JUMLAH (${validationRow.total_admisi}).`
      );
    }
  } else {
    errors.push("Peringatan: Baris JUMLAH tidak ditemukan.");
  }

  return { rows, validationRow, errors };
}

export function toNum(val: unknown): number {
  if (typeof val === "number") return Math.round(val);
  if (typeof val === "string") {
    const n = parseFloat(val.replace(/[.,]/g, (m) => (m === "," ? "" : ".")));
    return isNaN(n) ? 0 : Math.round(n);
  }
  return 0;
}
