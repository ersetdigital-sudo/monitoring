"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { SalutData } from "@/types/database";
import { formatPercent } from "@/lib/utils";

interface Props {
  data: SalutData[];
}

export function DonutProgress({ data }: Props) {
  const totalAdmisi = data.reduce((s, d) => s + d.total_admisi, 0);
  const totalBayar = data.reduce((s, d) => s + d.maba_bayar_admisi, 0);
  const percentDecimal = totalAdmisi > 0 ? totalBayar / totalAdmisi : 0;
  const percent = percentDecimal * 100;

  const chartData = [
    { name: "Progress", value: percent },
    { name: "Sisa", value: 100 - percent },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="85%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
          >
            <Cell fill="#1b4fa8" />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute text-center">
        <div className="text-2xl font-extrabold text-[var(--brand)]">
          {formatPercent(percentDecimal)}
        </div>
      </div>
    </div>
  );
}
