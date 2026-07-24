export interface Upload {
  id: string;
  nama_file: string;
  tanggal_upload: string;
  uploaded_by: string;
  status: "processing" | "completed" | "failed";
  total_rows: number | null;
  valid_rows: number | null;
  duplicate_rows: number | null;
  error_message: string | null;
  created_at: string;
}

export interface SalutData {
  id: string;
  upload_id: string;
  nama_salut: string;
  // Maba > Admisi
  total_admisi: number;
  maba_bayar_admisi: number;
  maba_belum_bayar_admisi: number;
  // Maba > Dapat Nim & Registrasi
  dapat_nim: number;
  belum_registrasi_mtk: number;
  // Maba > Registrasi Mtk
  maba_registrasi_belum_bayar_spp: number;
  maba_registrasi_bayar_spp: number;
  maba_registrasi_total: number;
  // Ongoing > Registrasi Mtk
  ongoing_belum_bayar_spp: number;
  ongoing_bayar_spp: number;
  ongoing_total_registrasi: number;
  // Gabungan
  total_bayar_spp_gabungan: number;
  target_maba: number;
  realisasi_maba: number; // calculated: maba_registrasi_bayar_spp / target_maba
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  nama: string;
  role: "admin" | "viewer";
  created_at: string;
}

export interface DashboardSummary {
  total_admisi: number;
  total_bayar: number;
  belum_bayar: number;
  dapat_nim: number;
  registrasi_mtk: number;
  ongoing: number;
  progress_total: number;
  // New
  target_maba: number;
  realisasi_maba: number; // aggregate %
  total_maba_bayar_spp: number;
  total_bayar_spp_gabungan: number;
}

export interface DuplicateDetail {
  nama_salut: string;
  reason: "Duplikat dalam file" | "Sudah ada di data sebelumnya";
}

export interface FilterState {
  salut: string;
  status_bayar: string;
  dapat_nim: string;
  ongoing: string;
}
