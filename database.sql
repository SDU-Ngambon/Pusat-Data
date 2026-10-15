-- =============================================================================
-- SKEMA DATABASE POSTGRESQL (14+)
-- PUSAT DATA SEKOLAH (SCHOOL CORE DATA HUB) - SINGLE SOURCE OF TRUTH (SSOT)
-- SINKRONISASI KOSONG CONFLICT DENGAN APLIKASI PRESENSI SATELIT
-- =============================================================================

-- 1. Inisialisasi Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabel Profil & Identitas Sekolah
CREATE TABLE IF NOT EXISTS school_profile (
    npsn VARCHAR(20) PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    app_title VARCHAR(255) DEFAULT 'Pusat Data Sekolah',
    portal_tagline VARCHAR(255) DEFAULT 'SSOT Core Data Hub',
    theme_color VARCHAR(50) DEFAULT 'indigo', -- Pilihan tema warna: 'indigo', 'blue', 'rose', 'emerald', 'slate'
    address TEXT NOT NULL,
    headmaster_name VARCHAR(150) NOT NULL,
    headmaster_nip VARCHAR(30) NOT NULL,
    logo_url TEXT, -- Mendukung URL gambar online maupun direktori lokal (/uploads/branding/logo.png)
    favicon_url TEXT, -- Mendukung URL online maupun direktori lokal (/uploads/branding/favicon.ico)
    accreditation VARCHAR(50) DEFAULT 'A (Unggul)',
    telephone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(150),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Migrasi skema otomatis jika tabel sudah ada sebelumnya
ALTER TABLE school_profile ADD COLUMN IF NOT EXISTS theme_color VARCHAR(50) DEFAULT 'indigo';

-- 3. Tabel Rombongan Belajar (Academic Classes)
CREATE TABLE IF NOT EXISTS academic_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name VARCHAR(100) UNIQUE NOT NULL, -- Contoh: '10 TKR 1', '10 TP', '11 TITL 1'
    grade_level SMALLINT NOT NULL CHECK (grade_level IN (10, 11, 12)),
    department VARCHAR(50) NOT NULL, -- Contoh: 'TKR', 'TP', 'TITL', 'TKJ', 'APHP'
    homeroom_teacher_name VARCHAR(255) NULL,
    status VARCHAR(20) DEFAULT 'AKTIF',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Guru & Tendik (Teachers)
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nip VARCHAR(50) NULL, -- Permintaan khusus: NIP Non-PNS NULL atau '-'
    full_name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(30) NOT NULL, -- Format 08xx
    employment_status VARCHAR(20) DEFAULT 'Non-PNS' CHECK (employment_status IN ('PNS', 'PPPK', 'Non-PNS')),
    homeroom_class VARCHAR(100) NULL, -- Nama rombel binaan, misal: '11 TP'
    subject_specialization VARCHAR(150) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Partial Unique Index untuk NIP Guru (Mencegah bentrok jika NIP NULL / '-' / kosong)
CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_nip_unique ON teachers(nip) 
WHERE nip IS NOT NULL AND nip <> '-' AND nip <> '';

-- 5. Tabel Data Siswa (Students)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) UNIQUE NOT NULL, -- Indexed
    nis VARCHAR(25) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    gender CHAR(1) NOT NULL CHECK (gender IN ('L', 'P')),
    class_name VARCHAR(100) NOT NULL, -- Nama rombel riil, misal: '10 TKR 1', '11 TP'
    cohort_year VARCHAR(10) NOT NULL, -- Angkatan, misal: '2026'
    qr_code VARCHAR(100) UNIQUE NOT NULL, -- Nilai barcode/QR kartu presensi, default = nisn
    status VARCHAR(20) DEFAULT 'AKTIF' CHECK (status IN ('AKTIF', 'MUTASI', 'LULUS')),
    photo_url TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indeks untuk tabel siswa
CREATE INDEX IF NOT EXISTS idx_students_nisn ON students(nisn);
CREATE INDEX IF NOT EXISTS idx_students_qr_code ON students(qr_code);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_name);

-- 6. Tabel Mata Pelajaran (Subjects)
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(100) PRIMARY KEY, -- UUID atau ID string
    kode_mapel VARCHAR(50) UNIQUE NOT NULL, -- Contoh: 'BING', 'DPK TKJ', 'IPAS'
    nama_mapel VARCHAR(255) NOT NULL,
    kelompok VARCHAR(100) DEFAULT 'Kejuruan' CHECK (kelompok IN ('Kejuruan', 'Umum', 'Muatan Lokal')),
    keterangan TEXT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subjects_kode ON subjects(kode_mapel);

