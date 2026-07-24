"use client";

import { useState, useEffect } from "react";
import type { SalutData } from "@/types/database";
import { formatNumber, formatPercent } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";

export default function GrafikAnalitikPage() {
  const [data, setData] = useState<SalutData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((json) => { setData(json.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-4 animate-pulse h-72" />)}</div>;

  const sorted = [...data].sort((a, b) => b.total_admisi - a.total_admisi);
  const totalAdmisi = data.reduce((s, d) => s + d.total_admisi, 0);
  const totalBayar = data.reduce((s, d) => s + d.maba_bayar_admisi, 0);
  const totalBelum = data.reduce((s, d) => s + d.maba_belum_bayar_admisi, 0);

  const barData = sorted.map((d) => ({
    name: d.nama_salut.replace("SALUT ", "").substring(0, 12),
    admisi: d.total_admisi,
    bayar: d.maba_bayar_admisi,
    belum: d.maba_belum_bayar_admisi,
  }));

  const ongoingData = sorted.map((d) => ({
    name: d.nama_salut.replace("SALUT ", "").substring(0, 12),
    maba: d.maba_registrasi_total,
    ongoing: d.ongoing_total_registrasi,
  }));

  const pieData = [
    { name: "Sudah Bayar", value: totalBayar, fill: "#16a34a" },
    { name: "Belum Bayar", value: totalBelum, fill: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-[var(--brand-dark)]">Grafik & Analitik</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center"><div className="text-2xl font-extrabold text-[var(--brand)]">{formatNumber(totalAdmisi)}</div><div className="text-xs text-[var(--muted)]">Total Admisi</div></div>
        <div className="card p-4 text-center"><div className="text-2xl font-extrabold text-emerald-600">{formatNumber(totalBayar)}</div><div className="text-xs text-[var(--muted)]">Total Bayar</div></div>
        <div className="card p-4 text-center"><div className="text-2xl font-extrabold text-rose-600">{formatNumber(totalBelum)}</div><div className="text-xs text-[var(--muted)]">Belum Bayar</div></div>
        <div className="card p-4 text-center"><div className="text-2xl font-extrabold text-violet-600">{formatPercent(totalAdmisi > 0 ? totalBayar / totalAdmisi : 0)}</div><div className="text-xs text-[var(--muted)]">Progress Bayar</div></div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-bold mb-4">Perbandingan Admisi vs Bayar per SALUT</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e6ebf3" }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="admisi" name="Admisi" fill="#1b4fa8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bayar" name="Bayar" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="belum" name="Belum Bayar" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-bold mb-4">Maba vs Ongoing Registrasi per SALUT</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ongoingData} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
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

      <div className="card p-5">
        <h3 className="text-sm font-bold mb-4">Komposisi Pembayaran</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius="50%" outerRadius="75%" paddingAngle={2} dataKey="value">
                {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
