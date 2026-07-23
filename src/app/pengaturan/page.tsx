import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "@/components/ui/UploadForm";
import type { Upload } from "@/types/database";

export default async function PengaturanPage() {
  const supabase = await createClient();

  const { data: uploads } = await supabase
    .from("uploads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-[var(--brand-dark)]">
        Pengaturan
      </h2>

      {/* Upload Section */}
      <div className="card p-6">
        <h3 className="text-sm font-bold mb-4">Upload Data Excel</h3>
        <UploadForm />
      </div>

      {/* Upload History */}
      <div className="card p-6">
        <h3 className="text-sm font-bold mb-4">Riwayat Upload</h3>
        {uploads && uploads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[var(--muted)] border-b border-[var(--line)]">
                  <th className="py-2 pr-3 font-semibold">File</th>
                  <th className="py-2 pr-3 font-semibold">Tanggal</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3 font-semibold">Baris</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {uploads.map((u: Upload) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 font-semibold">{u.nama_file}</td>
                    <td className="py-2.5 pr-3 text-[var(--muted)]">
                      {new Date(u.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : u.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {u.status === "completed"
                          ? "Berhasil"
                          : u.status === "failed"
                          ? "Gagal"
                          : "Proses"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">{u.valid_rows ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">Belum ada data upload.</p>
        )}
      </div>
    </div>
  );
}
