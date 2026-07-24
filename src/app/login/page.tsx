"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="card w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-extrabold text-white"
            style={{ background: "var(--brand)" }}
          >
            UTM
          </div>
          <h1
            className="text-xl font-extrabold"
            style={{ color: "var(--brand-dark)" }}
          >
            UNIVERSITAS TERBUKA MAJENE
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Dashboard Monitoring Registrasi Mahasiswa
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[var(--ink)] mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@ut.ac.id"
              required
              className="w-full px-4 py-2.5 text-sm border border-[var(--line)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-[var(--ink)] mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              className="w-full px-4 py-2.5 text-sm border border-[var(--line)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-sm font-semibold text-white rounded-lg py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "var(--brand)" }}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-[11px] text-[var(--muted)] mt-6">
          Dashboard Monitoring Registrasi Mahasiswa v1.0.0
        </p>
      </div>
    </div>
  );
}
