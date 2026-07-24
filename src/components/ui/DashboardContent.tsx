"use client";

import { ICONS } from "@/lib/icons";
import { useDashboardData } from "@/lib/hooks";
import { formatNumber, formatPercent } from "@/lib/utils";
import { BarChartSalut, DonutBayar, DonutProgress, BarChartTop10 } from "@/components/charts";

export function DashboardContent() {
  const { data, summary, uploadInfo, loading, error, refresh } =
    useDashboardData();

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-[46px] h-[46px] rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-20" />
                  <div className="h-7 bg-slate-100 rounded w-16" />
                  <div className="h-3 bg-slate-100 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <div className="text-rose-600 font-bold mb-2">Gagal memuat data</div>
        <div className="text-sm text-[var(--muted)] mb-4">{error}</div>
        <button
          onClick={refresh}
          className="text-sm font-semibold text-white rounded-lg px-4 py-2"
          style={{ background: "var(--brand)" }}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!summary || data.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <div className="font-bold text-[var(--ink)] mb-2">Belum Ada Data</div>
        <div className="text-sm text-[var(--muted)] mb-4">
          Upload file Excel di halaman Pengaturan untuk mulai memantau data registrasi.
        </div>
        <a
          href="/pengaturan"
          className="inline-block text-sm font-semibold text-white rounded-lg px-4 py-2"
          style={{ background: "var(--brand)" }}
        >
          Ke Halaman Pengaturan
        </a>
      </div>
    );
  }

  const pct = (val: number) =>
    summary.total_admisi > 0
      ? `${((val / summary.total_admisi) * 100).toFixed(2).replace(".", ",")}%`
      : "0%";

  const stats = [
    { title: "TOTAL ADMISI", value: formatNumber(summary.total_admisi), unit: "Mahasiswa", sub: "100% dari admisi", color: "#2563eb", bg: "#e0edff", icon: ICONS.users },
    { title: "TOTAL BAYAR", value: formatNumber(summary.total_bayar), unit: "Mahasiswa", sub: `${pct(summary.total_bayar)} dari admisi`, color: "#16a34a", bg: "#dcfce7", icon: ICONS.checkCircle },
    { title: "BELUM BAYAR", value: formatNumber(summary.belum_bayar), unit: "Mahasiswa", sub: `${pct(summary.belum_bayar)} dari admisi`, color: "#ea580c", bg: "#ffedd5", icon: ICONS.receipt },
    { title: "DAPAT NIM", value: formatNumber(summary.dapat_nim), unit: "Mahasiswa", sub: `${pct(summary.dapat_nim)} dari admisi`, color: "#7c3aed", bg: "#ede9fe", icon: ICONS.id },
    { title: "REGISTRASI MTK", value: formatNumber(summary.registrasi_mtk), unit: "Mahasiswa", sub: `${pct(summary.registrasi_mtk)} dari admisi`, color: "#2563eb", bg: "#e0edff", icon: ICONS.book },
    { title: "ONGOING", value: formatNumber(summary.ongoing), unit: "Mahasiswa", sub: `${pct(summary.ongoing)} dari admisi`, color: "#d97706", bg: "#fef3c7", icon: ICONS.clock },
    { title: "PROGRESS TOTAL", value: formatPercent(summary.progress_total), unit: "Pembayaran", sub: "", color: "#4f46e5", bg: "#e0e7ff", icon: ICONS.gauge },
  ];

  const newStats = [
    { title: "TARGET MABA", value: formatNumber(summary.target_maba), unit: "Mahasiswa", sub: "Target pendaftaran", color: "#0891b2", bg: "#ecfeff", icon: ICONS.gauge },
    { title: "REALISASI MABA", value: formatPercent(summary.realisasi_maba), unit: "Pencapaian", sub: `${formatNumber(summary.total_maba_bayar_spp)} / ${formatNumber(summary.target_maba)}`, color: "#059669", bg: "#ecfdf5", icon: ICONS.checkCircle },
    { title: "TOTAL BAYAR SPP", value: formatNumber(summary.total_bayar_spp_gabungan), unit: "Maba + Ongoing", sub: "Gabungan SPP", color: "#8b5cf6", bg: "#f5f3ff", icon: ICONS.money },
  ];

  const top5 = [...data]
    .sort((a, b) => b.total_bayar_spp_gabungan - a.total_bayar_spp_gabungan)
    .slice(0, 5);

  const medalConfig = [
    { bg: "#facc15", color: "#7a5c00" },
    { bg: "#cbd5e1", color: "#475569" },
    { bg: "#fdba74", color: "#9a3412" },
  ];

  return (
    <>
      {/* Upload info */}
      {uploadInfo && (
        <div className="text-xs text-[var(--muted)]">
          Data dari: <span className="font-semibold">{uploadInfo.nama_file}</span>{" "}
          — {new Date(uploadInfo.created_at).toLocaleString("id-ID")}
        </div>
      )}

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.title} className="card p-4 flex items-start gap-3">
            <div
              className="stat-icon"
              style={{ background: s.bg, color: s.color }}
              dangerouslySetInnerHTML={{ __html: s.icon }}
            />
            <div className="min-w-0">
              <div className="text-[11px] font-bold tracking-wide text-[var(--muted)]">{s.title}</div>
              <div className="text-2xl font-extrabold leading-tight" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-[var(--muted)]">{s.unit}</div>
              {s.sub && <div className="text-[10px] font-semibold mt-0.5" style={{ color: s.color }}>{s.sub}</div>}
            </div>
          </div>
        ))}
      </section>

      {/* New Stats: Target & Realisasi */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {newStats.map((s) => (
          <div key={s.title} className="card p-4 flex items-start gap-3">
            <div
              className="stat-icon"
              style={{ background: s.bg, color: s.color }}
              dangerouslySetInnerHTML={{ __html: s.icon }}
            />
            <div className="min-w-0">
              <div className="text-[11px] font-bold tracking-wide text-[var(--muted)]">{s.title}</div>
              <div className="text-2xl font-extrabold leading-tight" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-[var(--muted)]">{s.unit}</div>
              {s.sub && <div className="text-[10px] font-semibold mt-0.5" style={{ color: s.color }}>{s.sub}</div>}
            </div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="card p-4">
          <h3 className="text-sm font-bold mb-1">Perbandingan Admisi per SALUT</h3>
          <div className="h-56"><BarChartSalut data={data} /></div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold mb-1">Komposisi Pembayaran</h3>
          <div className="h-56"><DonutBayar data={data} /></div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold mb-1">Progress Registrasi</h3>
          <div className="h-56"><DonutProgress data={data} /></div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold mb-1">Top 10 SALUT (Berdasarkan Admisi)</h3>
          <div className="h-56"><BarChartTop10 data={data} /></div>
        </div>
      </section>

      {/* Table + Ranking */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="card p-4 xl:col-span-2 overflow-hidden">
          <h3 className="text-sm font-bold mb-2">Data Registrasi per SALUT</h3>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mb-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-200 border border-blue-300" />Maba</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-200 border border-orange-300" />Ongoing</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-200 border border-slate-300" />Gabungan</span>
          </div>
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-[var(--muted)] border-b border-[var(--line)]">
                  <th className="py-2 pr-3 font-semibold">NO</th>
                  <th className="py-2 pr-3 font-semibold">SALUT</th>
                  <th className="py-2 pr-3 font-semibold bg-blue-100">ADMISI</th>
                  <th className="py-2 pr-3 font-semibold bg-blue-100">BAYAR</th>
                  <th className="py-2 pr-3 font-semibold bg-blue-100">BELUM</th>
                  <th className="py-2 pr-3 font-semibold bg-blue-100">NIM</th>
                  <th className="py-2 pr-3 font-semibold bg-orange-100">ONGOING</th>
                  <th className="py-2 pr-3 font-semibold bg-slate-100">TOTAL BAYAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {data.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 text-[var(--muted)]">{i + 1}</td>
                    <td className="py-2.5 pr-3 font-semibold">{r.nama_salut}</td>
                    <td className="py-2.5 pr-3 bg-blue-50">{formatNumber(r.total_admisi)}</td>
                    <td className="py-2.5 pr-3 text-emerald-600 font-semibold bg-blue-50">{formatNumber(r.maba_bayar_admisi)}</td>
                    <td className="py-2.5 pr-3 text-rose-600 bg-blue-50">{formatNumber(r.maba_belum_bayar_admisi)}</td>
                    <td className="py-2.5 pr-3 bg-blue-50">{formatNumber(r.dapat_nim)}</td>
                    <td className="py-2.5 pr-3 bg-orange-50">{formatNumber(r.ongoing_total_registrasi)}</td>
                    <td className="py-2.5 pr-3 font-bold text-[var(--brand)] bg-slate-50">{formatNumber(r.total_bayar_spp_gabungan)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-bold mb-3">Ranking SALUT</h3>
          <ul className="space-y-2.5">
            {top5.map((r, i) => {
              const rank = i + 1;
              const medal = i < 3 ? medalConfig[i] : { bg: "#e2e8f0", color: "#64748b" };
              return (
                <li key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: medal.bg, color: medal.color }}>
                    {rank <= 3 ? <span dangerouslySetInnerHTML={{ __html: ICONS.trophy }} className="[&>svg]:w-4 [&>svg]:h-4" /> : rank}
                  </span>
                  <span className="text-xs font-semibold flex-1 truncate">{r.nama_salut}</span>
                  <span className="text-sm font-extrabold text-[var(--brand)]">{formatNumber(r.total_bayar_spp_gabungan)}</span>
                </li>
              );
            })}
          </ul>
          <a href="/ranking-salut" className="block w-full mt-4 text-xs font-semibold text-center text-[var(--brand)] border border-[var(--brand)]/30 rounded-lg py-2 hover:bg-[var(--brand)]/5">
            Lihat Ranking Lengkap →
          </a>
        </div>
      </section>

      {/* Action Bar */}
      <section className="card p-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-[var(--muted)]">Menampilkan 1 - {data.length} dari {data.length} data</span>
        <div className="flex flex-wrap gap-2">
          <button className="text-xs font-semibold rounded-lg px-4 py-2 bg-emerald-600 text-white">Export Excel</button>
          <button className="text-xs font-semibold rounded-lg px-4 py-2 bg-rose-600 text-white">Export PDF</button>
          <button className="text-xs font-semibold rounded-lg px-4 py-2 bg-slate-700 text-white">Print</button>
        </div>
      </section>
    </>
  );
}
