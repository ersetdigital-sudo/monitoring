"use client";

import { useMemo } from "react";
import { ICONS } from "@/lib/icons";
import { useDashboardData } from "@/lib/hooks";
import { useFilter } from "@/lib/filter-context";
import { formatNumber, formatPercent, isNonSalut, displaySalutName } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { BarChartCard, GroupedBarChartCard, DonutCard } from "@/components/charts";

export function DashboardContent() {
  const { data: rawData, summary: rawSummary, uploadInfo, loading, error, refresh } =
    useDashboardData();
  const { filter } = useFilter();

  const data = useMemo(() => {
    let result = rawData;

    // Filter by SALUT
    if (filter.salut) {
      result = result.filter((d) => d.nama_salut === filter.salut);
    }

    // Filter by Status Bayar
    if (filter.statusBayar === "sudah_bayar") {
      result = result.filter((d) => d.maba_bayar_admisi > 0 || d.ongoing_bayar_spp > 0);
    } else if (filter.statusBayar === "belum_bayar") {
      result = result.filter((d) => d.maba_belum_bayar_admisi > 0 || d.ongoing_belum_bayar_spp > 0);
    }

    return result;
  }, [rawData, filter]);

  const summary = useMemo(() => {
    if (data.length === 0) return null;
    const total_admisi = data.reduce((s, d) => s + d.total_admisi, 0);
    const total_bayar = data.reduce((s, d) => s + d.maba_bayar_admisi, 0);
    const belum_bayar = data.reduce((s, d) => s + d.maba_belum_bayar_admisi, 0);
    const dapat_nim = data.reduce((s, d) => s + d.dapat_nim, 0);
    const registrasi_mtk = data.reduce((s, d) => s + d.maba_registrasi_total, 0);
    const maba_registrasi_belum_bayar_spp = data.reduce(
      (s, d) => s + d.maba_registrasi_belum_bayar_spp,
      0
    );
    const maba_registrasi_bayar_spp = data.reduce(
      (s, d) => s + d.maba_registrasi_bayar_spp,
      0
    );
    const ongoing = data.reduce((s, d) => s + d.ongoing_total_registrasi, 0);
    const total_registrasi = registrasi_mtk + ongoing;
    const ongoing_belum_bayar_spp = data.reduce(
      (s, d) => s + d.ongoing_belum_bayar_spp,
      0
    );
    const ongoing_bayar_spp = data.reduce((s, d) => s + d.ongoing_bayar_spp, 0);
    const total_bayar_spp_gabungan = data.reduce((s, d) => s + d.total_bayar_spp_gabungan, 0);
    const target_maba = data.reduce((s, d) => s + d.target_maba, 0);
    const realisasi_maba = target_maba > 0 ? maba_registrasi_bayar_spp / target_maba : 0;
    return {
      total_admisi,
      total_bayar,
      belum_bayar,
      dapat_nim,
      registrasi_mtk,
      maba_registrasi_belum_bayar_spp,
      maba_registrasi_bayar_spp,
      ongoing,
      total_registrasi,
      ongoing_belum_bayar_spp,
      ongoing_bayar_spp,
      target_maba,
      realisasi_maba,
      total_bayar_spp_gabungan,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
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

  const pctInt = (num: number, den: number) =>
    den > 0 ? `${Math.round((num / den) * 100)}%` : "0%";

  const stats = [
    { title: "Total Admisi", value: summary.total_admisi, format: formatNumber, unit: "Mahasiswa", sub: `${pctInt(summary.total_admisi, summary.target_maba)} dari Target Maba`, color: "#2563eb", bg: "#e0edff", icon: ICONS.users },
    { title: "Total Bayar Admisi", value: summary.total_bayar, format: formatNumber, unit: "Mahasiswa", sub: `${pctInt(summary.total_bayar, summary.total_admisi)} dari Total Admisi`, color: "#16a34a", bg: "#dcfce7", icon: ICONS.checkCircle },
    { title: "Belum Bayar Admisi", value: summary.belum_bayar, format: formatNumber, unit: "Mahasiswa", sub: `${pctInt(summary.belum_bayar, summary.total_admisi)} dari Total Admisi`, color: "#ea580c", bg: "#ffedd5", icon: ICONS.receipt },
    { title: "Dapat NIM", value: summary.dapat_nim, format: formatNumber, unit: "Mahasiswa", sub: `${pctInt(summary.dapat_nim, summary.total_admisi)} dari Total Admisi`, color: "#7c3aed", bg: "#ede9fe", icon: ICONS.id },
    { title: "Maba Registrasi", value: summary.registrasi_mtk, format: formatNumber, unit: "Mahasiswa", sub: `${pctInt(summary.registrasi_mtk, summary.dapat_nim)} dari Dapat NIM`, color: "#0891b2", bg: "#ecfeff", icon: ICONS.book },
    { title: "Maba Belum Bayar SPP", value: summary.maba_registrasi_belum_bayar_spp, format: formatNumber, unit: "Mahasiswa", sub: `${pctInt(summary.maba_registrasi_belum_bayar_spp, summary.registrasi_mtk)} dari Maba Registrasi`, color: "#dc2626", bg: "#fee2e2", icon: ICONS.clock },
    { title: "Maba Sudah Bayar SPP", value: summary.maba_registrasi_bayar_spp, format: formatNumber, unit: "Mahasiswa", sub: `${pctInt(summary.maba_registrasi_bayar_spp, summary.registrasi_mtk)} dari Maba Registrasi`, color: "#059669", bg: "#ecfdf5", icon: ICONS.checkCircle },
    { title: "Realisasi Maba", value: summary.realisasi_maba, format: formatPercent, unit: "Pencapaian", sub: `${formatNumber(summary.maba_registrasi_bayar_spp)}/${formatNumber(summary.target_maba)} Mahasiswa`, color: "#4f46e5", bg: "#e0e7ff", icon: ICONS.gauge },
    { title: "On-Going Belum Bayar SPP", value: summary.ongoing_belum_bayar_spp, format: formatNumber, unit: "Mahasiswa", sub: `${pctInt(summary.ongoing_belum_bayar_spp, summary.ongoing)} dari Total Registrasi`, color: "#d97706", bg: "#fef3c7", icon: ICONS.clock },
    { title: "On-Going Bayar SPP", value: summary.ongoing_bayar_spp, format: formatNumber, unit: "Mahasiswa", sub: `${pctInt(summary.ongoing_bayar_spp, summary.ongoing)} dari Total Registrasi`, color: "#16a34a", bg: "#dcfce7", icon: ICONS.money },
    { title: "Total Registrasi", value: summary.total_registrasi, format: formatNumber, unit: "Mahasiswa", sub: "Maba + On-Going", color: "#0ea5e9", bg: "#e0f2fe", icon: ICONS.users },
    { title: "Total Bayar SPP", value: summary.total_bayar_spp_gabungan, format: formatNumber, unit: "Mahasiswa", sub: "Maba + On-Going", color: "#8b5cf6", bg: "#f5f3ff", icon: ICONS.money },
  ];

  const top5 = [...rawData]
    .filter((d) => !isNonSalut(d.nama_salut))
    .sort((a, b) => b.total_bayar_spp_gabungan - a.total_bayar_spp_gabungan)
    .slice(0, 5);

  const shortName = (d: typeof data[number]) => d.nama_salut.replace("SALUT ", "").substring(0, 12);
  const sortedData = [...data].sort((a, b) => b.total_admisi - a.total_admisi);
  const previewTotalBayar = sortedData.map((d) => ({
    name: shortName(d),
    value: d.total_bayar_spp_gabungan,
  }));
  const previewTarget = sortedData.map((d) => ({
    name: shortName(d),
    mabaBayar: d.maba_registrasi_bayar_spp,
    target: d.target_maba,
  }));
  const previewBayarSpp = data.reduce((s, d) => s + d.total_bayar_spp_gabungan, 0);
  const previewTargetTotal = data.reduce((s, d) => s + d.target_maba, 0);

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
          Data dari: <span className="font-semibold">{uploadInfo.nama_file.replace(/\.xlsx$/i, "")}</span>{" "}
          — {new Date(uploadInfo.created_at).toLocaleString("id-ID")}
        </div>
      )}

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.title} className="card p-4 flex items-start gap-3">
            <div
              className="stat-icon"
              style={{ background: s.bg, color: s.color }}
              dangerouslySetInnerHTML={{ __html: s.icon }}
            />
            <div className="min-w-0">
              <div className="text-[11px] font-bold tracking-wide text-[var(--muted)]">{s.title}</div>
              <AnimatedNumber value={s.value} format={s.format} className="text-2xl font-extrabold leading-tight" style={{ color: s.color }} />
              <div className="text-[11px] text-[var(--muted)]">{s.unit}</div>
              {s.sub && <div className="text-[10px] font-semibold mt-0.5" style={{ color: s.color }}>{s.sub}</div>}
            </div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        <BarChartCard
          title="Total Bayar SPP Per SALUT"
          data={previewTotalBayar}
          dataKey="value"
          name="Total Bayar SPP"
          fill="#7c3aed"
          heightClass="h-56"
        />
        <GroupedBarChartCard
          title="Perbandingan Total Bayar Maba dan Target"
          data={previewTarget}
          yMax={100}
          heightClass="h-56"
          series={[
            { dataKey: "mabaBayar", name: "Bayar SPP Maba", fill: "#16a34a" },
            { dataKey: "target", name: "Target Maba", fill: "#94a3b8" },
          ]}
        />
        <DonutCard
          title="Progress Total Bayar SPP"
          subtitle={`Terhadap Target Maba (${formatNumber(previewTargetTotal)})`}
          heightClass="h-44"
          centerValue={previewBayarSpp}
          centerLabel="Total Bayar SPP"
          segments={[
            { name: "Bayar SPP", value: previewBayarSpp, fill: "#16a34a" },
            { name: "Sisa Target", value: Math.max(previewTargetTotal - previewBayarSpp, 0), fill: "#ef4444" },
          ]}
        />
      </section>

      {/* Table + Ranking */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="card p-4 xl:col-span-2 overflow-hidden">
          <h3 className="text-sm font-bold mb-2">Data Registrasi per SALUT</h3>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mb-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-200 border border-blue-300" />Maba (Baru)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-200 border border-slate-300" />Capaian / Target</span>
            <span className="flex items-center gap-1"><span className="w-0.5 h-4 bg-slate-300" />Pemisah</span>
          </div>
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-[var(--muted)] border-b border-[var(--line)]">
                  <th className="py-2 pr-3 font-semibold">NO</th>
                  <th className="py-2 pr-3 font-semibold">SALUT</th>
                  <th className="py-2 pr-3 font-semibold bg-blue-100">ADMISI</th>
                  <th className="py-2 pr-3 font-semibold bg-blue-100">BAYAR ADMISI</th>
                  <th className="py-2 pr-3 font-semibold bg-blue-100">MABA BAYAR</th>
                  <th className="py-2 pr-3 font-semibold bg-slate-100 border-l-4 border-l-slate-300">TARGET</th>
                  <th className="py-2 pr-3 font-semibold bg-slate-100">REALISASI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {data.map((r, i) => {
                  const pct = r.target_maba > 0 ? (r.maba_registrasi_bayar_spp / r.target_maba) * 100 : 0;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-3 text-[var(--muted)]">{i + 1}</td>
                      <td className="py-2.5 pr-3 font-semibold">{displaySalutName(r.nama_salut)}</td>
                      <td className="py-2.5 pr-3 bg-blue-50">{formatNumber(r.total_admisi)}</td>
                      <td className="py-2.5 pr-3 text-emerald-600 font-semibold bg-blue-50">{formatNumber(r.maba_bayar_admisi)}</td>
                      <td className="py-2.5 pr-3 bg-blue-50">{formatNumber(r.maba_registrasi_bayar_spp)}</td>
                      <td className="py-2.5 pr-3 bg-slate-50 border-l-4 border-l-slate-300">{formatNumber(r.target_maba)}</td>
                      <td className="py-2.5 pr-3 font-semibold text-emerald-700 bg-slate-50">{formatPercent(pct / 100)}</td>
                    </tr>
                  );
                })}
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
                  <AnimatedNumber value={r.total_bayar_spp_gabungan} format={formatNumber} className="text-sm font-extrabold text-[var(--brand)]" />
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
