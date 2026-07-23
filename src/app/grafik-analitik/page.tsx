"use client";

import { useState, useEffect } from "react";
import type { SalutData } from "@/types/database";
import { formatNumber, formatPercent } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

export default function GrafikAnalitikPage() {
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
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-4 animate-pulse h-72" />
        ))}
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.total_admisi - a.total_admisi);
  const totalAdmisi = data.reduce((s, d) => s + d.total_admisi, 0);
  const totalBayar = data.reduce((s, d) => s + d.admisi_bayar, 0);
  const totalBelum = data.reduce((s, d) => s + d.admisi_belum_bayar, 0);
  const totalNim = data.reduce((s, d) => s + d.dapat_nim, 0);

  const pieData = [
    { name: "Sudah Bayar", value: totalBayar, fill: "#16a34a" },
    { name: "Belum Bayar", value: totalBelum, fill: "#ef4444" },
  ];

  const nimPieData = [
    { name: "Dapat NIM", value: totalNim, fill: "#7c3aed" },
    { name: "Belum NIM", value: totalAdmisi - totalNim, fill: "#e2e8f0" },
  ];

  const barData = sorted.map((d) => ({
    name: d.nama_salut.replace("SALUT ", "").substring(0, 12),
    admisi: d.total_admisi,
    bayar: d.admisi_bayar,
    belum: d.admisi_belum_bayar,
  }));

  const sv23Data = sorted.map((d) => ({
    name: d.nama_salut.replace("SALUT ", "").substring(0, 12),
    sv23: d.sv23_total,
    ongoing: d.ongoing_total,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-[var(--brand-dark)]">
        Grafik & Analitik
      </h2>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-[var(--brand)]">{formatNumber(totalAdmisi)}</div>
          <div className="text-xs text-[var(--muted)]">Total Admisi</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-emerald-600">{formatNumber(totalBayar)}</div>
          <div className="text-xs text-[var(--muted)]">Total Bayar</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-rose-600">{formatNumber(totalBelum)}</div>
          <div className="text-xs text-[var(--muted)]">Belum Bayar</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-violet-600">{formatPercent(totalAdmisi > 0 ? (totalBayar / totalAdmisi) * 100 : 0)}</div>
          <div className="text-xs text-[var(--muted)]">Progress Bayar</div>
        </div>
      </div>

      {/* Admisi vs Bayar per SALUT */}
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

      {/* Ongoing + SV23 */}
      <div className="card p-5">
        <h3 className="text-sm font-bold mb-4">Ongoing & Total Bayar SV23 per SALUT</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sv23Data} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e6ebf3" }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="ongoing" name="Ongoing" fill="#d97706" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sv23" name="Total Bayar SV23" fill="#ca8a04" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4">Komposisi Pembayaran</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius="50%" outerRadius="75%" paddingAngle={2} dataKey="value">
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4">Progress Dapat NIM</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={nimPieData} cx="50%" cy="45%" innerRadius="50%" outerRadius="75%" paddingAngle={2} dataKey="value">
                  {nimPieData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdown per SALUT detail */}
      <div className="card p-5">
        <h3 className="text-sm font-bold mb-4">Breakdown Detail per SALUT</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((d) => (
            <div key={d.id} className="p-3 rounded-xl bg-slate-50 space-y-2">
              <div className="text-xs font-bold truncate">{d.nama_salut}</div>
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                <div>
                  <div className="text-[var(--muted)]">Admisi</div>
                  <div className="font-bold">{formatNumber(d.total_admisi)}</div>
                </div>
                <div>
                  <div className="text-[var(--muted)]">Bayar</div>
                  <div className="font-bold text-emerald-600">{formatNumber(d.admisi_bayar)}</div>
                </div>
                <div>
                  <div className="text-[var(--muted)]">NIM</div>
                  <div className="font-bold">{formatNumber(d.dapat_nim)}</div>
                </div>
                <div>
                  <div className="text-[var(--muted)]">Reg MTK</div>
                  <div className="font-bold">{formatNumber(d.total_admisi - d.belum_registrasi_mtk)}</div>
                </div>
                <div>
                  <div className="text-[var(--muted)]">Ongoing</div>
                  <div className="font-bold">{formatNumber(d.ongoing_total)}</div>
                </div>
                <div>
                  <div className="text-[var(--muted)]">SV23</div>
                  <div className="font-bold text-[var(--brand)]">{formatNumber(d.sv23_total)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
