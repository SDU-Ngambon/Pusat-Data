# Desain macOS Aqua & Glassmorphism — Pusat Data Sekolah

Pembaruan menyeluruh antarmuka visual (UI/UX) pada aplikasi Pusat Data Sekolah dengan mengadopsi estetika modern **macOS Aqua** dan **Glassmorphism (Frosted Glass)** dengan tata letak **Bento Grid**, sambil mempertahankan 100% fungsionalitas, struktur database, hak akses admin, dan integrasi API Satelit yang sudah berjalan.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan desain berikut telah diselaraskan melalui sesi klarifikasi dan akan menjadi acuan utama implementasi:

- **Confirmed Decision 1 (Universal Glassmorphism)**: Efek kaca semi-transparan (*frosted glass*) dengan *backdrop-filter blur*, garis tepi halus berkilau (*subtle glossy border*), dan bayangan bertingkat (*soft ambient shadow*) diterapkan secara menyeluruh dan beradaptasi otomatis baik pada Light Mode maupun Dark Mode.
- **Confirmed Decision 2 (macOS Window Accents)**: Header jendela utama dan modal pop-up dilengkapi indikator tombol kontrol jendela khas macOS (tiga titik berwarna merah `#FF5F56`, kuning `#FFBD2E`, dan hijau `#27C93F`) untuk memperkuat kesan aplikasi desktop premium.
- **Confirmed Decision 3 (Bento Grid Layout)**: Ringkasan statistik sekolah disusun ulang menjadi Bento Grid asimetris yang rapi dengan kartu utama (*hero card*) untuk total siswa dan kartu multi-span untuk guru, rombel/kelas, mata pelajaran, serta satelit API terintegrasi.
- **Strict Invariance**: Seluruh alur data, CRUD, import Excel/CSV, upload file lokal (logo & favicon), token auth, dan endpoint satelit tidak diubah logikanya.

---

## 1. Overview & Core Concept

- **Apa yang Dibangun**: Transformasi visual antarmuka sistem repositori dan pusat data sekolah menjadi antarmuka desktop-class yang elegan, memadukan kejernihan *frosted glass* macOS Aqua, kontras tipografi tinggi, dan kerapian Bento Grid.
- **Target Pengguna**: Operator data sekolah, administrator kurikulum/kesiswaan, dan pengembang sistem satelit sekolah.
- **Nilai Utama**: Meningkatkan kenyamanan visual saat memantau data dalam durasi lama, menyajikan informasi kunci secara hierarkis tanpa kelelahan mata (*visual fatigue*), serta mempertahankan kepatuhan WCAG AA pada keterbacaan teks di semua kondisi kontras.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Navigasi Dashboard & Bento Grid**: Pengguna membuka dashboard dan langsung melihat metrik utama dalam Bento Grid transparan dengan efek sorot halus (*subtle hover elevation*), grafik tren akses API bergradasi lembut, serta status sinkronisasi satelit.
2. **Eksplorasi Master Data**: Tabel Siswa, Guru, Kelas, dan Mapel dibalut dalam panel kaca putih/gelap bergradasi tipis dengan baris data bergaris batas mikro (`border-b border-white/10` atau `border-slate-200/60`), efek hover baris yang lembut, serta tombol aksi bertema Aqua.
3. **Pengaturan Tampilan & Tema**: Pengguna dapat beralih antara Light Mode dan Dark Mode melalui toggle di header/sidebar, di mana seluruh komponen kaca secara instan menyesuaikan opacity, blur, dan kontras warna teks.
4. **Modal Interaktif (Import, Barcode, Kredensial)**: Seluruh pop-up menggunakan latar belakang backdrop buram gelap dan kartu modal melayang dengan efek kaca berkilau di tepiannya.

### Visual Identity & Theme Tokens
- **Aesthetic Direction**: *macOS Sonoma Aqua & Frosted Glassmorphism*.
- **Backdrop Atmosphere**:
  - *Light Mode*: Latar belakang viewport abu-abu kebiruan lembut (`#EBF1F6` / `bg-slate-100`) dengan panel kaca putih semi-transparan (`bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-900/5`).
  - *Dark Mode*: Latar belakang gradasi malam (`#0B0F19` hingga `#111827`) dengan panel kaca gelap semi-transparan (`bg-slate-900/75 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/40`).
- **Typography & Scale**:
  - Menggunakan font sistem modern berkarakter tinggi (*Plus Jakarta Sans* / *Inter System Font Stack*).
  - Teks data numerik dan kode menggunakan *tabular numerals* monospaced (`font-mono tabular-nums`) untuk konsistensi vertikal.
  - Teks Light Mode: `text-slate-900` (utama), `text-slate-700` (sekunder), `text-slate-500` (tersier).
  - Teks Dark Mode: `text-white` (utama), `text-slate-200` (sekunder), `text-slate-400` (tersier).
- **macOS Window Elements**:
  - Tiga titik kontrol jendela (*traffic lights*) di kiri atas: Merah (Tutup), Kuning (Minimize), Hijau (Expand) dengan efek kilau border mikro.
  - Header *segmented bar* bergaya bilah kontrol macOS Aqua.
