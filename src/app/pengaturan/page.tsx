"use client";

import { useState } from "react";
import { UploadForm } from "@/components/ui/UploadForm";
import { UploadHistory } from "@/components/ui/UploadHistory";

export default function PengaturanPage() {
  const [refreshHistory, setRefreshHistory] = useState(false);

  const handleUploadSuccess = () => {
    // Toggle to trigger refetch in UploadHistory
    setRefreshHistory((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-[var(--brand-dark)]">
        Pengaturan
      </h2>

      {/* Upload Section */}
      <div className="card p-6">
        <h3 className="text-sm font-bold mb-4">Upload Data Excel</h3>
        <UploadForm onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* Upload History */}
      <div className="card p-6">
        <h3 className="text-sm font-bold mb-4">Riwayat Upload</h3>
        <UploadHistory refreshTrigger={refreshHistory} />
      </div>
    </div>
  );
}
