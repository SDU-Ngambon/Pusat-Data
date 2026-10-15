import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  QrCode,
  FileSpreadsheet,
  X,
  Phone,
} from 'lucide-react';
import { Student, AcademicClass, StudentStatus, Gender } from '../types/index.js';
import { ExcelImportModal } from './ExcelImportModal.js';
import { BarcodeModal } from './BarcodeModal.js';
import { excelHelper } from '../utils/excelHelper.js';

interface StudentsViewProps {
  students: Student[];
  classes: AcademicClass[];
  schoolName: string;
  onCreate: (data: Omit<Student, 'id' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Student>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBulkImport: (items: any[]) => Promise<{ imported_count: number; failed_count: number; errors: string[] }>;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  classes,
  schoolName,
  onCreate,
  onUpdate,
  onDelete,
  onBulkImport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cohortFilter, setCohortFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedStudentForBarcode, setSelectedStudentForBarcode] = useState<Student | null>(null);

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<{
    nisn: string;
    nis: string;
    full_name: string;
    gender: Gender;
    class_name: string;
    cohort_year: string;
    qr_code: string;
    status: StudentStatus;
    birth_place: string;
    birth_date: string;
    parent_phone: string;
  }>({
    nisn: '',
    nis: '',
    full_name: '',
    gender: 'L',
    class_name: classes[0]?.class_name || '10 TKR 1',
    cohort_year: '2026',
    qr_code: '',
    status: 'AKTIF',
    birth_place: '',
    birth_date: '',
    parent_phone: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Available cohorts list
  const cohorts = Array.from(new Set(students.map((s) => s.cohort_year))).sort().reverse();

  // Filter students
  const filtered = students.filter((s) => {
    const q = (searchTerm || '').toLowerCase();
    const name = (s.full_name || '').toLowerCase();
    const nisn = s.nisn || '';
    const nis = s.nis || '';
    const qr = (s.qr_code || '').toLowerCase();
    const matchesSearch =
      name.includes(q) ||
      nisn.includes(q) ||
      nis.includes(q) ||
      qr.includes(q);

    const matchesClass = classFilter === 'all' || s.class_name === classFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesCohort = cohortFilter === 'all' || s.cohort_year === cohortFilter;

    return matchesSearch && matchesClass && matchesStatus && matchesCohort;
  });

  const handleOpenCreate = () => {
    setEditingStudent(null);
    const randomNis = Math.floor(10000 + Math.random() * 90000).toString();
    const randomNisn = '00' + Math.floor(10000000 + Math.random() * 90000000).toString();
    setFormData({
      nisn: randomNisn,
      nis: randomNis,
      full_name: '',
      gender: 'L',
      class_name: classes[0]?.class_name || '10 TKR 1',
      cohort_year: '2026',
      qr_code: `PDS-${randomNisn}`,
      status: 'AKTIF',
      birth_place: 'Jakarta',
      birth_date: '2008-05-12',
      parent_phone: '0812' + Math.floor(10000000 + Math.random() * 90000000).toString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nisn: student.nisn,
      nis: student.nis,
      full_name: student.full_name,
      gender: student.gender,
      class_name: student.class_name,
      cohort_year: student.cohort_year,
      qr_code: student.qr_code,
      status: student.status,
      birth_place: student.birth_place || '',
      birth_date: student.birth_date || '',
      parent_phone: student.parent_phone || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStudent) {
        await onUpdate(editingStudent.id, formData);
      } else {
        await onCreate(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus data siswa "${name}"?`)) {
      try {
        await onDelete(id);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus siswa');
      }
    }
  };

  const handleDownloadTemplate = () => {
    excelHelper.generateStudentTemplate();
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((s) => ({
      NISN: s.nisn,
      NIS: s.nis,
      'Nama Lengkap': s.full_name,
      'Jenis Kelamin (L/P)': s.gender,
      'Rombel / Kelas': s.class_name,
      Angkatan: s.cohort_year,
      'Barcode / Nomor Kartu': s.qr_code,
      Status: s.status,
    }));
    excelHelper.exportToExcel(exportData, 'Data_Siswa_Pusat_Data_Sekolah', 'Siswa');
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60 dark:border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Master Data Siswa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola data siswa terpusat (NISN, NIS, Rombel, Barcode Presensi, Status).
          </p>
        </div>

        {/* Action Buttons: High contrast */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 bg-white/70 hover:bg-white dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-white/70 dark:border-white/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="Unduh Template Excel .XLSX"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Template Excel</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-white/70 hover:bg-white dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-white/70 dark:border-white/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="Import File Excel (.xlsx)"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-white/70 hover:bg-white dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-white/70 dark:border-white/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="Ekspor Data Siswa Terfilter ke Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all ml-auto sm:ml-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Unified Search & Filters Bar */}
      <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 border border-white/70 dark:border-white/10 p-3 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NISN, NIS, QR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 bg-white/70 dark:bg-slate-900/70 border border-white/70 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-10 px-3 bg-white/70 dark:bg-slate-900/70 border border-white/70 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all cursor-pointer"
          >
            <option value="all">Semua Rombel</option>
            {classes.map((c) => (
              <option key={c.id} value={c.class_name}>
                {c.class_name} ({c.department})
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="AKTIF">AKTIF</option>
            <option value="MUTASI">MUTASI</option>
            <option value="LULUS">LULUS</option>
          </select>

          <select
            value={cohortFilter}
            onChange={(e) => setCohortFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all cursor-pointer"
          >
            <option value="all">Semua Angkatan</option>
            {cohorts.map((c) => (
              <option key={c} value={c}>
                Angkatan {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Summary Meta Bar */}
      <div className="px-1 flex items-center justify-between text-xs text-slate-400">
        <span>
          Menampilkan <strong className="text-slate-700 font-semibold">{filtered.length}</strong> dari{' '}
          <strong className="text-slate-700 font-semibold">{students.length}</strong> siswa terdaftar
        </span>
        <span className="text-[11px] text-slate-400">Kartu Presensi & QR Code Siswa</span>
      </div>

      {/* Frosted Glass Table */}
      <div className="overflow-x-auto backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-white/70 dark:border-white/10 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/75 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-b border-white/60 dark:border-white/10 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Identitas Siswa</th>
              <th className="py-3.5 px-4">NISN / NIS</th>
              <th className="py-3.5 px-4">Rombel & Angkatan</th>
              <th className="py-3.5 px-4">Barcode Presensi</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/60 dark:divide-white/5 text-slate-800 dark:text-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                  Tidak ada data siswa yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{s.full_name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1 font-medium">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-full px-2 py-0.5 text-[10px] border border-slate-200 dark:border-slate-600">
                        {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                      {s.parent_phone && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">WA: {s.parent_phone}</span>
                        </>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-xs">
                    <div className="text-slate-900 dark:text-white font-bold tracking-wide">{s.nisn}</div>
                    <div className="text-slate-500 dark:text-slate-400 font-medium text-[11px] mt-0.5">NIS: {s.nis}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-semibold rounded-full px-2.5 py-0.5 text-xs inline-flex items-center">
                        {s.class_name}
                      </span>
                      <span className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-semibold rounded-full px-2.5 py-0.5 text-xs inline-flex items-center">
                        Angkatan {s.cohort_year}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-full px-2.5 py-0.5 text-xs inline-flex items-center border border-slate-300 dark:border-slate-600">
                        {s.qr_code}
                      </span>
                      <button
                        onClick={() => setSelectedStudentForBarcode(s)}
                        className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-white/60 dark:border-white/10"
                        title="Lihat / Cetak Kartu Barcode"
                      >
                        <QrCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold rounded-full px-2.5 py-0.5 text-xs inline-flex items-center gap-1.5 ${
                        s.status === 'AKTIF'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : s.status === 'MUTASI'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          s.status === 'AKTIF'
                            ? 'bg-emerald-600'
                            : s.status === 'MUTASI'
                            ? 'bg-amber-600'
                            : 'bg-slate-500'
                        }`}
                      />
                      {s.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
                        title="Edit Siswa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.full_name)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer border border-rose-200"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah / Edit Siswa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-white/95 dark:bg-slate-800/95 border border-white/70 dark:border-white/10 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NISN (10 Digit Unik) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="0012345678"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NIS Lokal Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="23451"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Contoh: Muhammad Rizki Pratama"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rombel / Kelas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.class_name}>
                        {c.class_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tahun Angkatan
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cohort_year}
                    onChange={(e) => setFormData({ ...formData, cohort_year: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Barcode / ID Kartu Presensi
                  </label>
                  <input
                    type="text"
                    value={formData.qr_code}
                    onChange={(e) => setFormData({ ...formData, qr_code: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="PDS-0012345678"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Siswa
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="MUTASI">MUTASI</option>
                    <option value="LULUS">LULUS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tempat, Tanggal Lahir
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.birth_place}
                      onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                      className="w-1/2 h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Jakarta"
                    />
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="w-1/2 h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No. WhatsApp Orang Tua / Wali
                  </label>
                  <input
                    type="tel"
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="0812xxxxxxxx"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : editingStudent ? 'Simpan Perubahan' : 'Tambahkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode / ID Card Preview Modal */}
      {selectedStudentForBarcode && (
        <BarcodeModal
          student={selectedStudentForBarcode}
          schoolName={schoolName}
          onClose={() => setSelectedStudentForBarcode(null)}
        />
      )}

      {/* Excel Bulk Import Modal */}
      {isImportModalOpen && (
        <ExcelImportModal
          isOpen={isImportModalOpen}
          classes={classes}
          onClose={() => setIsImportModalOpen(false)}
          onBulkImport={onBulkImport}
        />
      )}
    </div>
  );
};
