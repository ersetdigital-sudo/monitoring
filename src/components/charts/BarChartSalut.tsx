"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SalutData } from "@/types/database";

interface Props {
  data: SalutData[];
}

export function BarChartSalut({ data }: Props) {
  const chartData = data
    .sort((a, b) => b.total_admisi - a.total_admisi)
    .map((d) => ({
      name: d.nama_salut.replace("SALUT ", "").replace("NON POKJAR / NON ", "").replace("TIDAK TERDETEKSI", "T/D"),
      admisi: d.total_admisi,
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf3" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9, fill: "#64748b" }}
          angle={-60}
          textAnchor="end"
          height={60}
          interval={0}
        />
        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
        <Tooltip
          contentStyle={{
            fontSize: 11,
            borderRadius: 8,
            border: "1px solid #e6ebf3",
          }}
        />
        <Bar dataKey="admisi" radius={[4, 4, 0, 0]} maxBarSize={32}>
          {chartData.map((_, i) => (
            <Cell key={i} fill="#1b4fa8" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
