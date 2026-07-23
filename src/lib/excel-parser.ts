import * as XLSX from "xlsx";
import type { SalutData } from "@/types/database";

export interface ParsedExcelResult {
  rows: Omit<SalutData, "id" | "upload_id" | "created_at">[];
  validationRow: Omit<SalutData, "id" | "upload_id" | "created_at"> | null;
  errors: string[];
}

export function parseExcelBuffer(buffer: Buffer): ParsedExcelResult {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  // Convert to array of arrays (header:1 gives us raw rows)
  const raw: (string | number)[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: 0,
    raw: true,
  });

  const errors: string[] = [];

  // Validate minimum rows (3 header + 1 empty + 1 data + 1 JUMLAH = 6)
  if (raw.length < 6) {
    errors.push("File Excel terlalu sedikit baris. Minimal 6 baris (3 header + data + JUMLAH).");
    return { rows: [], validationRow: null, errors };
  }

  // Validate headers
  const headerRow = raw[2]; // Row index 2 = row 3 in Excel
  if (!headerRow || headerRow.length < 13) {
    errors.push("Struktur header tidak sesuai template. Minimal 13 kolom diperlukan.");
    return { rows: [], validationRow: null, errors };
  }

  // Parse data rows (starting from row index 4, after 3 headers + 1 empty)
  const rows: Omit<SalutData, "id" | "upload_id" | "created_at">[] = [];
  let validationRow: Omit<SalutData, "id" | "upload_id" | "created_at"> | null = null;

  for (let i = 4; i < raw.length; i++) {
    const row = raw[i];
    if (!row || !row[0]) continue;

    const nama = String(row[0]).trim();
    if (!nama) continue;

    const parsed = {
      nama_salut: nama,
      total_admisi: toNum(row[1]),
      admisi_bayar: toNum(row[2]),
      admisi_belum_bayar: toNum(row[3]),
      dapat_nim: toNum(row[4]),
      belum_registrasi_mtk: toNum(row[5]),
      ongoing_belum_bayar: toNum(row[6]),
      ongoing_bayar: toNum(row[7]),
      ongoing_total: toNum(row[8]),
      sv23_belum_bayar: toNum(row[9]),
      sv23_bayar: toNum(row[10]),
      sv23_total: toNum(row[11]),
      total_bayar_akhir: toNum(row[12]),
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
    errors.push("Peringatan: Baris JUMLAH tidak ditemukan. Validasi silang tidak dapat dilakukan.");
  }

  return { rows, validationRow, errors };
}

function toNum(val: unknown): number {
  if (typeof val === "number") return Math.round(val);
  if (typeof val === "string") {
    const n = parseFloat(val.replace(/[.,]/g, (m) => (m === "," ? "" : ".")));
    return isNaN(n) ? 0 : Math.round(n);
  }
  return 0;
}
