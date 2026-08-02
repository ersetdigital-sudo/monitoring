"use client";

import { useMemo } from "react";
import type { SalutData } from "@/types/database";
import { formatNumber, formatPercent, displaySalutName } from "@/lib/utils";
import { useDashboardData } from "@/lib/hooks";
import { useFilter } from "@/lib/filter-context";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { BarChartCard, GroupedBarChartCard, DonutCard } from "@/components/charts";

export default function GrafikAnalitikPage() {
  const { data: rawData, loading } = useDashboardData();
  const { filter } = useFilter();

  const data = useMemo(() => {
    if (!filter.salut) return rawData;
    return rawData.filter((d) => d.nama_salut === filter.salut);
  }, [rawData, filter]);

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-4 animate-pulse h-72" />)}</div>;

  const sorted = [...data].sort((a, b) => b.total_admisi - a.total_admisi);

  const sum = (key: keyof SalutData) =>
    data.reduce((s, d) => s + (typeof d[key] === "number" ? (d[key] as number) : 0), 0);

  const totalAdmisi = sum("total_admisi");
  const totalBayarAdmisi = sum("maba_bayar_admisi");
  const totalBelumAdmisi = sum("maba_belum_bayar_admisi");
  const totalMabaBayar = sum("maba_registrasi_bayar_spp");
  const totalMabaBelum = sum("maba_registrasi_belum_bayar_spp");
  const totalOngoingBayar = sum("ongoing_bayar_spp");
  const totalOngoingBelum = sum("ongoing_belum_bayar_spp");
  const totalBayarSpp = sum("total_bayar_spp_gabungan");
  const totalRegistrasi = sum("maba_registrasi_total") + sum("ongoing_total_registrasi");
  const sisaRegistrasi = Math.max(totalRegistrasi - totalBayarSpp, 0);

  const shortName = (d: SalutData) => displaySalutName(d.nama_salut).replace("SALUT ", "").substring(0, 12);

  const barData = {
    admisi: sorted.map((d) => ({ name: shortName(d), value: d.total_admisi })),
    bayarAdmisi: sorted.map((d) => ({ name: shortName(d), value: d.maba_bayar_admisi })),
    mabaBayar: sorted.map((d) => ({ name: shortName(d), value: d.maba_registrasi_bayar_spp })),
    ongoingBayar: sorted.map((d) => ({ name: shortName(d), value: d.ongoing_bayar_spp })),
    totalBayar: sorted.map((d) => ({ name: shortName(d), value: d.total_bayar_spp_gabungan })),
  };

  const groupedData = sorted.map((d) => ({
    name: shortName(d),
    maba: d.maba_registrasi_total,
    ongoing: d.ongoing_total_registrasi,
  }));

  const targetData = sorted.map((d) => ({
    name: shortName(d),
    mabaBayar: d.maba_registrasi_bayar_spp,
    target: d.target_maba,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-[var(--brand-dark)]">Grafik & Analitik</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center"><AnimatedNumber value={totalAdmisi} format={formatNumber} className="text-2xl font-extrabold text-[var(--brand)]" /><div className="text-xs text-[var(--muted)]">Total Admisi</div></div>
        <div className="card p-4 text-center"><AnimatedNumber value={totalBayarAdmisi} format={formatNumber} className="text-2xl font-extrabold text-emerald-600" /><div className="text-xs text-[var(--muted)]">Total Bayar Admisi</div></div>
        <div className="card p-4 text-center"><AnimatedNumber value={totalMabaBayar} format={formatNumber} className="text-2xl font-extrabold text-blue-600" /><div className="text-xs text-[var(--muted)]">Maba Bayar SPP</div></div>
        <div className="card p-4 text-center"><AnimatedNumber value={totalOngoingBayar} format={formatNumber} className="text-2xl font-extrabold text-orange-600" /><div className="text-xs text-[var(--muted)]">On-Going Bayar SPP</div></div>
      </div>

      {/* A. Bar Chart per SALUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BarChartCard title="Admisi Per SALUT" data={barData.admisi} dataKey="value" name="Jumlah Admisi" fill="#1b4fa8" />
        <BarChartCard title="Bayar Admisi Per SALUT" data={barData.bayarAdmisi} dataKey="value" name="Bayar Admisi" fill="#16a34a" />
        <BarChartCard title="Maba Bayar SPP Per SALUT" data={barData.mabaBayar} dataKey="value" name="Maba Bayar SPP" fill="#2563eb" />
        <BarChartCard title="On-Going Bayar SPP Per SALUT" data={barData.ongoingBayar} dataKey="value" name="On-Going Bayar SPP" fill="#d97706" />
        <BarChartCard title="Total Bayar SPP Per SALUT" data={barData.totalBayar} dataKey="value" name="Total Bayar SPP Maba dan Ongoing" fill="#7c3aed" />
      </div>

      {/* B. Grouped: Maba vs Ongoing Registrasi */}
      <GroupedBarChartCard
        title="Maba vs Ongoing Registrasi per SALUT"
        data={groupedData}
        series={[
          { dataKey: "maba", name: "Maba", fill: "#2563eb" },
          { dataKey: "ongoing", name: "Ongoing", fill: "#d97706" },
        ]}
      />

      {/* C. Bayar Maba vs Target */}
      <GroupedBarChartCard
        title="Perbandingan Total Bayar Maba dan Target"
        data={targetData}
        yMax={100}
        series={[
          { dataKey: "mabaBayar", name: "Bayar SPP Maba", fill: "#16a34a" },
          { dataKey: "target", name: "Target Maba", fill: "#94a3b8" },
        ]}
      />

      {/* D. Progress Donut */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DonutCard
          title="Progress Admisi"
          subtitle="Bayar vs Belum Bayar Admisi"
          centerValue={totalBayarAdmisi}
          centerLabel="Bayar Admisi"
          segments={[
            { name: "Bayar Admisi", value: totalBayarAdmisi, fill: "#16a34a" },
            { name: "Belum Bayar", value: totalBelumAdmisi, fill: "#ef4444" },
          ]}
        />
        <DonutCard
          title="Progress Maba"
          subtitle="Bayar vs Belum Bayar SPP (Maba)"
          centerValue={totalMabaBayar}
          centerLabel="Bayar SPP Maba"
          segments={[
            { name: "Bayar SPP", value: totalMabaBayar, fill: "#16a34a" },
            { name: "Belum Bayar", value: totalMabaBelum, fill: "#ef4444" },
          ]}
        />
        <DonutCard
          title="Progress On-Going"
          subtitle="Bayar vs Belum Bayar SPP (Ongoing)"
          centerValue={totalOngoingBayar}
          centerLabel="Bayar SPP Ong."
          segments={[
            { name: "Bayar SPP", value: totalOngoingBayar, fill: "#16a34a" },
            { name: "Belum Bayar", value: totalOngoingBelum, fill: "#ef4444" },
          ]}
        />
        <DonutCard
          title="Progress Total Bayar SPP"
          subtitle={`Terhadap Total Registrasi (${formatNumber(totalRegistrasi)})`}
          centerValue={totalBayarSpp}
          centerLabel="Total Bayar SPP"
          segments={[
            { name: "Bayar SPP", value: totalBayarSpp, fill: "#16a34a" },
            { name: "Belum Bayar SPP", value: sisaRegistrasi, fill: "#ef4444" },
          ]}
        />
      </div>
    </div>
  );
}
