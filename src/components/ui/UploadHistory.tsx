"use client";

import { useState, useEffect, useCallback } from "react";
import type { Upload } from "@/types/database";

interface UploadHistoryProps {
  refreshTrigger?: boolean;
}

export function UploadHistory({ refreshTrigger }: UploadHistoryProps) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUploads = useCallback(async () => {
    try {
      const res = await fetch("/api/uploads");
      const json = await res.json();
      setUploads(json.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  // Refetch when refreshTrigger changes (upload succeeded)
  useEffect(() => {
    if (refreshTrigger) {
      fetchUploads();
    }
  }, [refreshTrigger, fetchUploads]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">Belum ada data upload.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="text-[var(--muted)] border-b border-[var(--line)]">
            <th className="py-2 pr-3 font-semibold">File</th>
            <th className="py-2 pr-3 font-semibold">Tanggal</th>
            <th className="py-2 pr-3 font-semibold">Status</th>
            <th className="py-2 pr-3 font-semibold">Baris</th>
            <th className="py-2 pr-3 font-semibold">Duplikat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {uploads.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50">
              <td className="py-2.5 pr-3 font-semibold">{u.nama_file}</td>
              <td className="py-2.5 pr-3 text-[var(--muted)]">
                {new Date(u.created_at).toLocaleString("id-ID")}
              </td>
              <td className="py-2.5 pr-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    u.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : u.status === "failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {u.status === "completed"
                    ? "Berhasil"
                    : u.status === "failed"
                    ? "Gagal"
                    : "Proses"}
                </span>
              </td>
              <td className="py-2.5 pr-3">{u.valid_rows ?? "-"}</td>
              <td className="py-2.5 pr-3">
                {u.duplicate_rows && u.duplicate_rows > 0 ? (
                  <span className="text-amber-600 font-semibold">{u.duplicate_rows}</span>
                ) : (
                  <span className="text-[var(--muted)]">0</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
