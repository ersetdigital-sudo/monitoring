import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <Header />
        <div className="flex-1 p-5 sm:p-6 space-y-6">{children}</div>
        <footer className="mt-auto bg-white border-t border-[var(--line)] px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--muted)]">
          <span>&copy; 2024 Universitas Terbuka. All rights reserved.</span>
          <span>Dashboard Monitoring Registrasi Mahasiswa v1.0.0</span>
        </footer>
      </main>
    </div>
  );
}
