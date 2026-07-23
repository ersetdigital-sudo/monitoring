export interface Upload {
  id: string;
  nama_file: string;
  tanggal_upload: string;
  uploaded_by: string;
  status: "processing" | "completed" | "failed";
  total_rows: number | null;
  valid_rows: number | null;
  error_message: string | null;
  created_at: string;
}

export interface SalutData {
  id: string;
  upload_id: string;
  nama_salut: string;
  total_admisi: number;
  admisi_bayar: number;
  admisi_belum_bayar: number;
  dapat_nim: number;
  belum_registrasi_mtk: number;
  ongoing_belum_bayar: number;
  ongoing_bayar: number;
  ongoing_total: number;
  total_bayar_akhir: number;
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
}

export interface FilterState {
  salut: string;
  status_bayar: string;
  dapat_nim: string;
  ongoing: string;
}
