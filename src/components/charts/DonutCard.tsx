"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatNumber, formatPercent } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export type DonutSegment = { name: string; value: number; fill: string };

export function DonutCard({
  title,
  subtitle,
  segments,
  centerValue,
  centerLabel,
  heightClass = "h-52",
}: {
  title: string;
  subtitle?: string;
  segments: DonutSegment[];
  centerValue: number;
  centerLabel: string;
  heightClass?: string;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  const centerPct = total > 0 ? centerValue / total : 0;

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold">{title}</h3>
      {subtitle && <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>}
      <div className={`relative ${heightClass} mt-2`}>
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
