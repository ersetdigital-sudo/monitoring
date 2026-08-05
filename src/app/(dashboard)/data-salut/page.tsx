"use client";

import { useMemo } from "react";
import { formatNumber, formatPercent, displaySalutName, isNonSalut } from "@/lib/utils";
import { useDashboardData } from "@/lib/hooks";
import { useFilter } from "@/lib/filter-context";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { AnimatedBar } from "@/components/ui/AnimatedBar";

export default function DataSalutPage() {
  const { data: rawData, loading } = useDashboardData();
  const { filter } = useFilter();

  const data = useMemo(() => {
    if (!filter.salut) return rawData;
    return rawData.filter((d) => d.nama_salut === filter.salut);
  }, [rawData, filter]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  const totalAdmisi = data.reduce((s, d) => s + d.total_admisi, 0);
  const totalSalut = data.filter((d) => !isNonSalut(d.nama_salut)).length;

  const sortedData = [...data].sort(
    (a, b) => (isNonSalut(a.nama_salut) ? 1 : 0) - (isNonSalut(b.nama_salut) ? 1 : 0)
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-[var(--brand-dark)]">Data SALUT</h2>

      {/* Legend */}
      <div className="card p-3 flex flex-wrap items-center gap-4 text-xs">
        <span className="font-semibold text-[var(--muted)]">Keterangan:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-200 border border-blue-300" />
          Maba (Baru)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-orange-200 border border-orange-300" />
          Ongoing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300" />
          Gabungan
        </span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="text-[11px] font-bold tracking-wide text-[var(--muted)]">TOTAL SALUT</div>
          <AnimatedNumber value={totalSalut} className="text-2xl font-extrabold text-[var(--brand)]" />
          <div className="text-[11px] text-[var(--muted)]">SALUT terdaftar</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] font-bold tracking-wide text-[var(--muted)]">TOTAL ADMISI</div>
          <AnimatedNumber value={totalAdmisi} format={formatNumber} className="text-2xl font-extrabold text-[var(--brand)]" />
          <div className="text-[11px] text-[var(--muted)]">Mahasiswa</div>
        </div>
      </div>

      {/* Cards per SALUT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedData.map((d) => {
          const realisasiPct = d.target_maba > 0 ? (d.maba_registrasi_bayar_spp / d.target_maba) * 100 : 0;
          return (
            <div key={d.id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold truncate">{displaySalutName(d.nama_salut)}</h3>
                <AnimatedNumber
                  value={realisasiPct / 100}
                  format={formatPercent}
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: realisasiPct >= 80 ? "#dcfce7" : realisasiPct >= 50 ? "#fef3c7" : "#fee2e2",
                    color: realisasiPct >= 80 ? "#16a34a" : realisasiPct >= 50 ? "#d97706" : "#dc2626",
                  }}
                />
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <AnimatedBar value={realisasiPct} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">Target:</span>{" "}
                  <AnimatedNumber value={d.target_maba} format={formatNumber} className="font-semibold" />
                </div>
                <div className="bg-blue-50/50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">Admisi:</span>{" "}
                  <AnimatedNumber value={d.total_admisi} format={formatNumber} className="font-semibold" />
                </div>
                <div className="bg-blue-50/50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">Dapat NIM:</span>{" "}
                  <AnimatedNumber value={d.dapat_nim} format={formatNumber} className="font-semibold" />
                </div>
                <div className="bg-blue-50/50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">Maba Belum Registrasi:</span>{" "}
                  <AnimatedNumber value={d.belum_registrasi_mtk} format={formatNumber} className="font-semibold text-red-600" />
                </div>
                <div className="bg-blue-50/50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">Maba Bayar SPP:</span>{" "}
                  <AnimatedNumber value={d.maba_registrasi_bayar_spp} format={formatNumber} className="font-semibold text-emerald-600" />
                </div>
                <div className="bg-blue-50/50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">Maba Belum Bayar SPP:</span>{" "}
                  <AnimatedNumber value={d.maba_registrasi_belum_bayar_spp} format={formatNumber} className="font-semibold text-red-600" />
                </div>
                <div className="bg-orange-50/50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">On-Going Bayar SPP:</span>{" "}
                  <AnimatedNumber value={d.ongoing_bayar_spp} format={formatNumber} className="font-semibold" />
                </div>
                <div className="bg-orange-50/50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">On-Going Belum Bayar SPP:</span>{" "}
                  <AnimatedNumber value={d.ongoing_belum_bayar_spp} format={formatNumber} className="font-semibold text-red-600" />
                </div>
                <div className="bg-slate-50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">Total Bayar SPP:</span>{" "}
                  <AnimatedNumber value={d.total_bayar_spp_gabungan} format={formatNumber} className="font-bold text-[var(--brand)]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
