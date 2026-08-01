"use client";

import type { SalutData } from "@/types/database";
import { formatNumber, formatPercent } from "@/lib/utils";
import { useDashboardData } from "@/lib/hooks";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";

type DonutSegment = { name: string; value: number; fill: string };

function DonutCard({
  title,
  subtitle,
  segments,
  centerValue,
  centerLabel,
}: {
  title: string;
  subtitle?: string;
  segments: DonutSegment[];
  centerValue: number;
  centerLabel: string;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  const centerPct = total > 0 ? centerValue / total : 0;

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold">{title}</h3>
      {subtitle && <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>}
      <div className="relative h-52 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              cx="50%" cy="50%" innerRadius="58%" outerRadius="85%"
              paddingAngle={2} dataKey="value" strokeWidth={0}
            >
              {segments.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e6ebf3" }}
              formatter={(v) => formatNumber(Number(v))}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <AnimatedNumber
            value={centerValue}
            format={formatNumber}
            className="text-2xl font-extrabold text-[var(--brand)]"
          />
          <div className="text-[10px] text-[var(--muted)]">{centerLabel}</div>
          <div className="text-xs font-bold text-emerald-600 mt-0.5">{formatPercent(centerPct)}</div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs">
        {segments.map((s) => {
          const pct = total > 0 ? s.value / total : 0;
          return (
            <span key={s.name} className="flex items-center gap-1.5 text-[var(--muted)]">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.fill }} />
              {s.name} <b className="text-[var(--ink)]">{formatNumber(s.value)}</b>
              <span className="text-emerald-600 font-semibold">{formatPercent(pct)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function BarCard({
  title,
  dataKey,
  name,
  fill,
  data,
}: {
  title: string;
  dataKey: string;
  name: string;
  fill: string;
  data: { name: string; value: number }[];
}) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold mb-4">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e6ebf3" }}
              formatter={(v) => formatNumber(Number(v))}
            />
            <Bar dataKey={dataKey} name={name} fill={fill} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function GrafikAnalitikPage() {
  const { data, loading } = useDashboardData();

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
  const totalTarget = sum("target_maba");
  const sisaTarget = Math.max(totalTarget - totalBayarSpp, 0);

  const shortName = (d: SalutData) => d.nama_salut.replace("SALUT ", "").substring(0, 12);

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
        <BarCard title="Admisi Per SALUT" dataKey="value" name="Jumlah Admisi" fill="#1b4fa8" data={barData.admisi} />
        <BarCard title="Bayar Admisi Per SALUT" dataKey="value" name="Bayar Admisi" fill="#16a34a" data={barData.bayarAdmisi} />
        <BarCard title="Maba Bayar SPP Per SALUT" dataKey="value" name="Maba Bayar SPP" fill="#2563eb" data={barData.mabaBayar} />
        <BarCard title="On-Going Bayar SPP Per SALUT" dataKey="value" name="On-Going Bayar SPP" fill="#d97706" data={barData.ongoingBayar} />
        <BarCard title="Total Bayar SPP Per SALUT" dataKey="value" name="Total Bayar SPP Maba dan Ongoing" fill="#7c3aed" data={barData.totalBayar} />
      </div>

      {/* B. Grouped: Maba vs Ongoing Registrasi */}
      <div className="card p-5">
        <h3 className="text-sm font-bold mb-4">Maba vs Ongoing Registrasi per SALUT</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupedData} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e6ebf3" }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="maba" name="Maba" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ongoing" name="Ongoing" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* C. Bayar Maba vs Target */}
      <div className="card p-5">
        <h3 className="text-sm font-bold mb-4">Perbandingan Total Bayar Maba dan Target</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={targetData} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e6ebf3" }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="mabaBayar" name="Bayar SPP Maba" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target Maba" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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
          subtitle={`Terhadap Target Maba (${formatNumber(totalTarget)})`}
          centerValue={totalBayarSpp}
          centerLabel="Total Bayar SPP"
          segments={[
            { name: "Bayar SPP", value: totalBayarSpp, fill: "#16a34a" },
            { name: "Sisa Target", value: sisaTarget, fill: "#ef4444" },
          ]}
        />
      </div>
    </div>
  );
}
