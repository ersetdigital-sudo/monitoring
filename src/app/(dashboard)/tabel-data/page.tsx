"use client";

import { useMemo, useState } from "react";
import type { SalutData } from "@/types/database";
import { formatNumber, displaySalutName, isNonSalut } from "@/lib/utils";
import { useDashboardData } from "@/lib/hooks";
import { useFilter } from "@/lib/filter-context";

type LeafKey = keyof SalutData | "realisasi";

interface LeafCol {
  key: LeafKey;
  label: string;
  csvLabel: string;
  group: "maba" | "ongoing" | "total" | "target" | "realisasi";
}

const leafCols: LeafCol[] = [
  // Maba > Admisi
  { key: "total_admisi", label: "Jumlah Admisi", csvLabel: "Jumlah Admisi", group: "maba" },
  { key: "maba_bayar_admisi", label: "Bayar Admisi", csvLabel: "Bayar Admisi", group: "maba" },
  { key: "maba_belum_bayar_admisi", label: "Belum Bayar Admisi", csvLabel: "Belum Bayar Admisi", group: "maba" },
  // Maba > Dapat Nim
  { key: "dapat_nim", label: "Dapat Nim", csvLabel: "Dapat Nim", group: "maba" },
  // Maba > Registrasi Mtk
  { key: "belum_registrasi_mtk", label: "Belum Bayar SPP", csvLabel: "Belum Bayar SPP Maba", group: "maba" },
  { key: "maba_registrasi_bayar_spp", label: "Bayar SPP", csvLabel: "Bayar SPP Maba", group: "maba" },
  { key: "maba_registrasi_total", label: "Total Registrasi", csvLabel: "Total Registrasi Maba", group: "maba" },
  // Ongoing > Registrasi Mtk
  { key: "ongoing_belum_bayar_spp", label: "Belum Bayar SPP", csvLabel: "Belum Bayar SPP Ongoing", group: "ongoing" },
  { key: "ongoing_bayar_spp", label: "Bayar SPP", csvLabel: "Bayar SPP Ongoing", group: "ongoing" },
  { key: "ongoing_total_registrasi", label: "Total Registrasi", csvLabel: "Total Registrasi Ongoing", group: "ongoing" },
  // Gabungan
  { key: "total_bayar_spp_gabungan", label: "Total Bayar SPP", csvLabel: "Total Bayar SPP Maba dan Ongoing", group: "total" },
  { key: "target_maba", label: "Target", csvLabel: "Target Maba", group: "target" },
  { key: "realisasi", label: "Realisasi", csvLabel: "Realisasi", group: "realisasi" },
];

const groupHeaderBg: Record<string, string> = {
  maba: "bg-green-700 text-white",
  ongoing: "bg-amber-500 text-white",
  total: "bg-orange-600 text-white",
  target: "bg-slate-600 text-white",
  realisasi: "bg-slate-500 text-white",
};

const subGroupHeaderBg: Record<string, string> = {
  maba: "bg-green-100 text-green-900",
  ongoing: "bg-amber-100 text-amber-900",
  total: "bg-orange-50 text-orange-900",
  target: "bg-slate-100 text-slate-700",
  realisasi: "bg-slate-100 text-slate-700",
};

const leafHeaderBg: Record<string, string> = {
  maba: "bg-green-50 text-green-900",
  ongoing: "bg-amber-50 text-amber-900",
  total: "bg-orange-50 text-orange-900",
  target: "bg-slate-100 text-slate-700",
  realisasi: "bg-slate-100 text-slate-700",
};

const cellBg: Record<string, string> = {
  maba: "bg-green-50/30",
  ongoing: "bg-amber-50/30",
  total: "bg-orange-50/30",
  target: "bg-slate-50/40",
  realisasi: "bg-slate-50/40",
};

const realisasiOf = (d: SalutData) =>
  d.target_maba > 0 ? (d.maba_registrasi_bayar_spp / d.target_maba) * 100 : 0;

const pctText = (pct: number) => `${pct.toFixed(2).replace(".", ",")}%`;