- **Sidebar Kaca Responsif**:
  - Sidebar semi-transparan (`bg-slate-900/85 backdrop-blur-2xl` atau `bg-slate-900/90`).
  - Tombol buka-tutup (collapse) di sisi atas/tepi dengan transisi lebar animasi halus (`transition-all duration-300 ease-in-out`).
  - Status tertutup menyajikan ikon-ikon menu yang berjejer rapi di tengah tanpa tabrakan dengan logo.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: CSS Backdrop-Filter vs Static Opacity**
  - *Chosen Approach*: Memanfaatkan kelas Tailwind CSS `backdrop-blur-md` hingga `backdrop-blur-xl` yang didukung browser modern dengan fallback warna padat semi-transparan untuk browser tanpa dukungan filter.
  - *Why*: Menghasilkan kedalaman ruang optik 3D yang otentik khas macOS tanpa beban render komputasi berlebih.
- **Decision 2: Universal Adaptive Glass vs Separate Isolated Theme**
  - *Chosen Approach*: Menjadikan Glassmorphism sebagai pondasi visual universal di mana komponen bereaksi dinamis terhadap mode terang/gelap serta warna aksen sekolah (*Indigo, Blue, Rose, Emerald, Slate*).
  - *Why*: Konsisten di semua menu aplikasi tanpa menduplikasi komponen terpisah.
- **Decision 3: Bento Grid Layout Optimization**
  - *Chosen Approach*: Menempatkan metrik Siswa sebagai kartu unggulan (hero span 2 kolom) diiringi kartu Guru, Rombel, dan Mata Pelajaran dengan tata letak simetris 4-kolom responsif.
  - *Why*: Siswa merupakan entitas inti sekolah yang paling sering dipantau perkembangannya oleh administrator.

---

## 4. Technical Architecture & Data Strategy

### Visual System & Component Hierarchy
```
┌────────────────────────────────────────────────────────────────────────┐
│ macOS Window Frame (Rounded 3xl, Frosted Sheen Border, Soft Shadow)   │
├────────────────────────────────────────────────────────────────────────┤
│ Header: [● ● ● macOS Traffic Lights]  [https://pusatdata...] [Admin]  │
├───────────────────┬────────────────────────────────────────────────────┤
│ Frosted Sidebar   │ Main Glass Canvas (backdrop-blur-xl, border-white) │
│ ───────────────── │ ────────────────────────────────────────────────── │
│ [Logo] [Toggle]   │ ┌────────────────────────────────────────────────┐ │
│                   │ │ Bento Grid:                                    │ │
│ • Dashboard       │ │ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │ │
│ • Profil Sekolah  │ │ │ Total Siswa  │ │ Total Guru   │ │ Rombel   │ │ │
│ • Data Siswa      │ │ │ (Hero Card)  │ │ (Span Card)  │ │ (Card)   │ │ │
│ • Data Guru       │ │ └──────────────┘ └──────────────┘ └──────────┘ │ │
│ • Data Mapel      │ │ ┌───────────────────────────┐ ┌──────────────┐ │ │
│ • Data Kelas      │ │ │ Grafik API Activity (SVG) │ │ Satelit Aktif│ │ │
│ • Klien Satelit   │ │ └───────────────────────────┘ └──────────────┘ │ │
│ • Dokumentasi API │ └────────────────────────────────────────────────┘ │
│ • Log Akses       │ │ Glass Data Table Container (Hover Rows, Badges)│ │
│ • Pengaturan      │ └────────────────────────────────────────────────┘ │
└───────────────────┴────────────────────────────────────────────────────┘
```

### Interactive Component & State Mapping
- **App.tsx**: Mengatur pembungkus utama jendela macOS, status tema (dark/light), toggle collapse sidebar, dan penanganan global toast.
- **Sidebar.tsx**: Navigasi vertikal dengan transisi halus, badge data aktif, dan penataan tombol chevron toggle modern di bagian atas.
- **Navbar.tsx**: Header jendela macOS dengan tombol traffic light, URL bar terproteksi, profil akun, dan status sinkronisasi.
- **DashboardView.tsx**: Penataan ulang Bento Grid statistik sekolah, kartu grafik aktivitas API terpusat, dan tabel log akses satelit dengan efek sorot hover.
- **StudentsView / TeachersView / SubjectsView / ClassesView**: Pembaruan baris tabel semi-transparan, pagination kaca, dan penegasan kontras teks agar selalu tajam dan mudah dibaca.
- **Modals (Barcode, Excel/Csv Import, Account Settings)**: Tampilan dialog kaca melayang dengan backdrop blur gelap dan border berkilau tipis.

---

## Verification Plan
1. **Lint & Static Check**: Jalankan `lint_applet` untuk memastikan tidak ada kesalahan sintaksis atau properti CSS yang tidak valid.
2. **Build & Compilation**: Jalankan `compile_applet` untuk memverifikasi proses build Vite dan TypeScript berhasil 100%.
3. **Responsive & Contrast Verification**: Memastikan keterbacaan teks di seluruh tabel (Siswa, Guru, Mapel) berkontras tajam di Light Mode dan Dark Mode.
