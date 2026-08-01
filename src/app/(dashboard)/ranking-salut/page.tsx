"use client";

import { formatNumber, formatPercent } from "@/lib/utils";
import { useDashboardData } from "@/lib/hooks";
import { ICONS } from "@/lib/icons";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { AnimatedBar } from "@/components/ui/AnimatedBar";

export default function RankingSalutPage() {
  const { data, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="card p-4 animate-pulse h-12" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card p-4 animate-pulse h-16" />
        ))}
      </div>
    );
  }

  const isNonSalut = (nama: string) => {
    const s = nama.toUpperCase().trim();
    return s.includes("NON SALUT") || s.includes("NON POKJAR");
  };

  const ranked = data
    .filter((d) => !isNonSalut(d.nama_salut))
    .sort((a, b) => b.total_bayar_spp_gabungan - a.total_bayar_spp_gabungan);
  const totalAdmisi = data.reduce((s, d) => s + d.total_admisi, 0);

  const medalConfig = [
    { bg: "#facc15", color: "#7a5c00" },
    { bg: "#cbd5e1", color: "#475569" },
    { bg: "#fdba74", color: "#9a3412" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-[var(--brand-dark)]">Ranking SALUT</h2>
        <span className="text-xs font-semibold text-[var(--muted)]">
          Berdasarkan Total Bayar SPP Maba dan Ongoing
        </span>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ranked.slice(0, 3).map((d, i) => {
          const medal = medalConfig[i];
          const pct = totalAdmisi > 0 ? (d.total_bayar_spp_gabungan / totalAdmisi) * 100 : 0;
          return (
            <div key={d.id} className="card p-5 text-center">
              <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: medal.bg, color: medal.color }}>
                <span dangerouslySetInnerHTML={{ __html: ICONS.trophy }} className="[&>svg]:w-7 [&>svg]:h-7" />
              </div>
              <div className="text-xs text-[var(--muted)] mb-1">#{i + 1}</div>
              <div className="text-sm font-bold mb-1 truncate">{d.nama_salut}</div>
              <AnimatedNumber
                value={d.total_bayar_spp_gabungan}
                format={formatNumber}
                className="text-2xl font-extrabold"
                style={{ color: "var(--brand)" }}
              />
              <div className="text-xs text-[var(--muted)]">
                {`${formatPercent(pct / 100)} dari total`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Ranking */}
      <div className="card p-4">
        <h3 className="text-sm font-bold mb-4">Ranking Lengkap</h3>
        <div className="space-y-2">
          {ranked.map((d, i) => {
            const rank = i + 1;
            const medal = i < 3 ? medalConfig[i] : null;
            const maxVal = ranked[0]?.total_bayar_spp_gabungan || 1;
            const barWidth = (d.total_bayar_spp_gabungan / maxVal) * 100;

            return (
              <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: medal ? medal.bg : "#e2e8f0", color: medal ? medal.color : "#64748b" }}>
                  {rank <= 3 ? <span dangerouslySetInnerHTML={{ __html: ICONS.trophy }} className="[&>svg]:w-4 [&>svg]:h-4" /> : rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{d.nama_salut}</div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                    <AnimatedBar value={Math.min(barWidth, 100)} />
                  </div>
                </div>
                <span className="text-sm font-extrabold text-[var(--brand)] flex-shrink-0">
                  <AnimatedNumber
                    value={d.total_bayar_spp_gabungan}
                    format={formatNumber}
                    duration={800}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
