import React, { useState } from 'react';
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Edit2,
  ShieldCheck,
  Clock,
  Terminal,
  X,
  Layers,
  GraduationCap,
  Users,
  BookOpen,
  School,
} from 'lucide-react';
import { ApiClient, ApiScope } from '../types/index.js';

interface ApiClientsViewProps {
  clients: ApiClient[];
  onCreateClient: (data: {
    client_name: string;
    allowed_scopes: string[];
    status: 'Aktif' | 'Nonaktif';
    description?: string;
  }) => Promise<void>;
  onUpdateClient: (id: string, data: Partial<ApiClient>) => Promise<void>;
  onRegenerateKey: (id: string) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
  onTestClient: (client: ApiClient) => void;
}

const AVAILABLE_SCOPES: { id: ApiScope; label: string; desc: string; icon: any }[] = [
  {
    id: 'read:students',
    label: 'read:students',
    desc: 'Membaca daftar siswa, NISN, NIS, kelas, dan barcode kartu pelajar',
    icon: GraduationCap,
  },
  {
    id: 'read:teachers',
    label: 'read:teachers',
    desc: 'Membaca daftar guru, NIP, no WA, dan penugasan wali kelas',
    icon: Users,
  },
  {
    id: 'read:classes',
    label: 'read:classes',
    desc: 'Membaca data seluruh rombongan belajar aktif',
    icon: Layers,
  },
  {
    id: 'read:subjects',
    label: 'read:subjects',
    desc: 'Membaca daftar mata pelajaran dan kelompok kurikulum',
    icon: BookOpen,
  },
  {
    id: 'read:profile',
    label: 'read:profile',
    desc: 'Membaca identitas sekolah, NPSN, dan data kepala sekolah',
    icon: School,
  },
];