-- 7. Tabel Otentikasi Satelit (Api Clients) & Audit Trail
CREATE TABLE IF NOT EXISTS api_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(150) NOT NULL,
    api_key VARCHAR(100) UNIQUE NOT NULL, -- Bearer Token (sk_live_...)
    allowed_scopes TEXT[] NOT NULL,
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMPTZ,
    total_requests INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS api_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    client_id UUID REFERENCES api_clients(id) ON DELETE SET NULL,
    client_name VARCHAR(150) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INT NOT NULL,
    duration_ms INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    details TEXT
);

-- 8. Tabel Pengguna Admin Pusat Data (admin_users)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'SUPER_ADMIN',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_clients_key ON api_clients(api_key);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON api_access_logs(timestamp DESC);

-- =============================================================================
-- DATA SEED AWAL TERINTEGRASI APLIKASI PRESENSI
-- =============================================================================

INSERT INTO school_profile (npsn, school_name, address, headmaster_name, headmaster_nip, logo_url, favicon_url, accreditation, telephone, email, website)
VALUES (
    '20109988',
    'SMK Negeri 1 Indonesia Maju',
    'Jl. Merdeka Nusantara No. 45, Kompleks Edukasi Mandiri, Jakarta Timur 13420',
    'Drs. H. Bambang Sudarsono, M.Pd.',
    '196805121993031004',
    'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=64&auto=format&fit=crop&q=80',
    'A (Unggul)',
    '(021) 8899-7766',
    'info@smkn1indonesiamaju.sch.id',
    'https://smkn1indonesiamaju.sch.id'
) ON CONFLICT (npsn) DO NOTHING;

-- Seed Rombel
INSERT INTO academic_classes (class_name, grade_level, department, homeroom_teacher_name, status) VALUES
('10 TKR 1', 10, 'TKR', 'Agus Setiawan, S.Pd., M.T.', 'AKTIF'),
('10 TKR 2', 10, 'TKR', 'Siti Rahmawati, S.Pd.', 'AKTIF'),
('10 TITL 1', 10, 'TITL', 'Fajar Nugroho, S.T.', 'AKTIF'),
('10 TP 1', 10, 'TP', 'Budi Santoso, S.Pd., M.Eng.', 'AKTIF'),
('10 TKJ 1', 10, 'TKJ', 'Dewi Lestari, S.Kom.', 'AKTIF'),
('11 TKR 1', 11, 'TKR', 'Eko Prasetyo, S.Pd.', 'AKTIF'),
('11 TP', 11, 'TP', 'AANG HARYANTO, S.Pd.', 'AKTIF'),
('12 TKR 1', 12, 'TKR', 'Hendro Wicaksono, M.Pd.', 'AKTIF')
ON CONFLICT (class_name) DO NOTHING;

-- Seed Klien Satelit
INSERT INTO api_clients (client_name, api_key, allowed_scopes, status, description) VALUES
('Aplikasi Presensi Siswa (Mobile Fingerprint & QR)', 'sk_live_presensi_a89f2d4e1c7b89', ARRAY['read:students', 'read:teachers', 'read:classes', 'read:profile'], 'Aktif', 'Integrasi sistem presensi barcode/QR harian.'),
('Sistem E-Rapor Kurikulum Merdeka', 'sk_live_rapor_b74e1c9d2f8012', ARRAY['read:students', 'read:teachers', 'read:classes', 'read:subjects', 'read:profile'], 'Aktif', 'Penginputan nilai dan cetak rapor.'),
('Aplikasi CBT Ujian Berbasis Komputer', 'sk_live_cbt_c32a8f0b4d9176', ARRAY['read:students', 'read:classes', 'read:subjects'], 'Aktif', 'Asesmen sumatif terkomputerisasi.'),
('Aplikasi Perpustakaan Digital (Perpus)', 'sk_live_perpus_d55e710a9c4321', ARRAY['read:students', 'read:teachers'], 'Nonaktif', 'Sirkulasi peminjaman e-book.')
ON CONFLICT (api_key) DO NOTHING;

-- Seed Admin
INSERT INTO admin_users (username, password_hash, full_name, role) VALUES
('admin', 'admin123', 'Administrator Utama', 'SUPER_ADMIN')
ON CONFLICT (username) DO NOTHING;
