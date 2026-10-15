import React, { useState } from 'react';
import {
  Database,
  Archive,
  Download,
  FileCode2,
  RotateCcw,
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { SchoolProfile, AcademicClass, Student, Teacher, Subject, ApiClient, ApiAccessLog } from '../types/index.js';

interface DatabaseViewProps {
  profile: SchoolProfile | null;
  classes: AcademicClass[];
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  clients: ApiClient[];
  logs: ApiAccessLog[];
  onBackupFull: () => void;
  onResetDatabase: () => Promise<void>;
  onRestoreDatabase?: (fileContent: any) => Promise<void>;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  profile,
  classes,
  students,
  teachers,
  subjects,
  clients,
  logs,
  onBackupFull,
  onResetDatabase,
  onRestoreDatabase,
}) => {
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const totalRecords =
    students.length +
    teachers.length +
    subjects.length +
    classes.length +
    clients.length +
    logs.length +
    1; // school_profile

  const handleResetClick = async () => {
    setResetting(true);
    try {
      await onResetDatabase();
      setShowResetConfirm(false);
    } finally {
      setResetting(false);
    }
  };

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (onRestoreDatabase) {
        await onRestoreDatabase(parsed);
      }
    } catch (err: any) {
      alert('Gagal membaca file JSON backup: ' + err.message);
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60 dark:border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Manajemen & Pemeliharaan Database
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pusat kendali cadangan data (Full Backup JSON), skema DDL PostgreSQL (<code className="font-mono text-indigo-600 dark:text-indigo-400">database.sql</code>), dan status tabel SSOT.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-white/60 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 font-mono self-start sm:self-auto shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Total: <strong className="text-slate-900 dark:text-white">{totalRecords} baris</strong></span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Backup Full Aplikasi (Large Bento Card) */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/70 hover:bg-white/90 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border border-white/80 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:border-blue-400/50 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-700 dark:text-cyan-300 flex items-center justify-center border border-sky-500/30">
                <Archive className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-500/15 text-sky-800 dark:text-cyan-300 border border-sky-500/30 text-xs font-mono font-bold">
                Format: JSON Standar
              </span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                Backup Full Aplikasi
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                Mengekspor seluruh entitas database secara komprehensif (Profil Sekolah, Data Siswa, Guru & Tendik, Mata Pelajaran, Rombel, Klien Satelit, Log Akses API, dan Akun Admin) ke dalam file arsip JSON portabel.
              </p>
            </div>

            {/* Quick table chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-white/80 dark:border-white/10 text-[11px] text-slate-800 dark:text-slate-200 font-mono font-bold shadow-2xs">
                students ({students.length})
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-white/80 dark:border-white/10 text-[11px] text-slate-800 dark:text-slate-200 font-mono font-bold shadow-2xs">
                teachers ({teachers.length})
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-white/80 dark:border-white/10 text-[11px] text-slate-800 dark:text-slate-200 font-mono font-bold shadow-2xs">
                classes ({classes.length})
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-white/80 dark:border-white/10 text-[11px] text-slate-800 dark:text-slate-200 font-mono font-bold shadow-2xs">
                subjects ({subjects.length})
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-white/80 dark:border-white/10 text-[11px] text-slate-800 dark:text-slate-200 font-mono font-bold shadow-2xs">
                api_clients ({clients.length})
              </span>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-white/70 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-start sm:self-auto font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Snapshot Real-time</span>
            </span>

            <button
              type="button"
              onClick={onBackupFull}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer border border-white/20"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Backup Full (.json)</span>
            </button>
          </div>
        </div>

        {/* Card 2: Download database.sql (Bento Card) */}
        <div className="backdrop-blur-xl bg-white/70 hover:bg-white/90 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border border-white/80 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:border-blue-400/50 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-500/30">
                <FileCode2 className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30 text-xs font-mono font-bold">
                PostgreSQL 14+
              </span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                Skema SQL (DDL & Seed)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                Unduh file skrip SQL relasional lengkap yang siap dieksekusi di database server produksi (Supabase, Neon, Cloud SQL, atau Docker PostgreSQL).
              </p>
            </div>

            <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 pt-1 font-medium">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span>Tabel Relasional & Foreign Keys</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span>Partial Index Unique NIP</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span>Data Seed Master & Satelit Klien</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-4 border-t border-white/70 dark:border-white/10">
            <a
              href="/database.sql"
              download="database.sql"
              className="w-full py-2.5 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-white/80 dark:border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Unduh database.sql</span>
            </a>
          </div>
        </div>

        {/* Card 3: Restore Database JSON */}
        <div className="backdrop-blur-xl bg-white/70 hover:bg-white/90 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border border-white/80 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:border-emerald-400/50 transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Restore Database
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                Pulihkan seluruh isi database sekolah dari berkas JSON arsip hasil backup sebelumnya secara instan.
              </p>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-white/70 dark:border-white/10">
            <label className="w-full py-2.5 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-white/80 dark:border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{restoring ? 'Memulihkan Data...' : 'Pilih File JSON Restore'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                disabled={restoring}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Card 4: Reset ke Seed Awal */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/70 hover:bg-white/90 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border border-white/80 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:border-amber-400/50 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-500/30">
                <RotateCcw className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold">
                Zona Pemeliharaan
              </span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Reset Database ke Seed Awal
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                Mengembalikan seluruh data referensi sekolah ke konfigurasi benih awal bawaan sistem (termasuk 23 siswa, 10 guru & tendik, 11 rombel, dan 4 klien satelit).
              </p>
            </div>

            {showResetConfirm && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 space-y-2 font-medium">
                <div className="flex items-center gap-2 font-extrabold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Konfirmasi Tindakan Berbahaya</span>
                </div>
                <p>
                  Seluruh perubahan data yang belum di-backup akan dihapus secara permanen. Apakah Anda yakin ingin melanjutkan reset?
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleResetClick}
                    disabled={resetting}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    {resetting ? 'Mereset Database...' : 'Ya, Reset Sekarang'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 bg-white/80 dark:bg-slate-800 border border-white/80 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Batalkan
                  </button>
                </div>
              </div>
            )}
          </div>

          {!showResetConfirm && (
            <div className="pt-6 mt-4 border-t border-white/70 dark:border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-white/80 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Data Awal Pabrik</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
