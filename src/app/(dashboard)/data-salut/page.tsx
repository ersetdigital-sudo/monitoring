"use client";

import { useState, useEffect } from "react";
import type { SalutData } from "@/types/database";
import { formatNumber, formatPercent } from "@/lib/utils";

export default function DataSalutPage() {
  const [data, setData] = useState<SalutData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((json) => {
        setData(json.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
          <div className="text-2xl font-extrabold text-[var(--brand)]">{data.length}</div>
          <div className="text-[11px] text-[var(--muted)]">Pokjar terdaftar</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] font-bold tracking-wide text-[var(--muted)]">TOTAL ADMISI</div>
          <div className="text-2xl font-extrabold text-[var(--brand)]">{formatNumber(totalAdmisi)}</div>
          <div className="text-[11px] text-[var(--muted)]">Mahasiswa</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] font-bold tracking-wide text-[var(--muted)]">RATA-RATA ADMISI</div>
          <div className="text-2xl font-extrabold text-[var(--brand)]">{data.length > 0 ? formatNumber(Math.round(totalAdmisi / data.length)) : 0}</div>
          <div className="text-[11px] text-[var(--muted)]">Per SALUT</div>
        </div>
      </div>

      {/* Cards per SALUT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((d) => {
          const pctBayar = d.total_admisi > 0 ? (d.maba_bayar_admisi / d.total_admisi) * 100 : 0;
          return (
            <div key={d.id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold truncate">{d.nama_salut}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                  background: pctBayar >= 80 ? "#dcfce7" : pctBayar >= 50 ? "#fef3c7" : "#fee2e2",
                  color: pctBayar >= 80 ? "#16a34a" : pctBayar >= 50 ? "#d97706" : "#dc2626",
                }}>
                  {formatPercent(pctBayar / 100)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pctBayar}%`, background: "var(--brand)" }} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-50/50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">Admisi:</span>{" "}
                  <span className="font-semibold">{formatNumber(d.total_admisi)}</span>
                </div>
                <div className="bg-blue-50/50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">Bayar:</span>{" "}
                  <span className="font-semibold text-emerald-600">{formatNumber(d.maba_bayar_admisi)}</span>
                </div>
                <div className="bg-blue-50/50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">NIM:</span>{" "}
                  <span className="font-semibold">{formatNumber(d.dapat_nim)}</span>
                </div>
                <div className="bg-orange-50/50 rounded px-2 py-1">
                  <span className="text-[var(--muted)]">Ongoing:</span>{" "}
                  <span className="font-semibold">{formatNumber(d.ongoing_total_registrasi)}</span>
                </div>
                <div className="bg-slate-50 rounded px-2 py-1 col-span-2">
                  <span className="text-[var(--muted)]">Total Bayar SPP:</span>{" "}
                  <span className="font-bold text-[var(--brand)]">{formatNumber(d.total_bayar_spp_gabungan)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
