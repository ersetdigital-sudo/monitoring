"use client";

import { useState, useEffect, useCallback } from "react";
import type { SalutData, DashboardSummary } from "@/types/database";
import { calculateSummary } from "@/lib/utils";

interface UseDataReturn {
  data: SalutData[];
  summary: DashboardSummary | null;
  uploadInfo: { id: string; nama_file: string; created_at: string } | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboardData(): UseDataReturn {
  const [data, setData] = useState<SalutData[]>([]);
  const [uploadInfo, setUploadInfo] = useState<{
    id: string;
    nama_file: string;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/data");
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal mengambil data");
      }

      setData(json.data || []);
      setUploadInfo(json.upload || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summary = data.length > 0 ? calculateSummary(data) : null;

  return { data, summary, uploadInfo, loading, error, refresh: fetchData };
}
