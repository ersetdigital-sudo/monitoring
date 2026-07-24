"use client";

import { useState, useEffect, useMemo } from "react";
import type { SalutData } from "@/types/database";
import { formatNumber } from "@/lib/utils";

export default function TabelDataPage() {
  const [data, setData] = useState<SalutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof SalutData>("nama_salut");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((json) => {
        setData(json.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSort = (key: keyof SalutData) => {
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

  const SortIcon = ({ col }: { col: keyof SalutData }) => (
    <span className="ml-1 text-[10px]">
      {sortKey === col ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  // Column groups with color coding
  const columns: { key: keyof SalutData; label: string; group: "maba" | "ongoing" | "gabungan" }[] = [
    { key: "nama_salut", label: "SALUT", group: "gabungan" },
    { key: "total_admisi", label: "ADMISI", group: "maba" },
    { key: "maba_bayar_admisi", label: "BAYAR", group: "maba" },
    { key: "maba_belum_bayar_admisi", label: "BELUM BAYAR", group: "maba" },
    { key: "dapat_nim", label: "DAPAT NIM", group: "maba" },
    { key: "belum_registrasi_mtk", label: "BELUM REG MTK", group: "maba" },
    { key: "maba_registrasi_belum_bayar_spp", label: "MABA Belum Bayar SPP", group: "maba" },
    { key: "maba_registrasi_bayar_spp", label: "MABA Bayar SPP", group: "maba" },
    { key: "maba_registrasi_total", label: "MABA Total Reg", group: "maba" },
    { key: "ongoing_belum_bayar_spp", label: "Ongoing Belum Bayar", group: "ongoing" },
    { key: "ongoing_bayar_spp", label: "Ongoing Bayar", group: "ongoing" },
    { key: "ongoing_total_registrasi", label: "Ongoing Total", group: "ongoing" },
    { key: "total_bayar_spp_gabungan", label: "TOTAL BAYAR SPP", group: "gabungan" },
    { key: "target_maba", label: "TARGET MABA", group: "gabungan" },
    { key: "realisasi_maba", label: "REALISASI", group: "gabungan" },
  ];

  const groupBg: Record<string, string> = {
    maba: "bg-blue-50",
    ongoing: "bg-orange-50",
    gabungan: "bg-slate-50",
  };

  const groupCellBg: Record<string, string> = {
    maba: "bg-blue-50/30",
    ongoing: "bg-orange-50/30",
    gabungan: "bg-slate-50/30",
  };

  const handleExport = () => {
    const headers = columns.map((c) => c.label).join(",");
    const rows = filtered
      .map((d) =>
        columns
          .map((c) => {
            const val = d[c.key as keyof SalutData];
            if (c.key === "nama_salut") return `"${val}"`;
            if (c.key === "realisasi_maba") return `${((val as number) * 100).toFixed(2)}%`;
            return val;
          })
          .join(",")
      )
      .join("\n");
    const csv = headers + "\n" + rows;
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
          <span className="w-3 h-3 rounded bg-orange-200 border border-orange-300" />
          Ongoing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300" />
          Gabungan
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
                    className={`py-2 pr-3 font-semibold cursor-pointer hover:text-[var(--ink)] select-none whitespace-nowrap ${groupBg[col.group]}`}
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
                      const val = r[col.key as keyof SalutData];
                      let display: string;
                      if (col.key === "realisasi_maba") {
                        display = `${((val as number) * 100).toFixed(1)}%`;
                      } else if (typeof val === "number") {
                        display = formatNumber(val);
                      } else {
                        display = String(val);
                      }

                      let cellClass = `py-2.5 pr-3 ${groupCellBg[col.group]}`;
                      if (col.key === "maba_bayar_admisi") cellClass += " text-emerald-600 font-semibold";
                      if (col.key === "maba_belum_bayar_admisi") cellClass += " text-rose-600";
                      if (col.key === "total_bayar_spp_gabungan") cellClass += " font-bold text-[var(--brand)]";
                      if (col.key === "realisasi_maba") cellClass += " font-semibold text-emerald-700";

                      return <td key={col.key} className={cellClass}>{display}</td>;
                    })}
                  </tr>
                ))
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
