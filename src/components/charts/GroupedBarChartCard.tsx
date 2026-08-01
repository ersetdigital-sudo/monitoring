"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { formatNumber } from "@/lib/utils";

export type BarSeries = { dataKey: string; name: string; fill: string };

export function GroupedBarChartCard({
  title,
  subtitle,
  data,
  series,
  yMax,
  heightClass = "h-80",
}: {
  title: string;
  subtitle?: string;
  data: Record<string, string | number>[];
  series: BarSeries[];
  yMax?: number;
  heightClass?: string;
}) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold">{title}</h3>
      {subtitle && <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>}
      <div className={`${heightClass} mt-2`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={yMax ? [0, yMax] : undefined} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e6ebf3" }}
              formatter={(v) => formatNumber(Number(v))}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {series.map((s) => (
              <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.fill} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
