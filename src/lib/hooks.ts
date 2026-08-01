"use client";

import useSWR from "swr";
import type { SalutData, DashboardSummary } from "@/types/database";
import { calculateSummary } from "@/lib/utils";

export const DATA_KEY = "/api/data";

interface DataResponse {
  data: SalutData[];
  upload: { id: string; nama_file: string; created_at: string } | null;
}

const fetcher = async (url: string): Promise<DataResponse> => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Gagal mengambil data");
  }
  return json;
};

const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 5000,
};

interface UseDataReturn {
  data: SalutData[];
  summary: DashboardSummary | null;
  uploadInfo: { id: string; nama_file: string; created_at: string } | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboardData(): UseDataReturn {
  const { data, error, isLoading, mutate } = useSWR<DataResponse>(
    DATA_KEY,
    fetcher,
    swrConfig
  );

  const rows = data?.data ?? [];
  const summary = rows.length > 0 ? calculateSummary(rows) : null;

  return {
    data: rows,
    summary,
    uploadInfo: data?.upload ?? null,
    loading: isLoading,
    error: error ? error.message : null,
    refresh: () => mutate(),
  };
}
