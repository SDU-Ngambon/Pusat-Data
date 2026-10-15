import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  Clock,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { Subject, CurriculumGroup } from '../types/index.js';
import { ExcelImportModal } from './ExcelImportModal.js';
import { excelHelper } from '../utils/excelHelper.js';

interface SubjectsViewProps {
  subjects: Subject[];
  onCreate: (data: Omit<Subject, 'id' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Subject>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBulkImport: (items: any[]) => Promise<{ imported_count: number; failed_count: number; errors: string[] }>;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onCreate,
  onUpdate,
  onDelete,
  onBulkImport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [formData, setFormData] = useState<{
    kode_mapel: string;
    nama_mapel: string;
    kelompok: CurriculumGroup;
    hours_per_week: number;
    keterangan: string;
  }>({
    kode_mapel: '',
    nama_mapel: '',
    kelompok: 'Kejuruan',
    hours_per_week: 4,
    keterangan: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Filter subjects
  const filtered = subjects.filter((s) => {
    const q = (searchTerm || '').toLowerCase();
    const code = (s.kode_mapel || '').toLowerCase();
    const name = (s.nama_mapel || '').toLowerCase();
    const desc = (s.keterangan || '').toLowerCase();
    const matchesSearch =
      code.includes(q) ||
      name.includes(q) ||
      desc.includes(q);

    const matchesGroup = groupFilter === 'all' || s.kelompok === groupFilter;

    return matchesSearch && matchesGroup;
  });

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setFormData({
      kode_mapel: 'MAPEL-' + Math.floor(100 + Math.random() * 900),
      nama_mapel: '',
      kelompok: 'Kejuruan',
      hours_per_week: 4,
      keterangan: 'Kurikulum Merdeka SMK',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      kode_mapel: subject.kode_mapel,
      nama_mapel: subject.nama_mapel,
      kelompok: subject.kelompok,
      hours_per_week: subject.hours_per_week ?? 3,
      keterangan: subject.keterangan || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSubject) {
        await onUpdate(editingSubject.id, formData);
      } else {
        await onCreate(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan mata pelajaran');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus mata pelajaran "${name}"?`)) {
      try {
        await onDelete(id);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus mata pelajaran');
      }
    }
  };

  const handleDownloadTemplate = () => {
    excelHelper.generateSubjectTemplate();
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((s) => ({
      'Kode Mapel': s.kode_mapel,
      'Nama Mata Pelajaran': s.nama_mapel,
      Kelompok: s.kelompok,
      'Beban Jam (JP)': s.hours_per_week,
      Keterangan: s.keterangan || '-',
    }));
    excelHelper.exportToExcel(exportData, 'Data_Mata_Pelajaran_Pusat_Data_Sekolah', 'Mapel');
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/70 dark:border-white/10">
        <div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
            Master Data Mata Pelajaran
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
            Katalog mata pelajaran terpadu untuk menyuplai referensi jadwal & e-Rapor kurikulum merdeka.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 bg-white/75 hover:bg-white dark:bg-slate-800/75 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-white/80 dark:border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="Unduh Template Excel .XLSX"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Template Excel</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-white/75 hover:bg-white dark:bg-slate-800/75 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-white/80 dark:border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="Import File Excel (.xlsx)"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-white/75 hover:bg-white dark:bg-slate-800/75 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-white/80 dark:border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="Ekspor Data Mapel Terfilter ke Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all ml-auto sm:ml-0 cursor-pointer border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mapel</span>
          </button>
        </div>
      </div>

      {/* Unified Search & Filters Bar */}
      <div className="backdrop-blur-2xl bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-white/10 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode mapel, nama mapel, keterangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 bg-white/80 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-bold shadow-xs"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="h-10 px-3 bg-white/80 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all w-full sm:w-auto cursor-pointer shadow-xs"
          >
            <option value="all">Semua Kelompok Kurikulum</option>
            <option value="Kejuruan">Kejuruan</option>
            <option value="Umum">Umum</option>
            <option value="Muatan Lokal">Muatan Lokal</option>
          </select>
        </div>
      </div>

      {/* Table Summary Meta Bar */}
      <div className="px-1 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
        <span>
          Menampilkan <strong className="text-slate-950 dark:text-white font-extrabold">{filtered.length}</strong> dari{' '}
          <strong className="text-slate-950 dark:text-white font-extrabold">{subjects.length}</strong> mata pelajaran
        </span>
        <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Kurikulum & Alokasi Beban Jam</span>
      </div>

      {/* Frosted Glass Table */}
      <div className="overflow-x-auto backdrop-blur-2xl bg-white/55 dark:bg-slate-800/55 rounded-2xl border border-white/80 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/75 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border-b border-white/80 dark:border-white/10 font-black uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Kode Mapel</th>
              <th className="py-3.5 px-4">Nama Mata Pelajaran</th>
              <th className="py-3.5 px-4">Kelompok</th>
              <th className="py-3.5 px-4">Beban Jam</th>
              <th className="py-3.5 px-4">Keterangan</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/60 dark:divide-white/5 text-slate-900 dark:text-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-600 dark:text-slate-400 font-bold">
                  Tidak ada mata pelajaran yang ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const kode = s.kode_mapel || (s as any).code || (s as any).kode || '-';
                const nama = s.nama_mapel || (s as any).name || (s as any).nama || '-';
                const kelompok = s.kelompok || (s as any).group || 'Kejuruan';

                return (
                  <tr key={s.id} className="hover:bg-blue-500/10 dark:hover:bg-cyan-400/10 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-slate-950 dark:text-white">
                      {kode}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-slate-950 dark:text-white">
                      {nama}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-extrabold rounded-full px-2.5 py-0.5 text-xs inline-flex items-center ${
                          kelompok === 'Kejuruan'
                            ? 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/35'
                            : kelompok === 'Umum'
                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/35'
                            : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/35'
                        }`}
                      >
                        {kelompok}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className="bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/35 font-extrabold rounded-full px-2.5 py-0.5 text-xs inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>{s.hours_per_week || 3} JP/minggu</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate font-semibold">
                      {s.keterangan || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer border border-white/80 dark:border-white/10 shadow-xs"
                          title="Edit Mapel"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, nama)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 transition-colors cursor-pointer border border-rose-500/25 shadow-xs"
                          title="Hapus Mapel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah / Edit Mata Pelajaran (macOS Aqua Glass Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-white/95 dark:bg-slate-800/95 border border-white/80 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/70 dark:border-white/10">
              <h3 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <span>{editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                    Kode Mapel (Unik) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kode_mapel}
                    onChange={(e) => setFormData({ ...formData, kode_mapel: e.target.value.toUpperCase() })}
                    className="w-full h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                    placeholder="Contoh: TKR-PMKR-10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                    Beban Jam (JP / Minggu)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={formData.hours_per_week}
                    onChange={(e) => setFormData({ ...formData, hours_per_week: parseInt(e.target.value) || 2 })}
                    className="w-full h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                  Nama Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_mapel}
                  onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })}
                  className="w-full h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                  placeholder="Contoh: Pemeliharaan Mesin Kendaraan Ringan"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                  Kelompok Kurikulum <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.kelompok}
                  onChange={(e) => setFormData({ ...formData, kelompok: e.target.value as CurriculumGroup })}
                  className="w-full h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs cursor-pointer"
                >
                  <option value="Kejuruan">Kejuruan (Produktif / Vokasi)</option>
                  <option value="Umum">Umum (Wajib Nasional / Muatan Umum)</option>
                  <option value="Muatan Lokal">Muatan Lokal (Bahasa Daerah / Khas)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                  Keterangan / Capaian Pembelajaran
                </label>
                <textarea
                  rows={3}
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full p-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                  placeholder="Deskripsi ruang lingkup atau capaian materi..."
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/70 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/80 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 border border-white/20"
                >
                  {submitting ? 'Menyimpan...' : editingSubject ? 'Simpan Perubahan' : 'Tambahkan Mapel'}
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
          classes={[]}
          onClose={() => setIsImportModalOpen(false)}
          onBulkImport={onBulkImport}
        />
      )}
    </div>
  );
};
