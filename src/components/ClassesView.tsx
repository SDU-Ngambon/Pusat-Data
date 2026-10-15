import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Users,
  UserCheck,
  Edit2,
  Trash2,
  ChevronRight,
  GraduationCap,
  X,
} from 'lucide-react';
import { AcademicClass, Student } from '../types/index.js';

interface ClassesViewProps {
  classes: (AcademicClass & { student_count: number; homeroom_teacher: string | null })[];
  students: Student[];
  onCreate: (data: Omit<AcademicClass, 'id' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<AcademicClass>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  classes,
  students,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeTab, setGradeTab] = useState<'all' | '10' | '11' | '12'>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassForRoster, setSelectedClassForRoster] = useState<AcademicClass | null>(null);
  const [editingClass, setEditingClass] = useState<AcademicClass | null>(null);

  const [formData, setFormData] = useState<{
    class_name: string;
    grade_level: 10 | 11 | 12;
    department: string;
    academic_year: string;
    status: 'AKTIF' | 'NONAKTIF';
  }>({
    class_name: '',
    grade_level: 10,
    department: 'Teknik Kendaraan Ringan',
    academic_year: '2026/2027',
    status: 'AKTIF',
  });

  const [submitting, setSubmitting] = useState(false);

  // Helper to extract 3 to 4 character code from department (e.g. 'TKR', 'TITL', 'TP', 'TKJ', 'APHP') or class name
  const getClassInitials = (dept: string, className: string): string => {
    const cleanDept = (dept || '').trim();
    if (cleanDept) {
      // If already a concise code (like 'TKR', 'TITL', 'TP', 'TKJ', 'RPL'), use it directly
      if (cleanDept.length <= 5 && !cleanDept.includes(' ')) {
        return cleanDept.toUpperCase();
      }

      // Check common vocational department acronyms
      const commonDepts = ['TITL', 'TKJ', 'TKR', 'RPL', 'APHP', 'DKV', 'TBSM', 'TKP', 'BKP', 'DPIB', 'TP', 'AKL', 'OTKP', 'BDP'];
      for (const cd of commonDepts) {
        const regex = new RegExp(`\\b${cd}\\b`, 'i');
        if (regex.test(cleanDept) || regex.test(className)) {
          return cd;
        }
      }

      // Extract first letter of each significant word (e.g. "Teknik Kendaraan Ringan" -> "TKR")
      const words = cleanDept.split(/\s+/).filter((w) => !/^(dan|ke|di|pada|jurusan|program|keahlian)$/i.test(w));
      if (words.length >= 2) {
        const acronym = words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
        if (acronym.length >= 2) return acronym;
      }

      return cleanDept.slice(0, 4).toUpperCase();
    }

    if (className) {
      const match = className.match(/\b([A-Z]{2,4})\b/i);
      if (match) return match[1].toUpperCase();
      return className.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'KLS';
    }

    return 'KLS';
  };

  // Filter classes
  const filteredClasses = classes.filter((c) => {
    const q = (searchTerm || '').toLowerCase();
    const cName = (c.class_name || '').toLowerCase();
    const dept = (c.department || '').toLowerCase();
    const teacher = (c.homeroom_teacher || '').toLowerCase();
    const matchesSearch =
      cName.includes(q) ||
      dept.includes(q) ||
      teacher.includes(q);

    const matchesGrade = gradeTab === 'all' || c.grade_level.toString() === gradeTab;

    return matchesSearch && matchesGrade;
  });

  const handleOpenCreate = () => {
    setEditingClass(null);
    setFormData({
      class_name: '10 TKR 2',
      grade_level: 10,
      department: 'Teknik Kendaraan Ringan',
      academic_year: '2026/2027',
      status: 'AKTIF',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: AcademicClass) => {
    setEditingClass(cls);
    setFormData({
      class_name: cls.class_name,
      grade_level: cls.grade_level,
      department: cls.department,
      academic_year: cls.academic_year || '2026/2027',
      status: cls.status || 'AKTIF',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingClass) {
        await onUpdate(editingClass.id, formData);
      } else {
        await onCreate(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan rombel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus rombongan belajar "${name}"?`)) {
      try {
        await onDelete(id);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus rombel');
      }
    }
  };

  // Students in selected roster modal
  const rosterStudents = selectedClassForRoster
    ? students.filter((s) => s.class_name === selectedClassForRoster.class_name)
    : [];

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60 dark:border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Rombongan Belajar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Entitas rombel otomatis terdaftar dari data siswa & disinkronkan ke aplikasi satelit via API.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Rombel</span>
        </button>
      </div>

      {/* Grade Level Filter Tabs & Search in unified Frosted Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 border border-white/70 dark:border-white/10 p-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Semua Tingkat' },
            { id: '10', label: 'Kelas 10' },
            { id: '11', label: 'Kelas 11' },
            { id: '12', label: 'Kelas 12' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setGradeTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                gradeTab === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white/70 text-slate-600 hover:text-slate-900 hover:bg-white dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800 border border-white/60 dark:border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama rombel, jurusan, wali kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 bg-white/70 dark:bg-slate-900/70 border border-white/70 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all font-medium"
          />
        </div>
      </div>

      {/* Bento Grid Cards View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-white/70 dark:border-white/10 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400">
            Tidak ada rombongan belajar yang ditemukan.
          </div>
        ) : (
          filteredClasses.map((cls) => {
            const hasHomeroom = cls.homeroom_teacher && cls.homeroom_teacher.trim() !== '' && cls.homeroom_teacher !== 'Belum Ditentukan';
            const initials = getClassInitials(cls.department, cls.class_name);

            return (
              <div
                key={cls.id}
                className="backdrop-blur-xl bg-white/70 hover:bg-white/90 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border border-white/80 dark:border-white/10 hover:border-blue-400/50 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-lg shadow-sm group relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar initial fallback */}
                      <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-cyan-300 font-extrabold flex items-center justify-center border border-sky-200/70 dark:border-cyan-500/30 text-[10px] tracking-tight shrink-0 font-mono shadow-xs px-1 text-center select-none">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60 font-bold rounded-full px-2 py-0.5 text-[10px]">
                            Kelas {cls.grade_level}
                          </span>
                          <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 font-bold rounded-full px-2 py-0.5 text-[10px] truncate max-w-[120px]">
                            {cls.department}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-950 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                          {cls.class_name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-white/80 dark:border-white/10 hover:bg-white text-slate-700 dark:text-slate-300 hover:text-slate-950 transition-colors cursor-pointer"
                        title="Edit Rombel"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cls.id, cls.class_name)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        title="Hapus Rombel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-white/70 dark:border-white/10 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-bold">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                        Wali Kelas:
                      </span>
                      <span className="truncate max-w-[140px] text-right">
                        {hasHomeroom ? (
                          <span className="font-extrabold text-slate-950 dark:text-slate-200">{cls.homeroom_teacher}</span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Belum Ditentukan</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-bold">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Siswa Terdaftar:
                      </span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-300 font-mono text-xs bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                        {cls.student_count} Siswa
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-white/70 dark:border-white/10">
                  <button
                    onClick={() => setSelectedClassForRoster(cls)}
                    className="w-full py-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700/80 border border-white/80 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer group/btn"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                    <span>Lihat Roster Siswa</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Lihat Roster Siswa */}
      {selectedClassForRoster && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/70 dark:border-white/10">
              <div>
                <h3 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                  <span>Daftar Siswa Rombel: {selectedClassForRoster.class_name}</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                  Jurusan {selectedClassForRoster.department} • Total {rosterStudents.length} siswa terdaftar
                </p>
              </div>
              <button
                onClick={() => setSelectedClassForRoster(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-white/60 dark:divide-white/10 border border-white/70 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-slate-900/50">
              {rosterStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-medium">
                  Belum ada siswa yang terdaftar di rombongan belajar ini.
                </div>
              ) : (
                rosterStudents.map((s, idx) => (
                  <div key={s.id} className="p-3.5 flex items-center justify-between hover:bg-white/80 dark:hover:bg-slate-800/60 transition-colors text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold flex items-center justify-center text-[10px] border border-white/80 dark:border-white/10">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-extrabold text-slate-950 dark:text-white">{s.full_name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">NISN: {s.nisn} • NIS: {s.nis}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded-full text-[10px] border border-slate-200 dark:border-slate-700 font-bold">
                        {s.qr_code}
                      </span>
                      <span className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedClassForRoster(null)}
                className="px-5 py-2 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:opacity-95 cursor-pointer shadow-md shadow-blue-500/25 border border-white/20"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Rombel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/70 dark:border-white/10">
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <span>{editingClass ? 'Edit Rombel' : 'Tambah Rombel Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                  Nama Rombel <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.class_name}
                  onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                  className="w-full h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                  placeholder="Contoh: 10 TKR 2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                    Tingkat Kelas
                  </label>
                  <select
                    value={formData.grade_level}
                    onChange={(e) => setFormData({ ...formData, grade_level: (parseInt(e.target.value) || 10) as 10 | 11 | 12 })}
                    className="w-full h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs cursor-pointer"
                  >
                    <option value={10}>Kelas 10</option>
                    <option value={11}>Kelas 11</option>
                    <option value={12}>Kelas 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                    Tahun Ajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    className="w-full h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                    placeholder="2026/2027"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                  Program / Kompetensi Keahlian (Jurusan)
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                  placeholder="Teknik Kendaraan Ringan"
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
                  {submitting ? 'Menyimpan...' : editingClass ? 'Simpan Perubahan' : 'Tambahkan Rombel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
