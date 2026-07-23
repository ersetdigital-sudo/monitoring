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
      .then((json) => {
        setData(json.data || []);
        setUpload(json.upload || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card p-6 animate-pulse h-96" />
    );
  }

  const totalAdmisi = data.reduce((s, d) => s + d.total_admisi, 0);
  const totalBayar = data.reduce((s, d) => s + d.admisi_bayar, 0);
  const totalBelum = data.reduce((s, d) => s + d.admisi_belum_bayar, 0);
  const totalNim = data.reduce((s, d) => s + d.dapat_nim, 0);
  const totalRegMtk = data.reduce((s, d) => s + (d.total_admisi - d.belum_registrasi_mtk), 0);
  const totalOngoing = data.reduce((s, d) => s + d.ongoing_total, 0);

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
      `Progress Total,${formatPercent(totalAdmisi > 0 ? (totalBayar / totalAdmisi) * 100 : 0)}`,
      "",
      "DATA PER SALUT",
      "SALUT,ADMISI,BAYAR,BELUM BAYAR,NIM,REG MTK,ONGOING,TOTAL BAYAR",
      ...data.map((d) =>
        `${d.nama_salut},${d.total_admisi},${d.admisi_bayar},${d.admisi_belum_bayar},${d.dapat_nim},${d.total_admisi - d.belum_registrasi_mtk},${d.ongoing_total},${d.total_bayar_akhir}`
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
        <h2 className="text-xl font-extrabold text-[var(--brand-dark)]">
          Laporan
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="text-xs font-semibold rounded-lg px-4 py-2 bg-emerald-600 text-white"
          >
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="text-xs font-semibold rounded-lg px-4 py-2 bg-slate-700 text-white"
          >
            Print
          </button>
        </div>
      </div>

      {/* Report Card */}
      <div className="card p-6 space-y-6 print:shadow-none">
        {/* Header */}
        <div className="text-center border-b border-[var(--line)] pb-4">
          <h1 className="text-lg font-extrabold text-[var(--brand-dark)]">
            LAPORAN RINGKAS
          </h1>
          <h2 className="text-sm font-semibold text-[var(--ink)]">
            Dashboard Monitoring Registrasi Mahasiswa
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Universitas Terbuka — {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          {upload && (
            <p className="text-xs text-[var(--muted)]">
              Sumber: {upload.nama_file} — {new Date(upload.created_at).toLocaleString("id-ID")}
            </p>
          )}
        </div>

        {/* Summary Table */}
        <div>
          <h3 className="text-sm font-bold mb-3">Ringkasan Keseluruhan</h3>
          <table className="w-full text-xs border-collapse">
            <tbody className="divide-y divide-[var(--line)]">
              {[
                ["Total Admisi", formatNumber(totalAdmisi), "100%"],
                ["Total Bayar", formatNumber(totalBayar), formatPercent(totalAdmisi > 0 ? (totalBayar / totalAdmisi) * 100 : 0)],
                ["Belum Bayar", formatNumber(totalBelum), formatPercent(totalAdmisi > 0 ? (totalBelum / totalAdmisi) * 100 : 0)],
                ["Dapat NIM", formatNumber(totalNim), formatPercent(totalAdmisi > 0 ? (totalNim / totalAdmisi) * 100 : 0)],
                ["Registrasi MTK", formatNumber(totalRegMtk), formatPercent(totalAdmisi > 0 ? (totalRegMtk / totalAdmisi) * 100 : 0)],
                ["Ongoing", formatNumber(totalOngoing), formatPercent(totalAdmisi > 0 ? (totalOngoing / totalAdmisi) * 100 : 0)],
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

        {/* Detail per SALUT */}
        <div>
          <h3 className="text-sm font-bold mb-3">Detail per SALUT</h3>
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-[var(--muted)] border-b border-[var(--line)]">
                  <th className="py-2 pr-3 font-semibold">NO</th>
                  <th className="py-2 pr-3 font-semibold">SALUT</th>
                  <th className="py-2 pr-3 font-semibold">ADMISI</th>
                  <th className="py-2 pr-3 font-semibold">BAYAR</th>
                  <th className="py-2 pr-3 font-semibold">BELUM</th>
                  <th className="py-2 pr-3 font-semibold">NIM</th>
                  <th className="py-2 pr-3 font-semibold">REG MTK</th>
                  <th className="py-2 pr-3 font-semibold">ONGOING</th>
                  <th className="py-2 pr-3 font-semibold">TOTAL BAYAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {data.map((d, i) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-2 pr-3 text-[var(--muted)]">{i + 1}</td>
                    <td className="py-2 pr-3 font-semibold">{d.nama_salut}</td>
                    <td className="py-2 pr-3">{formatNumber(d.total_admisi)}</td>
                    <td className="py-2 pr-3 text-emerald-600">{formatNumber(d.admisi_bayar)}</td>
                    <td className="py-2 pr-3 text-rose-600">{formatNumber(d.admisi_belum_bayar)}</td>
                    <td className="py-2 pr-3">{formatNumber(d.dapat_nim)}</td>
                    <td className="py-2 pr-3">{formatNumber(d.total_admisi - d.belum_registrasi_mtk)}</td>
                    <td className="py-2 pr-3">{formatNumber(d.ongoing_total)}</td>
                    <td className="py-2 pr-3 font-semibold">{formatNumber(d.total_bayar_akhir)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-[var(--muted)] pt-4 border-t border-[var(--line)]">
          Dashboard Monitoring Registrasi Mahasiswa v1.0.0 — Universitas Terbuka
        </div>
      </div>
    </div>
  );
}
