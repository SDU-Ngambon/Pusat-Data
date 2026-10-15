import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  Layers,
  BookOpen,
  KeyRound,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Terminal,
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  HelpCircle,
  Filter,
  Plus,
  TrendingUp,
  Server,
  Zap,
  Sparkles,
  School,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { ApiAccessLog, SchoolProfile, ActiveTab } from '../types/index.js';

interface DashboardProps {
  overview: {
    profile: SchoolProfile;
    counts: {
      total_students: number;
      students_by_status: { aktif: number; lulus: number; pindah: number };
      total_teachers: number;
      teachers_by_employment: { pns: number; pppk: number; non_pns: number };
      total_classes: number;
      total_subjects: number;
      total_clients: number;
      clients_active: number;
    };
    recent_logs: ApiAccessLog[];
  } | null;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenTester: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({
  overview,
  setActiveTab,
  onOpenTester,
}) => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(4); // default April

  if (!overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">Memuat data dashboard Bento...</p>
      </div>
    );
  }

  const { counts, recent_logs, profile } = overview;

  // Chart data for API trend (12 months)
  const trendData = [
    { month: 'Jan', value: 9 },
    { month: 'Feb', value: 12 },
    { month: 'Mar', value: 11 },
    { month: 'Apr', value: 17, highlighted: true },
    { month: 'May', value: 16 },
    { month: 'Jun', value: 14 },
    { month: 'Jul', value: 18 },
    { month: 'Aug', value: 15 },
    { month: 'Sep', value: 17 },
    { month: 'Oct', value: 16 },
    { month: 'Nov', value: 19 },
    { month: 'Dec', value: 22 },
  ];

  const maxVal = 25;
  const chartWidth = 500;
  const chartHeight = 110;
  const points = trendData.map((d, i) => {
    const x = (i / (trendData.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (d.value / maxVal) * (chartHeight - 30) - 10;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/70 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 mb-1 font-bold">
            <span className="font-extrabold text-slate-900 dark:text-slate-200">Pusat Data Sekolah</span>
            <span>/</span>
            <span className="text-blue-600 dark:text-cyan-400 font-bold">Bento Dashboard SSOT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
            Dashboard Eksekutif
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/35">
              Live SSOT
            </span>
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
            Single Source of Truth (SSOT) data referensi akademik dan portal integrasi API aplikasi satelit sekolah.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={onOpenTester}
            className="px-4 py-2 bg-white/75 hover:bg-white dark:bg-slate-800/75 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-white/80 dark:border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Dokumentasi API</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>Klien Satelit Baru</span>
          </button>
        </div>
      </div>

      {/* BENTO GRID ROW 1: Hero Identity Card & System Health Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* BENTO HERO CARD (Spans 8 columns) */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-3xl p-6 sm:p-7 backdrop-blur-2xl bg-white/55 dark:bg-slate-800/55 border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-5px_rgba(31,38,135,0.08)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.4)] flex flex-col justify-between group">
          {/* Subtle Ambient Background Aura */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-br from-blue-500/20 via-sky-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-gradient-to-tr from-cyan-500/15 via-blue-500/15 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/25 shrink-0">
                  <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                    {profile?.logo_url ? (
                      <img
                        src={profile.logo_url}
                        alt="Logo Sekolah"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <School className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                      {profile?.school_name || 'SMK Negeri 1 Indonesia'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/35">
                      {profile?.accreditation || 'Akreditasi A Unggul'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-semibold">
                    NPSN: <span className="font-mono font-bold text-slate-950 dark:text-white">{profile?.npsn || '20109988'}</span> • Kepala Sekolah: <span className="font-bold text-slate-950 dark:text-white">{profile?.headmaster_name || 'Drs. H. Mulyadi, M.Pd'}</span>
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5 self-start">
                <span className="px-3 py-1 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-white/80 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-slate-200 font-mono shadow-xs">
                  T.A. 2026/2027
                </span>
              </div>
            </div>

            {/* Quick Hero Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div
                onClick={() => setActiveTab('students')}
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/90 border border-white/80 dark:border-white/10 transition-all cursor-pointer shadow-xs group/stat"
              >
                <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 mb-1">
                  <span className="text-xs font-extrabold tracking-wide">Total Siswa</span>
                  <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover/stat:scale-110 transition-transform" />
                </div>
                <div className="text-3xl font-black text-slate-950 dark:text-white font-mono tracking-tight">
                  {counts.total_students}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {counts.students_by_status.aktif} Aktif
                </div>
              </div>

              <div
                onClick={() => setActiveTab('teachers')}
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/90 border border-white/80 dark:border-white/10 transition-all cursor-pointer shadow-xs group/stat"
              >
                <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 mb-1">
                  <span className="text-xs font-extrabold tracking-wide">Guru & Tendik</span>
                  <Users className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover/stat:scale-110 transition-transform" />
                </div>
                <div className="text-3xl font-black text-slate-950 dark:text-white font-mono tracking-tight">
                  {counts.total_teachers}
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-bold mt-0.5">
                  {counts.teachers_by_employment.pns} PNS • {counts.teachers_by_employment.pppk} PPPK
                </div>
              </div>

              <div
                onClick={() => setActiveTab('classes')}
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/90 border border-white/80 dark:border-white/10 transition-all cursor-pointer shadow-xs group/stat"
              >
                <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 mb-1">
                  <span className="text-xs font-extrabold tracking-wide">Rombel Aktif</span>
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover/stat:scale-110 transition-transform" />
                </div>
                <div className="text-3xl font-black text-slate-950 dark:text-white font-mono tracking-tight">
                  {counts.total_classes}
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-bold mt-0.5">
                  Tingkat X, XI & XII
                </div>
              </div>

              <div
                onClick={() => setActiveTab('subjects')}
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/90 border border-white/80 dark:border-white/10 transition-all cursor-pointer shadow-xs group/stat"
              >
                <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 mb-1">
                  <span className="text-xs font-extrabold tracking-wide">Mata Pelajaran</span>
                  <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover/stat:scale-110 transition-transform" />
                </div>
                <div className="text-3xl font-black text-slate-950 dark:text-white font-mono tracking-tight">
                  {counts.total_subjects}
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-bold mt-0.5">
                  Kurikulum Merdeka
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Banner inside Hero */}
          <div className="relative z-10 mt-5 pt-3 border-t border-white/70 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-800 dark:text-slate-300 font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gateway Sinkronisasi SSOT: Seluruh modul satelit menerima payload resmi terverifikasi.</span>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-blue-700 dark:text-cyan-400 hover:underline font-extrabold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Kelola Profil Lengkap</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* BENTO SYSTEM HEALTH CARD (Spans 4 columns) */}
        <div className="lg:col-span-4 rounded-3xl p-6 sm:p-7 backdrop-blur-2xl bg-white/55 dark:bg-slate-800/55 border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-5px_rgba(31,38,135,0.08)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.4)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/70 dark:border-white/10">
              <div>
                <h3 className="font-black text-slate-950 dark:text-white text-sm">Status Pusat Data</h3>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">Integritas API & Keamanan</p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/35 text-[11px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                99.9% Uptime
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-white/10 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-950 dark:text-white">Klien Satelit Terhubung</div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">Autentikasi Token Bearer</div>
                  </div>
                </div>
                <span className="font-black font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                  {counts.clients_active}/{counts.total_clients} Aktif
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-white/10 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-950 dark:text-white">Rerata Respons Endpoint</div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">Latensi Query SQLite</div>
                  </div>
                </div>
                <span className="font-black font-mono text-slate-950 dark:text-white text-sm">
                  ~12 ms
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-white/10 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-950 dark:text-white">Hak Akses Role</div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">Granular Scopes Guard</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30">
                  Enforced
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-white/70 dark:border-white/10 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">Protokol Keamanan: Bearer REST</span>
            <button
              onClick={() => setActiveTab('clients')}
              className="text-blue-700 dark:text-cyan-400 font-extrabold hover:underline cursor-pointer"
            >
              Kelola Klien &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* BENTO GRID ROW 2: Traffic Trend Chart & Synchronization Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bento Traffic Chart (Spans 7 columns) */}
        <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 backdrop-blur-2xl bg-white/55 dark:bg-slate-800/55 border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-5px_rgba(31,38,135,0.08)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.4)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/70 dark:border-white/10 mb-4">
              <div>
                <h3 className="font-black text-slate-950 dark:text-white text-sm">Tren Permintaan Akses API Satelit</h3>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">Total hit endpoint sinkronisasi per bulan (ribu request)</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-white/80 dark:bg-slate-900/70 border border-white/80 dark:border-white/10 rounded-xl text-xs font-extrabold text-slate-900 dark:text-slate-200 font-mono shadow-xs">
                  {selectedYear}
                </span>
                <span className="px-2.5 py-1 bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/35 rounded-xl text-xs font-extrabold font-mono flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  1.2K+ Hits/hari
                </span>
              </div>
            </div>

            {/* Line Chart Area (SVG) with Glassmorphism */}
            <div className="relative p-4 pt-6 bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-white/80 dark:border-white/10 shadow-xs">
              {/* Tooltip on highlighted point */}
              {hoveredPoint !== null && points[hoveredPoint] && (
                <div
                  style={{
                    left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
                    top: `${points[hoveredPoint].y - 30}px`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-full backdrop-blur-2xl bg-slate-950 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-lg whitespace-nowrap z-20 pointer-events-none border border-white/20"
                >
                  {points[hoveredPoint].value}K Permintaan
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950" />
                </div>
              )}

              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-32 overflow-visible"
              >
                <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2={chartWidth} y2="50" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2={chartWidth} y2="80" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" strokeDasharray="3 3" />

                <path
                  d={pathD}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {points.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint === i ? 5.5 : 3.5}
                    fill={hoveredPoint === i ? '#1D4ED8' : '#FFFFFF'}
                    stroke="#1D4ED8"
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all hover:scale-125"
                    onMouseEnter={() => setHoveredPoint(i)}
                  />
                ))}
              </svg>

              {/* Month Labels below */}
              <div className="flex justify-between text-[11px] text-slate-700 dark:text-slate-300 font-extrabold px-2 mt-2">
                {trendData.map((d, i) => (
                  <span
                    key={i}
                    className={`cursor-pointer transition-colors ${
                      hoveredPoint === i ? 'text-blue-600 dark:text-cyan-400 font-black' : ''
                    }`}
                    onMouseEnter={() => setHoveredPoint(i)}
                  >
                    {d.month}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-white/70 dark:border-white/10 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
            <span>Rerata beban puncak: Jam 07:00 - 15:30 WIB</span>
            <button
              onClick={onOpenTester}
              className="text-blue-700 dark:text-cyan-400 font-extrabold hover:underline cursor-pointer"
            >
              Uji Playground API &rarr;
            </button>
          </div>
        </div>

        {/* Bento Module Sync Progress (Spans 5 columns) */}
        <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 backdrop-blur-2xl bg-white/55 dark:bg-slate-800/55 border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-5px_rgba(31,38,135,0.08)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.4)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/70 dark:border-white/10 mb-4">
              <div>
                <h3 className="font-black text-slate-950 dark:text-white text-sm">Kelengkapan Sinkronisasi Modul</h3>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">Validitas integritas data master SSOT</p>
              </div>
              <span className="text-[11px] font-mono font-black text-blue-700 dark:text-cyan-400 bg-blue-500/15 px-2.5 py-0.5 rounded-lg border border-blue-500/30">
                100% Siap
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-white/10 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-950 dark:text-white">
                    Katalog Siswa & Barcode QR Code
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-black">100%</span>
                </div>
                <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-white/10 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-950 dark:text-white">
                    Pemetaan Wali Kelas & Rombel
                  </span>
                  <span className="text-blue-700 dark:text-blue-400 font-mono text-[11px] font-black">94%</span>
                </div>
                <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-sky-400 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-white/10 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-950 dark:text-white">
                    Validasi NIP Guru & Alokasi Mapel
                  </span>
                  <span className="text-purple-700 dark:text-purple-400 font-mono text-[11px] font-black">90%</span>
                </div>
                <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-400 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-white/10 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-950 dark:text-white">
                    Otorisasi Klien API Satelit (Bearer)
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-black">100%</span>
                </div>
                <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-white/70 dark:border-white/10 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Standar RESTful Protocol v1</span>
            <button
              onClick={() => setActiveTab('classes')}
              className="text-blue-700 dark:text-cyan-400 font-extrabold hover:underline cursor-pointer"
            >
              Lihat Rombel &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* BENTO GRID ROW 3: Recent Activity Log Table with Layered Glassmorphism */}
      <div className="rounded-3xl p-6 sm:p-7 backdrop-blur-2xl bg-white/55 dark:bg-slate-800/55 border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-5px_rgba(31,38,135,0.08)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/70 dark:border-white/10 mb-4">
          <div>
            <h3 className="font-black text-slate-950 dark:text-white text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              Log Akses Satelit Terbaru
            </h3>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
              Audit trail transaksi permintaan data terakhir dari modul satelit
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className="px-3.5 py-1.5 bg-white/80 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-white/80 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Lihat Semua Log Audit</span>
          </button>
        </div>

        {/* Layered Frosted Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/80 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/75 dark:bg-slate-800/75 border-b border-white/80 dark:border-white/10 text-slate-800 dark:text-slate-200 font-black uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Klien Satelit</th>
                <th className="py-3.5 px-4">Endpoint</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Durasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60 dark:divide-white/5 text-slate-800 dark:text-slate-200 text-xs font-medium">
              {recent_logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-600 dark:text-slate-400 font-bold">
                    Belum ada log akses satelit yang tercatat.
                  </td>
                </tr>
              ) : (
                recent_logs.slice(0, 5).map((log, idx) => {
                  const isOk = log.status_code >= 200 && log.status_code < 300;
                  return (
                    <tr
                      key={log.id || idx}
                      className="hover:bg-blue-500/10 dark:hover:bg-cyan-400/10 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-950 dark:text-white truncate max-w-[180px]">
                          {log.client_name}
                        </div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold">
                          {log.ip_address}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-200/90 dark:bg-slate-800 text-slate-900 dark:text-slate-100 mr-1.5 text-[10px] font-black">
                          {log.method}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[200px] inline-block align-middle">
                          {log.endpoint}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono ${
                            isOk
                              ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {log.status_code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300 text-[11px] font-mono font-bold whitespace-nowrap">
                        {log.duration_ms !== undefined ? `${log.duration_ms} ms` : '10 min ago'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
