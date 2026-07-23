"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ICONS } from "@/lib/icons";
import type { SalutData } from "@/types/database";

const navItems = [
  { href: "/", label: "Dashboard", icon: ICONS.dashboard },
  { href: "/data-salut", label: "Data SALUT", icon: ICONS.folder },
  { href: "/grafik-analitik", label: "Grafik & Analitik", icon: ICONS.chart },
  { href: "/tabel-data", label: "Tabel Data", icon: ICONS.table },
  { href: "/ranking-salut", label: "Ranking SALUT", icon: ICONS.trophy },
  { href: "/laporan", label: "Laporan", icon: ICONS.document },
  { href: "/pengaturan", label: "Pengaturan", icon: ICONS.settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [salutList, setSalutList] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          const names = json.data.map((d: SalutData) => d.nama_salut);
          setSalutList(names);
        }
      })
      .catch(() => {});
  }, []);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50
          w-64 h-screen flex flex-col text-white/90
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background:
            "linear-gradient(180deg, var(--brand-dark), var(--brand-deep))",
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--brand)] font-extrabold">
            UT
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-wide">
              UNIVERSITAS TERBUKA
            </div>
            <div className="text-[10px] text-white/60 italic">
              Making Higher Education Open to All
            </div>
          </div>
          {/* Close button mobile */}
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-1 rounded hover:bg-white/10"
          >
            <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
              <path d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1 text-sm flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                  isActive ? "active" : ""
                }`}
              >
                <span dangerouslySetInnerHTML={{ __html: item.icon }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Filter Section */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="text-[11px] font-bold tracking-wider text-white/50 mb-2">
            FILTER DATA
          </div>
          <div className="space-y-2">
            <select className="w-full text-xs bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white/90 outline-none">
              <option>Semua SALUT</option>
              {salutList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select className="w-full text-xs bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white/90 outline-none">
              <option>Semua Status Bayar</option>
              <option>Sudah Bayar</option>
              <option>Belum Bayar</option>
            </select>
          </div>
          <button className="w-full mt-3 text-xs font-semibold bg-white text-[var(--brand)] rounded-lg py-2 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
              <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
            </svg>
            Terapkan Filter
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 text-[10px] text-white/50 border-t border-white/10">
          <div className="text-xl font-extrabold text-white/90 leading-none">
            Kampus Merdeka
          </div>
        </div>
      </aside>
    </>
  );
}
