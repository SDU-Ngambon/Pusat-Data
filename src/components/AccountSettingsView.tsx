import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  Lock,
  UserCheck,
  Shield,
} from 'lucide-react';
import { AdminUser } from '../types/index.js';

interface AccountSettingsViewProps {
  currentUser: AdminUser | null;
  onUpdateAccount: (payload: {
    current_password: string;
    new_username?: string;
    new_password?: string;
    full_name?: string;
  }) => Promise<AdminUser>;
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  currentUser,
  onUpdateAccount,
}) => {
  const [fullName, setFullName] = useState(currentUser?.full_name || 'Administrator Utama');
  const [username, setUsername] = useState(currentUser?.username || 'admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword.trim()) {
      setErrorMsg('Password saat ini (password lama) wajib diisi untuk otorisasi keamanan.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password baru tidak cocok dengan password baru yang dimasukkan.');
      return;
    }

    if (!username.trim()) {
      setErrorMsg('Username admin tidak boleh kosong.');
      return;
    }

    setSubmitting(true);
    try {
      await onUpdateAccount({
        current_password: currentPassword.trim(),
        new_username: username.trim(),
        new_password: newPassword.trim() || undefined,
        full_name: fullName.trim(),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui akun administrator');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/70 dark:border-white/10">
        <div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
            Pengaturan Akun Administrator
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
            Perbarui kredensial masuk portal (Username & Password) serta nama tampilan penanggung jawab pusat data.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/70 dark:border-sky-800/60 text-xs font-mono text-sky-800 dark:text-cyan-300 flex items-center gap-2 self-start sm:self-auto font-bold shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          <span>Role: SUPER_ADMIN</span>
        </div>
      </div>

      {/* Centered Settings Card Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Account Info & Summary Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-white/70 dark:border-white/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-blue-500/25 border border-white/30">
                {currentUser?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-950 dark:text-white text-base truncate">
                  {currentUser?.full_name || 'Administrator Utama'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono font-bold mt-0.5 truncate">
                  @{currentUser?.username || 'admin'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 shadow-2xs">
                <span className="text-slate-700 dark:text-slate-300 font-bold">Status Akses:</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Aktif & Terautentikasi
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 shadow-2xs">
                <span className="text-slate-700 dark:text-slate-300 font-bold">Hak Otoritas:</span>
                <span className="text-blue-700 dark:text-cyan-300 font-extrabold font-mono">Full Access (SSOT)</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 shadow-2xs">
                <span className="text-slate-700 dark:text-slate-300 font-bold">Penyimpanan:</span>
                <span className="text-slate-900 dark:text-slate-100 font-mono font-bold">tabel admin_users</span>
              </div>
            </div>

            <div className="p-4 bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-800/60 rounded-2xl text-xs space-y-1">
              <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                Tips Keamanan
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Gunakan kombinasi minimal 8 karakter dengan huruf dan angka. Simpan kredensial Anda di tempat yang aman.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Centered Form Card */}
        <div className="lg:col-span-7 backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="border-b border-white/70 dark:border-white/10 pb-3">
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Formulir Perubahan Kredensial</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              Ubah username atau perbarui password akun administrator pusat data.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1.5">
                Nama Lengkap Administrator <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-10 px-3.5 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-bold shadow-xs"
                placeholder="Nama administrator"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1.5">
                Username Masuk <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 px-3.5 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono font-bold shadow-xs"
                placeholder="admin"
              />
            </div>

            <div className="pt-2 border-t border-white/70 dark:border-white/10">
              <span className="text-xs font-extrabold text-slate-950 dark:text-white block mb-3">
                Verifikasi Keamanan Password:
              </span>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                    Password Saat Ini (Wajib untuk Verifikasi) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan password saat ini (default: admin123)"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full h-10 pl-3.5 pr-10 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono font-bold shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                      Password Baru (Opsional)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Kosongkan jika tidak diubah"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-10 pl-3.5 pr-10 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono font-bold shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                      Ulangi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Ulangi password baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-10 pl-3.5 pr-10 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono font-bold shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/70 dark:border-white/10 flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 border border-white/20"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Menyimpan Kredensial...' : 'Perbarui Akun Administrator'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
