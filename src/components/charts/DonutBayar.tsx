"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { SalutData } from "@/types/database";

interface Props {
  data: SalutData[];
}

export function DonutBayar({ data }: Props) {
  const totalBayar = data.reduce((s, d) => s + d.maba_bayar_admisi, 0);
  const totalBelum = data.reduce((s, d) => s + d.maba_belum_bayar_admisi, 0);

  const chartData = [
    { name: "Sudah Bayar", value: totalBayar },
    { name: "Belum Bayar", value: totalBelum },
  ];

  const COLORS = ["#16a34a", "#ef4444"];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            fontSize: 11,
            borderRadius: 8,
            border: "1px solid #e6ebf3",
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
