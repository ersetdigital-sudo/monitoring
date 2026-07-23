"use client";

import { ICONS } from "@/lib/icons";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
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
    <header className="bg-white border-b border-[var(--line)] px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Hamburger mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100"
        >
          <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
            <path d="M224 128a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8ZM40 72h176a8 8 0 0 0 0-16H40a8 8 0 0 0 0 16Zm176 112H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16Z" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-[var(--brand-dark)] leading-tight">
            Dashboard Monitoring Registrasi Mahasiswa
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            Selamat datang di Dashboard Monitoring Registrasi Mahasiswa
            Universitas Terbuka
          </p>
        </div>
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
          className="text-xs font-semibold text-white rounded-lg px-4 py-2.5 flex items-center gap-2"
          style={{ background: "var(--brand)" }}
        >
          <span dangerouslySetInnerHTML={{ __html: ICONS.refresh }} />
          <span className="hidden sm:inline">Refresh Data</span>
        </button>
      </div>
    </header>
  );
}
