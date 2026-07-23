"use client";

import { useState, useRef } from "react";
import type { DuplicateDetail } from "@/types/database";

interface UploadResult {
  success?: boolean;
  all_duplicate?: boolean;
  upload_id?: string;
  rows_imported?: number;
  rows_duplicate?: number;
  duplicates?: DuplicateDetail[];
  warnings?: string[];
  error?: string;
  details?: string[];
}

interface UploadFormProps {
  onUploadSuccess?: () => void;
}

export function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);

      if (data.success && data.rows_imported > 0) {
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
        onUploadSuccess?.();
      }
    } catch {
      setResult({ error: "Gagal mengupload file. Coba lagi." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-[var(--line)] rounded-xl p-8 text-center hover:border-[var(--brand)]/40 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const dropped = e.dataTransfer.files[0];
          if (dropped?.name.endsWith(".xlsx")) setFile(dropped);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-sm text-[var(--muted)]"
        >
          <div className="text-3xl mb-2">📄</div>
          <div className="font-semibold text-[var(--ink)]">
            {file ? file.name : "Klik atau drag file .xlsx ke sini"}
          </div>
          <div className="text-xs mt-1">
            Format: Data_Registrasi.xlsx dengan struktur kolom sesuai template
          </div>
        </label>
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full text-sm font-semibold text-white rounded-lg py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: "var(--brand)" }}
      >
        {uploading ? "Mengupload & Memproses..." : "Upload & Import Data"}
      </button>

      {/* Result */}
      {result && (
        <div
          className={`rounded-lg p-4 text-sm ${
            result.error
              ? "bg-red-50 border border-red-200 text-red-800"
              : result.all_duplicate
              ? "bg-amber-50 border border-amber-200 text-amber-800"
              : "bg-green-50 border border-green-200 text-green-800"
          }`}
        >
          {result.error ? (
            <>
              <div className="font-bold">{result.error}</div>
              {result.details && (
                <ul className="mt-2 list-disc list-inside text-xs">
                  {Array.isArray(result.details)
                    ? result.details.map((d, i) => <li key={i}>{d}</li>)
                    : <li>{result.details}</li>}
                </ul>
              )}
            </>
          ) : result.all_duplicate ? (
            <>
              <div className="font-bold">Seluruh data sudah ada</div>
              <div>
                Semua {result.rows_duplicate} baris dalam file merupakan duplikat
                dari data sebelumnya. Tidak ada data baru yang diimport.
              </div>
            </>
          ) : (
            <>
              <div className="font-bold">Upload selesai!</div>
              <div>
                {result.rows_imported} baris berhasil diimport
                {result.rows_duplicate && result.rows_duplicate > 0 && (
                  <span>
                    ,{" "}
                    <span className="font-semibold text-amber-700">
                      {result.rows_duplicate} baris ditolak (duplikat)
                    </span>
                  </span>
                )}
                .
              </div>
            </>
          )}

          {/* Duplicate details */}
          {result.duplicates && result.duplicates.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-bold mb-1.5">
                Detail baris yang ditolak:
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left border-b border-amber-200">
                      <th className="py-1 pr-3 font-semibold">Nama SALUT</th>
                      <th className="py-1 pr-3 font-semibold">Alasan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {result.duplicates.map((d, i) => (
                      <tr key={i}>
                        <td className="py-1 pr-3">{d.nama_salut}</td>
                        <td className="py-1 pr-3 text-xs">{d.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Warnings */}
          {result.warnings && result.warnings.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-xs text-amber-700">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
