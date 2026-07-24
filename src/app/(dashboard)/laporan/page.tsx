"use client";

import { useState, useEffect } from "react";
import type { SalutData, Upload } from "@/types/database";
import { formatNumber, formatPercent } from "@/lib/utils";

export default function LaporanPage() {
  const [data, setData] = useState<SalutData[]>([]);
  const [upload, setUpload] = useState<Upload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((json) => { setData(json.data || []); setUpload(json.upload || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="card p-6 animate-pulse h-96" />;

  const totalAdmisi = data.reduce((s, d) => s + d.total_admisi, 0);
  const totalBayar = data.reduce((s, d) => s + d.maba_bayar_admisi, 0);
  const totalBelum = data.reduce((s, d) => s + d.maba_belum_bayar_admisi, 0);
  const totalNim = data.reduce((s, d) => s + d.dapat_nim, 0);
  const totalRegMtk = data.reduce((s, d) => s + (d.total_admisi - d.belum_registrasi_mtk), 0);
  const totalOngoing = data.reduce((s, d) => s + d.ongoing_total_registrasi, 0);
  const targetMaba = data.reduce((s, d) => s + d.target_maba, 0);
  const totalMabaBayarSpp = data.reduce((s, d) => s + d.maba_registrasi_bayar_spp, 0);
  const realisasi = targetMaba > 0 ? totalMabaBayarSpp / targetMaba : 0;

  const handlePrint = () => window.print();

  const handleExport = () => {
    const summary = [
      "LAPORAN RINGKAS DASHBOARD MONITORING REGISTRASI MAHASISWA",
      `Tanggal: ${new Date().toLocaleString("id-ID")}`,
      upload ? `Sumber Data: ${upload.nama_file}` : "",
      "",
      "RINGKASAN,",
      `Total Admisi,${totalAdmisi}`,
      `Total Bayar,${totalBayar}`,
      `Belum Bayar,${totalBelum}`,
      `Dapat NIM,${totalNim}`,
      `Registrasi MTK,${totalRegMtk}`,
      `Ongoing,${totalOngoing}`,
      `Target Maba,${targetMaba}`,
      `Realisasi Maba,${formatPercent(realisasi)}`,
      "",
      "DATA PER SALUT",
      "SALUT,ADMISI,BAYAR,BELUM,NIM,REG MTK,ONGOING,TOTAL BAYAR SPP,TARGET,REALISASI",
      ...data.map((d) =>
        `${d.nama_salut},${d.total_admisi},${d.maba_bayar_admisi},${d.maba_belum_bayar_admisi},${d.dapat_nim},${d.total_admisi - d.belum_registrasi_mtk},${d.ongoing_total_registrasi},${d.total_bayar_spp_gabungan},${d.target_maba},${formatPercent(d.realisasi_maba)}`
      ),
    ].join("\n");

    const blob = new Blob([summary], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan_registrasi_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-[var(--brand-dark)]">Laporan</h2>
        <div className="flex gap-2">
          <button onClick={handleExport} className="text-xs font-semibold rounded-lg px-4 py-2 bg-emerald-600 text-white">Export CSV</button>
          <button onClick={handlePrint} className="text-xs font-semibold rounded-lg px-4 py-2 bg-slate-700 text-white">Print</button>
        </div>
      </div>

      <div className="card p-6 space-y-6 print:shadow-none">
        <div className="text-center border-b border-[var(--line)] pb-4">
          <h1 className="text-lg font-extrabold text-[var(--brand-dark)]">LAPORAN RINGKAS</h1>
          <h2 className="text-sm font-semibold text-[var(--ink)]">Dashboard Monitoring Registrasi Mahasiswa</h2>
          <p className="text-xs text-[var(--muted)] mt-1">Universitas Terbuka Majene — {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          {upload && <p className="text-xs text-[var(--muted)]">Sumber: {upload.nama_file} — {new Date(upload.created_at).toLocaleString("id-ID")}</p>}
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3">Ringkasan Keseluruhan</h3>
          <table className="w-full text-xs border-collapse">
            <tbody className="divide-y divide-[var(--line)]">
              {[
                ["Total Admisi", formatNumber(totalAdmisi), "100%"],
                ["Total Bayar", formatNumber(totalBayar), formatPercent(totalAdmisi > 0 ? totalBayar / totalAdmisi : 0)],
                ["Belum Bayar", formatNumber(totalBelum), formatPercent(totalAdmisi > 0 ? totalBelum / totalAdmisi : 0)],
                ["Dapat NIM", formatNumber(totalNim), formatPercent(totalAdmisi > 0 ? totalNim / totalAdmisi : 0)],
                ["Registrasi MTK", formatNumber(totalRegMtk), formatPercent(totalAdmisi > 0 ? totalRegMtk / totalAdmisi : 0)],
                ["Ongoing", formatNumber(totalOngoing), formatPercent(totalAdmisi > 0 ? totalOngoing / totalAdmisi : 0)],
                ["Target Maba", formatNumber(targetMaba), ""],
                ["Realisasi Maba", formatPercent(realisasi), ""],
              ].map(([label, value, pct]) => (
                <tr key={String(label)} className="hover:bg-slate-50">
                  <td className="py-2 pr-3 font-semibold">{label}</td>
                  <td className="py-2 pr-3 text-right font-bold">{value}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted)]">{pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3">Detail per SALUT</h3>
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-[var(--muted)] border-b border-[var(--line)]">
                  <th className="py-2 pr-3 font-semibold">NO</th>
                  <th className="py-2 pr-3 font-semibold">SALUT</th>
                  <th className="py-2 pr-3 font-semibold bg-blue-50">ADMISI</th>
                  <th className="py-2 pr-3 font-semibold bg-blue-50">BAYAR</th>
                  <th className="py-2 pr-3 font-semibold bg-blue-50">BELUM</th>
                  <th className="py-2 pr-3 font-semibold bg-blue-50">NIM</th>
                  <th className="py-2 pr-3 font-semibold bg-orange-50">ONGOING</th>
                  <th className="py-2 pr-3 font-semibold bg-slate-50">TOTAL SPP</th>
                  <th className="py-2 pr-3 font-semibold bg-slate-50">TARGET</th>
                  <th className="py-2 pr-3 font-semibold bg-slate-50">REALISASI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {data.map((d, i) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-2 pr-3 text-[var(--muted)]">{i + 1}</td>
                    <td className="py-2 pr-3 font-semibold">{d.nama_salut}</td>
                    <td className="py-2 pr-3 bg-blue-50/30">{formatNumber(d.total_admisi)}</td>
                    <td className="py-2 pr-3 text-emerald-600 bg-blue-50/30">{formatNumber(d.maba_bayar_admisi)}</td>
                    <td className="py-2 pr-3 text-rose-600 bg-blue-50/30">{formatNumber(d.maba_belum_bayar_admisi)}</td>
                    <td className="py-2 pr-3 bg-blue-50/30">{formatNumber(d.dapat_nim)}</td>
                    <td className="py-2 pr-3 bg-orange-50/30">{formatNumber(d.ongoing_total_registrasi)}</td>
                    <td className="py-2 pr-3 font-bold text-[var(--brand)] bg-slate-50/30">{formatNumber(d.total_bayar_spp_gabungan)}</td>
                    <td className="py-2 pr-3 bg-slate-50/30">{formatNumber(d.target_maba)}</td>
                    <td className="py-2 pr-3 font-semibold text-emerald-700 bg-slate-50/30">{formatPercent(d.realisasi_maba)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center text-[11px] text-[var(--muted)] pt-4 border-t border-[var(--line)]">
          Dashboard Monitoring Registrasi Mahasiswa v1.0.0 — Universitas Terbuka Majene
        </div>
      </div>
    </div>
  );
}
