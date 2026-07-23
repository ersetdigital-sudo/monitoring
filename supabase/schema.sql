-- =============================================
-- Dashboard Monitoring Registrasi Mahasiswa
-- Supabase Schema
-- =============================================

-- Tabel riwayat upload file
CREATE TABLE IF NOT EXISTS uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_file TEXT NOT NULL,
  tanggal_upload TIMESTAMPTZ DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  total_rows INTEGER,
  valid_rows INTEGER,
  duplicate_rows INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel data per SALUT per upload
CREATE TABLE IF NOT EXISTS salut_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  nama_salut TEXT NOT NULL,
  total_admisi INTEGER NOT NULL DEFAULT 0,
  admisi_bayar INTEGER NOT NULL DEFAULT 0,
  admisi_belum_bayar INTEGER NOT NULL DEFAULT 0,
  dapat_nim INTEGER NOT NULL DEFAULT 0,
  belum_registrasi_mtk INTEGER NOT NULL DEFAULT 0,
  ongoing_belum_bayar INTEGER NOT NULL DEFAULT 0,
  ongoing_bayar INTEGER NOT NULL DEFAULT 0,
  ongoing_total INTEGER NOT NULL DEFAULT 0,
  total_bayar_akhir INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel profil pengguna
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nama TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_salut_data_upload_id ON salut_data(upload_id);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(status);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at DESC);

-- Trigger: auto-create user_profiles saat user baru signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, nama, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS (Row Level Security)
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE salut_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: semua user login bisa baca
CREATE POLICY "Authenticated users can read uploads"
  ON uploads FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read salut_data"
  ON salut_data FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- Policy: hanya admin bisa insert/update/delete
CREATE POLICY "Admins can insert uploads"
  ON uploads FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update uploads"
  ON uploads FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert salut_data"
  ON salut_data FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete salut_data"
  ON salut_data FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policy: admin bisa update profil semua user
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
