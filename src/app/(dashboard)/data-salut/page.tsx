"use client";

import { formatNumber, formatPercent } from "@/lib/utils";
import { useDashboardData } from "@/lib/hooks";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { AnimatedBar } from "@/components/ui/AnimatedBar";

export default function DataSalutPage() {
  const { data, loading } = useDashboardData();

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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-[var(--brand-dark)]">Data SALUT / Pokjar</h2>

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-[11px] font-bold tracking-wide text-[var(--muted)]">TOTAL SALUT</div>
          <AnimatedNumber value={data.length} className="text-2xl font-extrabold text-[var(--brand)]" />
          <div className="text-[11px] text-[var(--muted)]">Pokjar terdaftar</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] font-bold tracking-wide text-[var(--muted)]">TOTAL ADMISI</div>
          <AnimatedNumber value={totalAdmisi} format={formatNumber} className="text-2xl font-extrabold text-[var(--brand)]" />
          <div className="text-[11px] text-[var(--muted)]">Mahasiswa</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] font-bold tracking-wide text-[var(--muted)]">RATA-RATA ADMISI</div>
          <AnimatedNumber value={data.length > 0 ? Math.round(totalAdmisi / data.length) : 0} format={formatNumber} className="text-2xl font-extrabold text-[var(--brand)]" />
          <div className="text-[11px] text-[var(--muted)]">Per SALUT</div>
        </div>
      </div>

      {/* Cards per SALUT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((d) => {
          const realisasiPct = d.target_maba > 0 ? (d.maba_registrasi_bayar_spp / d.target_maba) * 100 : 0;
          return (
            <div key={d.id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold truncate">{d.nama_salut}</h3>
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
                  <span className="text-[var(--muted)]">Maba Bayar SPP:</span>{" "}
                  <AnimatedNumber value={d.maba_registrasi_bayar_spp} format={formatNumber} className="font-semibold text-emerald-600" />
                </div>
                <div className="bg-orange-50/50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">On-Going Bayar SPP:</span>{" "}
                  <AnimatedNumber value={d.ongoing_bayar_spp} format={formatNumber} className="font-semibold" />
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
