import React, { useState } from 'react';
import { User, KeyRound, ShieldCheck, X, Eye, EyeOff, Save } from 'lucide-react';
import { AdminUser } from '../types/index.js';

interface AccountSettingsModalProps {
  isOpen: boolean;
  currentUser: AdminUser | null;
  onClose: () => void;
  onUpdateAccount: (payload: {
    current_password: string;
    new_username?: string;
    new_password?: string;
    full_name?: string;
  }) => Promise<AdminUser>;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onUpdateAccount,
}) => {
  const [fullName, setFullName] = useState(currentUser?.full_name || 'Administrator Utama');
  const [username, setUsername] = useState(currentUser?.username || 'admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword.trim()) {
      setErrorMsg('Masukkan password saat ini untuk memverifikasi perubahan.');
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
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui akun admin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-white/70 dark:border-white/10">
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            <span>Pengaturan Akun Administrator</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
              Username Admin
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
            />
          </div>

          <div className="pt-2 border-t border-white/70 dark:border-white/10">
            <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
              Password Saat Ini (Wajib) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Password saat ini"
                className="w-full h-10 pl-3 pr-10 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
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

          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
              Password Baru (Opsional)
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengubah"
                className="w-full h-10 pl-3 pr-10 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
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

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/70 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/80 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 border border-white/20"
            >
              {submitting ? 'Menyimpan...' : 'Perbarui Akun'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