export default function TabelDataPage() {
  const { data: rawData, loading } = useDashboardData();
  const { filter } = useFilter();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<LeafKey>("nama_salut");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const data = useMemo(() => {
    if (!filter.salut) return rawData;
    return rawData.filter((d) => d.nama_salut === filter.salut);
  }, [rawData, filter]);

  const handleSort = (key: LeafKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.nama_salut.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const aNon = isNonSalut(a.nama_salut) ? 1 : 0;
      const bNon = isNonSalut(b.nama_salut) ? 1 : 0;
      if (aNon !== bNon) return aNon - bNon;
      if (sortKey === "realisasi") {
        const av = realisasiOf(a);
        const bv = realisasiOf(b);
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
    return result;
  }, [data, search, sortKey, sortDir]);

  const totals = useMemo(
    () =>
      leafCols
        .filter((c) => c.key !== "realisasi")
        .reduce(
          (acc, c) => {
            acc[c.key] = filtered.reduce((s, d) => s + (d[c.key as keyof SalutData] as number), 0);
            return acc;
          },
          {} as Record<string, number>
        ),
    [filtered]
  );
  const realisasiTotal =
    (totals.target_maba ?? 0) > 0
      ? ((totals.maba_registrasi_bayar_spp ?? 0) / (totals.target_maba ?? 0)) * 100
      : 0;

  const SortIcon = ({ col }: { col: LeafKey }) => (
    <span className="ml-1 text-[10px]">
      {sortKey === col ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  const cellValue = (d: SalutData, c: LeafCol): string => {
    if (c.key === "realisasi") return pctText(realisasiOf(d));
    if (c.key === "nama_salut") return displaySalutName(d.nama_salut);
    const val = d[c.key as keyof SalutData];
    return typeof val === "number" ? formatNumber(val) : String(val);
  };

  const handleExport = () => {
    const headers = ["SALUT", ...leafCols.map((c) => c.csvLabel)].join(",");
    const rows = filtered
      .map((d) =>
        [
          `"${displaySalutName(d.nama_salut)}"`,
          ...leafCols.map((c) =>
            c.key === "realisasi"
              ? `${realisasiOf(d).toFixed(2)}%`
              : d[c.key as keyof SalutData]
          ),
        ].join(",")
      )
      .join("\n");
    const totalRow = [
      '"JUMLAH"',
      ...leafCols.map((c) =>
        c.key === "realisasi" ? `${realisasiTotal.toFixed(2)}%` : totals[c.key] ?? 0
      ),
    ].join(",");
    const csv = headers + "\n" + rows + "\n" + totalRow;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data_registrasi.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="card p-4 animate-pulse h-12" />
        <div className="card p-4 animate-pulse h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-[var(--brand-dark)]">Tabel Data</h2>

      {/* Legend */}
      <div className="card p-3 flex flex-wrap items-center gap-4 text-xs">
        <span className="font-semibold text-[var(--muted)]">Keterangan:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-600" />
          Maba (Baru)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500" />
          Ongoing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-orange-600" />
          Total Bayar SPP
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-600" />
          Target / Realisasi
        </span>
      </div>

      {/* Search + Export */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Cari SALUT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--brand)]/30 w-64"
        />
        <button onClick={handleExport} className="text-xs font-semibold rounded-lg px-4 py-2 bg-emerald-600 text-white">
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="card p-4 overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              {/* Baris 1: Grup besar */}
              <tr>
                <th
                  rowSpan={3}
                  onClick={() => handleSort("nama_salut")}
                  className="sticky left-0 z-30 py-2 pr-3 font-semibold cursor-pointer select-none whitespace-nowrap bg-[var(--brand-dark)] text-white"
                >
                  SALUT
                  <SortIcon col="nama_salut" />
                </th>
                <th colSpan={7} className={`py-2 pr-3 font-semibold text-center whitespace-nowrap ${groupHeaderBg.maba}`}>
                  MABA
                </th>
                <th colSpan={3} className={`py-2 pr-3 font-semibold text-center whitespace-nowrap ${groupHeaderBg.ongoing}`}>
                  ONGOING
                </th>
                <th className={`py-2 pr-3 font-semibold text-center whitespace-nowrap ${groupHeaderBg.total}`}>
                  TOTAL BAYAR SPP MABA & ONGOING
                </th>
                <th className={`py-2 pr-3 font-semibold text-center whitespace-nowrap ${groupHeaderBg.target}`}>
                  TARGET MABA
                </th>
                <th className={`py-2 pr-3 font-semibold text-center whitespace-nowrap ${groupHeaderBg.realisasi}`}>
                  REALISASI
                </th>
              </tr>
              {/* Baris 2: Sub-grup */}
              <tr>
                <th colSpan={3} className={`py-1.5 pr-3 font-semibold text-center whitespace-nowrap ${subGroupHeaderBg.maba}`}>
                  Admisi
                </th>
                <th rowSpan={2} className={`py-1.5 pr-3 font-semibold text-center whitespace-nowrap ${subGroupHeaderBg.maba}`}>
                  Dapat Nim
                </th>
                <th colSpan={3} className={`py-1.5 pr-3 font-semibold text-center whitespace-nowrap ${subGroupHeaderBg.maba}`}>
                  Registrasi Mtk
                </th>
                <th colSpan={3} className={`py-1.5 pr-3 font-semibold text-center whitespace-nowrap ${subGroupHeaderBg.ongoing}`}>
                  Registrasi Mtk
                </th>
                <th className={`py-1.5 pr-3 ${subGroupHeaderBg.total}`} />
                <th className={`py-1.5 pr-3 ${subGroupHeaderBg.target}`} />
                <th className={`py-1.5 pr-3 ${subGroupHeaderBg.realisasi}`} />
              </tr>
              {/* Baris 3: Kolom daun */}
              <tr>
                {leafCols.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`py-1.5 pr-3 font-semibold cursor-pointer hover:opacity-80 select-none whitespace-nowrap ${leafHeaderBg[col.group]}`}
                  >
                    {col.label}
                    <SortIcon col={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={leafCols.length + 1} className="py-8 text-center text-[var(--muted)]">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="sticky left-0 z-10 py-2.5 pr-3 font-semibold bg-white whitespace-nowrap">
                      {displaySalutName(r.nama_salut)}
                    </td>
                    {leafCols.map((col) => (
                      <td
                        key={col.key}
                        className={`py-2.5 pr-3 whitespace-nowrap ${cellBg[col.group]} ${
                          col.key === "maba_bayar_admisi" || col.key === "maba_registrasi_bayar_spp" || col.key === "ongoing_bayar_spp"
                            ? "text-emerald-600 font-semibold"
                            : ""
                        } ${col.key === "realisasi" ? "font-semibold text-emerald-700" : ""} ${col.key === "total_bayar_spp_gabungan" ? "font-bold text-[var(--brand)]" : ""}`}
                      >
                        {cellValue(r, col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}

              {/* JUMLAH row */}
              {filtered.length > 0 && (
                <tr className="font-bold bg-slate-100/80 border-t-2 border-[var(--line)]">
                  <td className="sticky left-0 z-10 py-2.5 pr-3 text-[var(--brand-dark)] bg-slate-100 whitespace-nowrap">
                    JUMLAH
                  </td>
                  {leafCols.map((col) => (
                    <td
                      key={col.key}
                      className={`py-2.5 pr-3 whitespace-nowrap ${
                        col.key === "realisasi"
                          ? "font-semibold text-emerald-700"
                          : col.key === "total_bayar_spp_gabungan"
                          ? "text-[var(--brand)]"
                          : ""
                      }`}
                    >
                      {col.key === "realisasi" ? pctText(realisasiTotal) : formatNumber(totals[col.key] ?? 0)}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Info jumlah data */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--line)]">
          <span className="text-xs text-[var(--muted)]">
            Menampilkan semua {filtered.length} data (termasuk baris JUMLAH: {filtered.length + 1} baris total)
          </span>
        </div>
      </div>
    </div>
  );
}
