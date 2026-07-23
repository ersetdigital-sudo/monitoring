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
        {/* === ZONA ATAS: Logo (fixed, tidak pernah scroll) === */}
        <div className="flex-shrink-0 px-5 py-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[var(--brand)] font-extrabold text-sm">
            UT
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-extrabold tracking-wide">
              UNIVERSITAS TERBUKA
            </div>
            <div className="text-[9px] text-white/60 italic">
              Making Higher Education Open to All
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-1 rounded hover:bg-white/10"
          >
            <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
              <path d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z" />
            </svg>
          </button>
        </div>

        {/* === ZONA TENGAH: Menu navigasi (scrollable kalau overflow) === */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 sidebar-scroll">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] ${
                  isActive ? "active" : ""
                }`}
              >
                <span
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                  className="[&>svg]:w-[16px] [&>svg]:h-[16px] flex-shrink-0"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* === ZONA BAWAH: Filter + Footer (fixed, tidak pernah scroll) === */}
        <div className="flex-shrink-0 border-t border-white/10">
          {/* Filter */}
          <div className="px-4 py-3">
            <div className="text-[10px] font-bold tracking-wider text-white/50 mb-1.5">
              FILTER DATA
            </div>
            <div className="space-y-1.5">
              <select className="w-full text-[11px] bg-white/10 border border-white/15 rounded-lg px-2.5 py-1.5 text-white/90 outline-none">
                <option>Semua SALUT</option>
                {salutList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select className="w-full text-[11px] bg-white/10 border border-white/15 rounded-lg px-2.5 py-1.5 text-white/90 outline-none">
                <option>Semua Status Bayar</option>
                <option>Sudah Bayar</option>
                <option>Belum Bayar</option>
              </select>
            </div>
            <button className="w-full mt-2 text-[11px] font-semibold bg-white text-[var(--brand)] rounded-lg py-1.5 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 256 256" fill="currentColor">
                <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
              </svg>
              Terapkan Filter
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/10">
            <div className="text-lg font-extrabold text-white/90 leading-none">
              Kampus Merdeka
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
