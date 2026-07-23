"use client";

import { ICONS } from "@/lib/icons";

interface HeaderProps {
  onRefresh?: () => void;
}

export function Header({ onRefresh }: HeaderProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <header className="bg-white border-b border-[var(--line)] px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-lg sm:text-2xl font-extrabold text-[var(--brand-dark)] leading-tight">
          Dashboard Monitoring Registrasi Mahasiswa
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)]">
          Selamat datang di Dashboard Monitoring Registrasi Mahasiswa
          Universitas Terbuka
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight hidden sm:block">
          <div className="text-xs font-semibold flex items-center justify-end gap-1.5">
            <span
              className="text-[var(--muted)]"
              dangerouslySetInnerHTML={{ __html: ICONS.calendar }}
            />
            {dateStr}
          </div>
          <div className="text-[11px] text-[var(--muted)]">{timeStr} WIB</div>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs font-semibold text-white rounded-lg px-4 py-2.5 flex items-center gap-2"
          style={{ background: "var(--brand)" }}
        >
          <span dangerouslySetInnerHTML={{ __html: ICONS.refresh }} />
          Refresh Data
        </button>
      </div>
    </header>
  );
}
