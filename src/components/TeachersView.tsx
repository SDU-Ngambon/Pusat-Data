import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  Phone,
  FileSpreadsheet,
  X,
  UserCheck,
} from 'lucide-react';
import { Teacher, AcademicClass, EmploymentStatus } from '../types/index.js';
import { ExcelImportModal } from './ExcelImportModal.js';
import { excelHelper } from '../utils/excelHelper.js';

interface TeachersViewProps {
  teachers: Teacher[];
  classes: AcademicClass[];
  onCreate: (data: Omit<Teacher, 'id' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Teacher>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBulkImport: (items: any[]) => Promise<{ imported_count: number; failed_count: number; errors: string[] }>;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  teachers,
  classes,
  onCreate,
  onUpdate,
  onDelete,
  onBulkImport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('all');
  const [homeroomFilter, setHomeroomFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState<{
    nip: string;
    full_name: string;
    whatsapp: string;
    employment_status: EmploymentStatus;
    subject_specialization: string;
    homeroom_class: string;
  }>({
    nip: '',
    full_name: '',
    whatsapp: '',
    employment_status: 'PNS',
    subject_specialization: 'Teknik Kendaraan Ringan',
    homeroom_class: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Filter teachers
  const filtered = teachers.filter((t) => {
    const q = (searchTerm || '').toLowerCase();
    const name = (t.full_name || '').toLowerCase();
    const nip = t.nip || '';
    const wa = t.whatsapp || '';
    const spec = (t.subject_specialization || '').toLowerCase();
    const matchesSearch =
      name.includes(q) ||
      nip.includes(q) ||
      wa.includes(q) ||
      spec.includes(q);

    const matchesEmployment = employmentFilter === 'all' || t.employment_status === employmentFilter;
    const matchesHomeroom =
      homeroomFilter === 'all'
        ? true
        : homeroomFilter === 'yes'
        ? !!t.homeroom_class
        : !t.homeroom_class;

    return matchesSearch && matchesEmployment && matchesHomeroom;
  });

  const handleOpenCreate = () => {
    setEditingTeacher(null);
    const randomNip = '197' + Math.floor(10000000000000 + Math.random() * 90000000000000).toString().slice(0, 15);
    setFormData({
      nip: randomNip,
      full_name: '',
      whatsapp: '0812' + Math.floor(10000000 + Math.random() * 90000000).toString(),
      employment_status: 'PNS',
      subject_specialization: 'Matematika Terapan',
      homeroom_class: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      nip: teacher.nip || '',
      full_name: teacher.full_name,
      whatsapp: teacher.whatsapp,
      employment_status: teacher.employment_status,
      subject_specialization: teacher.subject_specialization || '',
      homeroom_class: teacher.homeroom_class || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        nip: formData.nip.trim() === '' ? null : formData.nip.trim(),
        homeroom_class: formData.homeroom_class.trim() === '' ? null : formData.homeroom_class.trim(),
      };

      if (editingTeacher) {
        await onUpdate(editingTeacher.id, payload);
      } else {
        await onCreate(payload as any);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus data guru "${name}"?`)) {
      try {
        await onDelete(id);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus guru');
      }
    }
  };

  const handleDownloadTemplate = () => {
    excelHelper.generateTeacherTemplate();
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((t) => ({
      NIP: t.nip || '-',
      'Nama Lengkap & Gelar': t.full_name,
      'No. WhatsApp': t.whatsapp,
      'Status Kepegawaian': t.employment_status,
      'Bidang Studi / Spesialisasi': t.subject_specialization || '-',
      'Penugasan Wali Kelas': t.homeroom_class || '-',
    }));
    excelHelper.exportToExcel(exportData, 'Data_Guru_Pusat_Data_Sekolah', 'Guru');
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60 dark:border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Master Data Guru & Tendik
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola data pendidik, NIP unik, WhatsApp untuk integrasi bot notifikasi, dan penugasan wali kelas.
          </p>
        </div>

        {/* Action Buttons */}
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
            title="Ekspor Data Guru Terfilter ke Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all ml-auto sm:ml-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Unified Search & Filters Bar */}
      <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 border border-white/70 dark:border-white/10 p-3 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIP, WhatsApp, mata pelajaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 bg-white/70 dark:bg-slate-900/70 border border-white/70 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full lg:w-auto">
          <select
            value={employmentFilter}
            onChange={(e) => setEmploymentFilter(e.target.value)}
            className="h-10 px-3 bg-white/70 dark:bg-slate-900/70 border border-white/70 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all cursor-pointer"
          >
            <option value="all">Semua Status Kepegawaian</option>
            <option value="PNS">PNS</option>
            <option value="PPPK">PPPK</option>
            <option value="Non-PNS">Non-PNS</option>
          </select>

          <select
            value={homeroomFilter}
            onChange={(e) => setHomeroomFilter(e.target.value)}
            className="h-10 px-3 bg-white/70 dark:bg-slate-900/70 border border-white/70 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all cursor-pointer"
          >
            <option value="all">Semua Penugasan</option>
            <option value="yes">Hanya Wali Kelas</option>
            <option value="no">Bukan Wali Kelas</option>
          </select>
        </div>
      </div>

      {/* Table Summary Meta Bar */}
      <div className="px-1 flex items-center justify-between text-xs text-slate-400">
        <span>
          Menampilkan <strong className="text-slate-700 dark:text-slate-200 font-semibold">{filtered.length}</strong> dari{' '}
          <strong className="text-slate-700 dark:text-slate-200 font-semibold">{teachers.length}</strong> guru & tendik
        </span>
        <span className="text-[11px] text-slate-400">Status Kepegawaian & Penugasan</span>
      </div>

      {/* Frosted Glass Table */}
      <div className="overflow-x-auto backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-white/70 dark:border-white/10 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/75 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-b border-white/60 dark:border-white/10 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Nama & Keahlian</th>
              <th className="py-3.5 px-4">NIP</th>
              <th className="py-3.5 px-4">No. WhatsApp</th>
              <th className="py-3.5 px-4">Kepegawaian</th>
              <th className="py-3.5 px-4">Wali Kelas</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/60 dark:divide-white/5 text-slate-800 dark:text-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                  Tidak ada data guru yang sesuai dengan pencarian.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{t.full_name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-full px-2.5 py-0.5 text-[10px] border border-slate-200 dark:border-slate-600">
                        {t.subject_specialization || 'Umum'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-xs">
                    {t.nip ? (
                      <span className="text-slate-900 dark:text-white font-bold tracking-wide">{t.nip}</span>
                    ) : (
                      <span className="text-slate-400 italic font-mono">- (Non-PNS)</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{t.whatsapp}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`font-semibold rounded-full px-2.5 py-0.5 text-xs inline-flex items-center ${
                        t.employment_status === 'PNS'
                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                          : t.employment_status === 'PPPK'
                          ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {t.employment_status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {t.homeroom_class ? (
                      <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold rounded-full px-2.5 py-0.5 text-xs inline-flex items-center">
                        Wali Kelas {t.homeroom_class}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-xs italic">Bukan Wali Kelas</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-white/60 dark:border-white/10"
                        title="Edit Guru"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.full_name)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer border border-rose-500/20"
                        title="Hapus Guru"
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

      {/* Modal Tambah / Edit Guru (macOS Aqua Frosted Glass) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-white/95 dark:bg-slate-800/95 border border-white/70 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap & Gelar Pendidik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Contoh: Drs. H. Bambang Sudarsono, M.Pd."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NIP (Opsional untuk Honorer)
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="196805121993031004"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Kepegawaian <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.employment_status}
                    onChange={(e) => setFormData({ ...formData, employment_status: e.target.value as EmploymentStatus })}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Non-PNS">Non-PNS / Honorer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No. WhatsApp Aktif <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="081234567890"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Penugasan Wali Kelas (Opsional)
                  </label>
                  <select
                    value={formData.homeroom_class}
                    onChange={(e) => setFormData({ ...formData, homeroom_class: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Bukan Wali Kelas</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.class_name}>
                        Wali Kelas {c.class_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mata Pelajaran / Keahlian Utama
                </label>
                <input
                  type="text"
                  value={formData.subject_specialization}
                  onChange={(e) => setFormData({ ...formData, subject_specialization: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Contoh: Pemeliharaan Mesin Kendaraan Ringan"
                />
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
                  {submitting ? 'Menyimpan...' : editingTeacher ? 'Simpan Perubahan' : 'Tambahkan Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
