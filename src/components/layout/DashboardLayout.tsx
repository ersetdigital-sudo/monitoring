"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">{children}</div>
          <footer className="bg-white border-t border-[var(--line)] px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--muted)]">
            <span>&copy; 2024 Universitas Terbuka. All rights reserved.</span>
            <span>Dashboard Monitoring Registrasi Mahasiswa v1.0.0</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
