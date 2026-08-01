"use client";

import { useMemo, useState } from "react";
import type { SalutData } from "@/types/database";
import { formatNumber, displaySalutName, isNonSalut } from "@/lib/utils";
import { useDashboardData } from "@/lib/hooks";

export default function TabelDataPage() {
  const { data, loading } = useDashboardData();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof SalutData | "realisasi">("nama_salut");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const handleSort = (key: keyof SalutData | "realisasi") => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = data;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.nama_salut.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const aNon = isNonSalut(a.nama_salut) ? 1 : 0;
      const bNon = isNonSalut(b.nama_salut) ? 1 : 0;
      if (aNon !== bNon) return aNon - bNon;
      if (sortKey === "realisasi") {
        const av = a.target_maba > 0 ? a.maba_registrasi_bayar_spp / a.target_maba : 0;
        const bv = b.target_maba > 0 ? b.maba_registrasi_bayar_spp / b.target_maba : 0;
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

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const totals = filtered.reduce(
    (acc, d) => {
      acc.total_admisi += d.total_admisi;
      acc.maba_bayar_admisi += d.maba_bayar_admisi;
      acc.maba_registrasi_bayar_spp += d.maba_registrasi_bayar_spp;
      acc.target_maba += d.target_maba;
      return acc;
    },
    { total_admisi: 0, maba_bayar_admisi: 0, maba_registrasi_bayar_spp: 0, target_maba: 0 }
  );
  const realisasiTotal =
    totals.target_maba > 0 ? (totals.maba_registrasi_bayar_spp / totals.target_maba) * 100 : 0;

  const SortIcon = ({ col }: { col: keyof SalutData | "realisasi" }) => (
    <span className="ml-1 text-[10px]">
      {sortKey === col ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  // Column groups with color coding
  const columns: {
    key: keyof SalutData | "realisasi";
    label: string;
    group?: "maba" | "capaian";
    divider?: boolean;
  }[] = [
    { key: "nama_salut", label: "SALUT" },
    { key: "total_admisi", label: "ADMISI", group: "maba" },
    { key: "maba_bayar_admisi", label: "BAYAR ADMISI", group: "maba" },
    { key: "maba_registrasi_bayar_spp", label: "MABA BAYAR", group: "maba" },
    { key: "target_maba", label: "TARGET", group: "capaian", divider: true },
    { key: "realisasi", label: "REALISASI", group: "capaian" },
  ];

  const groupBg: Record<string, string> = {
    maba: "bg-blue-50",
    capaian: "bg-slate-50",
  };

  const groupCellBg: Record<string, string> = {
    maba: "bg-blue-50/30",
    capaian: "bg-slate-50/30",
  };

  const dividerClass = "border-l-4 border-l-slate-300";

  const handleExport = () => {
    const headers = columns.map((c) => c.label).join(",");
    const rows = filtered
      .map((d) =>
        columns
          .map((c) => {
            if (c.key === "nama_salut") return `"${displaySalutName(d.nama_salut)}"`;
            if (c.key === "realisasi") {
              const pct = d.target_maba > 0 ? (d.maba_registrasi_bayar_spp / d.target_maba) * 100 : 0;
              return `${pct.toFixed(2)}%`;
            }
            return d[c.key as keyof SalutData];
          })
          .join(",")
      )
      .join("\n");
    const totalRow = [
      '"JUMLAH"',
      totals.total_admisi,
      totals.maba_bayar_admisi,
      totals.maba_registrasi_bayar_spp,
      totals.target_maba,
      `${realisasiTotal.toFixed(2)}%`,
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
          <span className="w-3 h-3 rounded bg-blue-200 border border-blue-300" />
          Maba (Baru)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300" />
          Capaian / Target
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-0.5 h-4 bg-slate-300" />
          Pemisah
        </span>
      </div>

      {/* Search + Export */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Cari SALUT..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
              <tr className="text-[var(--muted)] border-b border-[var(--line)]">
                <th className="py-2 pr-3 font-semibold w-8">NO</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-2 pr-3 font-semibold cursor-pointer hover:text-[var(--ink)] select-none whitespace-nowrap ${col.divider ? dividerClass : ""} ${groupBg[col.group ?? ""] ?? ""}`}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    <SortIcon col={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-8 text-center text-[var(--muted)]">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                paginated.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 text-[var(--muted)]">{(page - 1) * perPage + i + 1}</td>
                    {columns.map((col) => {
                      let display: string;
                      if (col.key === "realisasi") {
                        const pct = r.target_maba > 0 ? (r.maba_registrasi_bayar_spp / r.target_maba) * 100 : 0;
                        display = `${pct.toFixed(2).replace(".", ",")}%`;
                      } else if (col.key === "nama_salut") {
                        display = displaySalutName(r.nama_salut);
                      } else {
                        const val = r[col.key as keyof SalutData];
                        display = typeof val === "number" ? formatNumber(val) : String(val);
                      }

                      let cellClass = `py-2.5 pr-3 ${col.divider ? dividerClass : ""} ${groupCellBg[col.group ?? ""] ?? ""}`;
                      if (col.key === "maba_bayar_admisi") cellClass += " text-emerald-600 font-semibold";
                      if (col.key === "realisasi") cellClass += " font-semibold text-emerald-700";

                      return <td key={col.key} className={cellClass}>{display}</td>;
                    })}
                  </tr>
                ))
              )}

              {/* JUMLAH row */}
              {filtered.length > 0 && (
                <tr className="font-bold bg-slate-100/80 border-t-2 border-[var(--line)]">
                  <td className="py-2.5 pr-3 text-[var(--muted)]" />
                  {columns.map((col) => {
                    let display: string;
                    let cellClass = `py-2.5 pr-3 ${col.divider ? dividerClass : ""} ${groupCellBg[col.group ?? ""] ?? ""}`;
                    if (col.key === "nama_salut") {
                      display = "JUMLAH";
                      cellClass += " text-[var(--brand-dark)]";
                    } else if (col.key === "realisasi") {
                      display = `${realisasiTotal.toFixed(2).replace(".", ",")}%`;
                      cellClass += " text-emerald-700";
                    } else if (col.key === "total_admisi") {
                      display = formatNumber(totals.total_admisi);
                    } else if (col.key === "maba_bayar_admisi") {
                      display = formatNumber(totals.maba_bayar_admisi);
                    } else if (col.key === "maba_registrasi_bayar_spp") {
                      display = formatNumber(totals.maba_registrasi_bayar_spp);
                    } else {
                      display = formatNumber(totals.target_maba);
                    }
                    return <td key={col.key} className={cellClass}>{display}</td>;
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--line)]">
          <span className="text-xs text-[var(--muted)]">
            Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} dari {filtered.length} data
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="text-xs px-3 py-1.5 rounded border border-[var(--line)] disabled:opacity-40 hover:bg-slate-50">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`text-xs px-3 py-1.5 rounded border ${p === page ? "bg-[var(--brand)] text-white border-[var(--brand)]" : "border-[var(--line)] hover:bg-slate-50"}`}>{p}</button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="text-xs px-3 py-1.5 rounded border border-[var(--line)] disabled:opacity-40 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