export const ApiClientsView: React.FC<ApiClientsViewProps> = ({
  clients,
  onCreateClient,
  onUpdateClient,
  onRegenerateKey,
  onDeleteClient,
  onTestClient,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ApiClient | null>(null);

  const [formData, setFormData] = useState<{
    client_name: string;
    allowed_scopes: ApiScope[];
    status: 'Aktif' | 'Nonaktif';
    description: string;
  }>({
    client_name: '',
    allowed_scopes: ['read:students', 'read:classes', 'read:profile'],
    status: 'Aktif',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData({
      client_name: '',
      allowed_scopes: ['read:students', 'read:classes', 'read:profile'],
      status: 'Aktif',
      description: '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: ApiClient) => {
    setEditingClient(client);
    setFormData({
      client_name: client.client_name,
      allowed_scopes: [...client.allowed_scopes],
      status: client.status,
      description: client.description || '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const toggleScope = (scopeId: ApiScope) => {
    setFormData((prev) => {
      const exists = prev.allowed_scopes.includes(scopeId);
      return {
        ...prev,
        allowed_scopes: exists
          ? prev.allowed_scopes.filter((s) => s !== scopeId)
          : [...prev.allowed_scopes, scopeId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.allowed_scopes.length === 0) {
      setErrorMsg('Pilih minimal satu hak akses (scope).');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      if (editingClient) {
        await onUpdateClient(editingClient.id, formData);
      } else {
        await onCreateClient(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses kredensial klien.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerate = async (client: ApiClient) => {
    if (
      confirm(
        `PERINGATAN: Generate token baru untuk "${client.client_name}"? Token lama akan langsung hangus dan tidak dapat digunakan lagi!`
      )
    ) {
      try {
        await onRegenerateKey(client.id);
      } catch (err: any) {
        alert(err.message || 'Gagal regenerasi token');
      }
    }
  };

  const handleDelete = async (client: ApiClient) => {
    if (
      confirm(
        `Hapus aplikasi terdaftar "${client.client_name}"? Aplikasi ini tidak akan lagi dapat menarik data sekolah!`
      )
    ) {
      try {
        await onDeleteClient(client.id);
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus klien');
      }
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60 dark:border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Manajemen Klien Satelit (API)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftarkan aplikasi satelit sekolah (Presensi, Rapor, CBT, Perpus) untuk mendapatkan API Key (Bearer Token).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all self-start sm:self-auto cursor-pointer border border-white/20"
        >
          <Plus className="w-4 h-4" />
          <span>Daftarkan Aplikasi Baru</span>
        </button>
      </div>

      {/* Security Info Banner */}
      <div className="backdrop-blur-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-800/60 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-700 dark:text-cyan-300 flex items-center justify-center shrink-0 border border-sky-200/60 dark:border-sky-700/50">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-950 dark:text-white">
              Format Header Autentikasi Pengembang Satelit
            </h4>
            <div className="mt-1 font-mono text-xs text-blue-700 dark:text-cyan-300 bg-white/90 dark:bg-slate-900/90 px-2.5 py-1 rounded-lg border border-sky-200/80 dark:border-sky-800/80 inline-block font-bold">
              Authorization: Bearer &lt;API_KEY_RAHASIA&gt;
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-600 dark:text-slate-300 max-w-sm font-medium">
          Aplikasi yang tidak menyertakan Bearer Token atau tidak memiliki scope yang cukup akan otomatis ditolak dengan kode respons <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">401 Unauthorized</span> atau <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">403 Forbidden</span>.
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clients.map((client) => {
          const isKeyVisible = visibleKeys[client.id];
          const isCopied = copiedKey === client.id;
          const isActive = client.status === 'Aktif';

          return (
            <div
              key={client.id}
              className={`backdrop-blur-xl rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                isActive
                  ? 'bg-white/70 hover:bg-white/90 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border border-white/80 dark:border-white/10 hover:border-blue-400/50 hover:shadow-md'
                  : 'bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50'
              }`}
            >
              <div className="space-y-4">
                {/* Top header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-base text-slate-950 dark:text-white">{client.client_name}</h3>
                      <button
                        onClick={async () => {
                          await onUpdateClient(client.id, {
                            status: isActive ? 'Nonaktif' : 'Aktif',
                          });
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60 hover:bg-emerald-100'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/60 hover:bg-rose-100'
                        }`}
                        title="Klik untuk mengubah status aktif/nonaktif"
                      >
                        {isActive ? '● Aktif' : '○ Nonaktif'}
                      </button>
                    </div>
                    {client.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                        {client.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(client)}
                      className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-white/80 dark:border-white/10 hover:bg-white text-slate-700 dark:text-slate-300 hover:text-slate-950 transition-colors cursor-pointer"
                      title="Edit Hak Akses / Keterangan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(client)}
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                      title="Hapus Klien API"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* API Key Box */}
                <div className="p-3 bg-white/80 dark:bg-slate-950/70 rounded-xl border border-white/80 dark:border-white/10 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                    <span>API KEY (BEARER TOKEN):</span>
                    <button
                      onClick={() => handleRegenerate(client)}
                      className="text-xs text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      title="Generate Kunci Baru"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 font-mono text-xs text-slate-950 dark:text-white font-bold">
                    <span className="truncate">
                      {isKeyVisible
                        ? client.api_key
                        : `${client.api_key.slice(0, 16)}••••••••••••••••••••`}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleKeyVisibility(client.id)}
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        title={isKeyVisible ? 'Sembunyikan' : 'Tampilkan Kunci'}
                      >
                        {isKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopyKey(client.api_key, client.id)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isCopied ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Salin API Key"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scopes Chips */}
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Allowed Scopes (Izin Akses Data):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {client.allowed_scopes.map((scope) => (
                      <span
                        key={scope}
                        className="bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-cyan-300 border border-sky-200/70 dark:border-sky-800/60 font-mono text-[11px] font-bold px-2 py-0.5 rounded-full"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Test client playground button */}
              <div className="pt-3 mt-4 border-t border-white/70 dark:border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3" />
                  ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{client.id}</span>
                </span>

                <button
                  onClick={() => onTestClient(client)}
                  className="px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 border border-white/80 dark:border-white/10 hover:bg-white dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Uji di Playground</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Pendaftaran / Edit Klien (Frosted Glass macOS Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/70 dark:border-white/10">
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <span>{editingClient ? 'Edit Klien Satelit' : 'Registrasi Klien Satelit'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                  Nama Aplikasi / Klien Satelit <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                  placeholder="Contoh: Aplikasi Presensi Siswa Mobile QR"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                  Deskripsi / Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                  placeholder="Digunakan tim kesiswaan untuk pemindaian barcode gerbang"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1.5">
                  Hak Akses Data Terisolasi (Allowed Scopes) <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {AVAILABLE_SCOPES.map((scope) => {
                    const isChecked = formData.allowed_scopes.includes(scope.id);
                    const Icon = scope.icon;

                    return (
                      <div
                        key={scope.id}
                        onClick={() => toggleScope(scope.id)}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-sky-50/80 dark:bg-sky-950/60 border-blue-400 dark:border-cyan-500'
                            : 'bg-white/70 dark:bg-slate-800/60 border-white/70 dark:border-white/10 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 accent-blue-600 rounded cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                            <span className="font-mono text-xs font-extrabold text-slate-950 dark:text-white">
                              {scope.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-normal font-medium">
                            {scope.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                  Status Klien
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Nonaktif' })}
                  className="w-full h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs cursor-pointer"
                >
                  <option value="Aktif">Aktif (Dapat mengakses API)</option>
                  <option value="Nonaktif">Nonaktif (Akses ditolak sementara)</option>
                </select>
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
                  {submitting ? 'Memproses...' : editingClient ? 'Simpan Perubahan' : 'Registrasikan Aplikasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
