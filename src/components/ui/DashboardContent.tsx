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
          {Array.from({ length: 8 }).map((_, i) => (
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
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-32 mb-4" />
              <div className="h-56 bg-slate-50 rounded" />
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
          Upload file Excel di halaman Pengaturan untuk mulai memantau data
          registrasi.
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

  const top5 = [...data]
    .sort((a, b) => b.total_bayar_akhir - a.total_bayar_akhir)
    .slice(0, 5);

  const medalConfig = [
    { bg: "#facc15", color: "#7a5c00" },
    { bg: "#cbd5e1", color: "#475569" },
    { bg: "#fdba74", color: "#9a3412" },
  ];

  return (
    <>
      {/* Stat Cards — exact HTML match */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.title} className="card p-4 flex items-start gap-3">
            <div
              className="stat-icon"
              style={{ background: s.bg, color: s.color }}
              dangerouslySetInnerHTML={{ __html: s.icon }}
            />
            <div className="min-w-0">
              <div className="text-[11px] font-bold tracking-wide text-[var(--muted)]">
                {s.title}
              </div>
              <div
                className="text-2xl font-extrabold leading-tight"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-[11px] text-[var(--muted)]">{s.unit}</div>
              {s.sub && (
                <div
                  className="text-[10px] font-semibold mt-0.5"
                  style={{ color: s.color }}
                >
                  {s.sub}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Charts — 4 kolom, exact match */}
      <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="card p-4">
          <h3 className="text-sm font-bold mb-1">
            Perbandingan Admisi per SALUT
          </h3>
          <div className="h-56">
            <BarChartSalut data={data} />
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold mb-1">Komposisi Pembayaran</h3>
          <div className="h-56">
            <DonutBayar data={data} />
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold mb-1">Progress Registrasi</h3>
          <div className="h-56">
            <DonutProgress data={data} />
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-bold mb-1">
            Top 10 SALUT (Berdasarkan Admisi)
          </h3>
          <div className="h-56">
            <BarChartTop10 data={data} />
          </div>
        </div>
      </section>

      {/* Table + Ranking — exact match */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="card p-4 xl:col-span-2 overflow-hidden">
          <h3 className="text-sm font-bold mb-3">Data Registrasi per SALUT</h3>
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-[var(--muted)] border-b border-[var(--line)]">
                  <th className="py-2 pr-3 font-semibold">NO</th>
                  <th className="py-2 pr-3 font-semibold">SALUT</th>
                  <th className="py-2 pr-3 font-semibold">ADMISI</th>
                  <th className="py-2 pr-3 font-semibold">BAYAR</th>
                  <th className="py-2 pr-3 font-semibold">BELUM BAYAR</th>
                  <th className="py-2 pr-3 font-semibold">DAPAT NIM</th>
                  <th className="py-2 pr-3 font-semibold">REG MTK</th>
                  <th className="py-2 pr-3 font-semibold">ONGOING</th>
                  <th className="py-2 pr-3 font-semibold">TOTAL BAYAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {data.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 text-[var(--muted)]">{i + 1}</td>
                    <td className="py-2.5 pr-3 font-semibold">{r.nama_salut}</td>
                    <td className="py-2.5 pr-3">{formatNumber(r.total_admisi)}</td>
                    <td className="py-2.5 pr-3 text-emerald-600 font-semibold">
                      {formatNumber(r.admisi_bayar)}
                    </td>
                    <td className="py-2.5 pr-3 text-rose-600">
                      {formatNumber(r.admisi_belum_bayar)}
                    </td>
                    <td className="py-2.5 pr-3">{formatNumber(r.dapat_nim)}</td>
                    <td className="py-2.5 pr-3">
                      {formatNumber(r.total_admisi - r.belum_registrasi_mtk)}
                    </td>
                    <td className="py-2.5 pr-3">{formatNumber(r.ongoing_total)}</td>
                    <td className="py-2.5 pr-3 font-bold text-[var(--brand)]">
                      {formatNumber(r.total_bayar_akhir)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-bold mb-3">
            Ranking SALUT (Berdasarkan Total Bayar)
          </h3>
          <ul className="space-y-2.5">
            {top5.map((r, i) => {
              const rank = i + 1;
              const medal = i < 3 ? medalConfig[i] : { bg: "#e2e8f0", color: "#64748b" };

              return (
                <li
                  key={r.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50"
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: medal.bg, color: medal.color }}
                  >
                    {rank <= 3 ? (
                      <span
                        dangerouslySetInnerHTML={{ __html: ICONS.trophy }}
                        className="[&>svg]:w-4 [&>svg]:h-4"
                      />
                    ) : (
                      rank
                    )}
                  </span>
                  <span className="text-xs font-semibold flex-1 truncate">
                    {r.nama_salut}
                  </span>
                  <span className="text-sm font-extrabold text-[var(--brand)]">
                    {formatNumber(r.total_bayar_akhir)}
                  </span>
                </li>
              );
            })}
          </ul>
          <a
            href="/ranking-salut"
            className="block w-full mt-4 text-xs font-semibold text-center text-[var(--brand)] border border-[var(--brand)]/30 rounded-lg py-2 hover:bg-[var(--brand)]/5"
          >
            Lihat Ranking Lengkap →
          </a>
        </div>
      </section>

      {/* Action Bar — exact match */}
      <section className="card p-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-[var(--muted)]">
          Menampilkan 1 - {data.length} dari {data.length} data
        </span>
        <div className="flex flex-wrap gap-2">
          <button className="text-xs font-semibold rounded-lg px-4 py-2 bg-emerald-600 text-white flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
              <path d="M213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66ZM128 192a8 8 0 0 1-5.66-2.34l-32-32a8 8 0 0 1 11.32-11.32L120 164.69V112a8 8 0 0 1 16 0v52.69l18.34-18.35a8 8 0 0 1 11.32 11.32l-32 32A8 8 0 0 1 128 192Z" />
            </svg>
            Export Excel
          </button>
          <button className="text-xs font-semibold rounded-lg px-4 py-2 bg-rose-600 text-white flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
              <path d="M213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66ZM128 192a8 8 0 0 1-5.66-2.34l-32-32a8 8 0 0 1 11.32-11.32L120 164.69V112a8 8 0 0 1 16 0v52.69l18.34-18.35a8 8 0 0 1 11.32 11.32l-32 32A8 8 0 0 1 128 192Z" />
            </svg>
            Export PDF
          </button>
          <button className="text-xs font-semibold rounded-lg px-4 py-2 bg-slate-700 text-white flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
              <path d="M214.67 72H200V40a8 8 0 0 0-8-8H64a8 8 0 0 0-8 8v32H41.33C27.36 72 16 82.77 16 96v80a8 8 0 0 0 8 8h32v32a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-32h32a8 8 0 0 0 8-8V96c0-13.23-11.36-24-25.33-24ZM72 48h112v24H72Zm112 160H72v-48h112Zm16-56a12 12 0 1 1 12-12 12 12 0 0 1-12 12Z" />
            </svg>
            Print
          </button>
        </div>
      </section>
    </>
  );
}
