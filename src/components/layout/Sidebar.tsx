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

export function Sidebar() {
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

  return (
    <aside
      className="hidden lg:flex w-64 flex-col text-white/90 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, var(--brand-dark), var(--brand-deep))",
      }}
    >
      {/* Logo — exact match */}
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
      </div>

      {/* Navigation — exact match */}
      <nav className="px-3 py-4 space-y-1 text-sm">
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

      {/* Filter Section — exact match */}
      <div className="px-4 mt-2">
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
          <select className="w-full text-xs bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white/90 outline-none">
            <option>Semua Dapat NIM</option>
            <option>Sudah Dapat NIM</option>
            <option>Belum Dapat NIM</option>
          </select>
          <select className="w-full text-xs bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white/90 outline-none">
            <option>Semua Ongoing</option>
            <option>Ada Ongoing</option>
            <option>Tidak Ongoing</option>
          </select>
        </div>
        <button className="w-full mt-3 text-xs font-semibold bg-white text-[var(--brand)] rounded-lg py-2 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
            <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
          </svg>
          Terapkan Filter
        </button>
        <button className="w-full mt-2 text-xs font-semibold bg-white/10 border border-white/15 rounded-lg py-2 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
            <path d="M197.67 186.37a8 8 0 0 1 0 11.29A95.92 95.92 0 0 1 32 128a8 8 0 0 1 16 0 80 80 0 1 0 20.28-53.28L83.72 90.14A8 8 0 0 1 78 103.73H32a8 8 0 0 1-8-8V49.68a8 8 0 0 1 13.66-5.66l14.28 14.28A96 96 0 0 1 197.67 186.37Z" />
          </svg>
          Reset Filter
        </button>
      </div>

      {/* Footer — exact match */}
      <div className="mt-auto p-4 text-[10px] text-white/50">
        <div className="text-2xl font-extrabold text-white/90 leading-none">
          Kampus
          <br />
          Merdeka
        </div>
      </div>
    </aside>
  );
}
