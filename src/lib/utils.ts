import type { DashboardSummary, SalutData } from "@/types/database";

export function calculateSummary(data: SalutData[]): DashboardSummary {
  const total_admisi = data.reduce((sum, d) => sum + d.total_admisi, 0);
  const total_bayar = data.reduce((sum, d) => sum + d.admisi_bayar, 0);
  const belum_bayar = data.reduce((sum, d) => sum + d.admisi_belum_bayar, 0);
  const dapat_nim = data.reduce((sum, d) => sum + d.dapat_nim, 0);
  const registrasi_mtk = data.reduce(
    (sum, d) => sum + (d.total_admisi - d.belum_registrasi_mtk),
    0
  );
  const ongoing = data.reduce((sum, d) => sum + d.ongoing_total, 0);
  const progress_total =
    total_admisi > 0 ? Math.round((total_bayar / total_admisi) * 10000) / 100 : 0;

  return {
    total_admisi,
    total_bayar,
    belum_bayar,
    dapat_nim,
    registrasi_mtk,
    ongoing,
    progress_total,
  };
}

export function formatNumber(n: number): string {
  return n.toLocaleString("id-ID");
}

export function formatPercent(n: number): string {
  return `${n.toFixed(2).replace(".", ",")}%`;
}
