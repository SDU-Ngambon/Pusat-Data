import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { AdminUser, SchoolProfile } from '../types/index.js';

interface LoginViewProps {
  profile?: SchoolProfile | null;
  onLoginSuccess: (token: string, user: AdminUser) => void;
  onLogin: (username: string, password: string) => Promise<{ token: string; user: AdminUser }>;
}

export const LoginView: React.FC<LoginViewProps> = ({ profile, onLoginSuccess, onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await onLogin(username.trim(), password.trim());
      onLoginSuccess(res.token, res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMsg('');
  };

  const appTitle = profile?.app_title || 'Pusat Data Sekolah';
  const tagline = profile?.portal_tagline || 'Single Source of Truth (SSOT) Core Data Hub';

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#dfe9f3] via-[#eef2f6] to-[#e0e7ff] text-slate-800 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Soft ambient blurs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-400/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-sky-400/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-400/20 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-sky-400 shadow-xl shadow-indigo-500/25 text-white font-bold mb-2 overflow-hidden border border-white/60 p-0.5">
            {profile?.logo_url && !logoError ? (
              <img
                src={profile.logo_url}
                alt={appTitle}
                onError={() => setLogoError(true)}
                className="w-full h-full object-cover rounded-[22px]"
              />
            ) : (
              <Sparkles className="w-8 h-8 fill-white" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {appTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {profile?.school_name ? `${profile.school_name} • ` : ''}{tagline}
          </p>
        </div>

        {/* macOS Window Glass Card */}
        <div className="backdrop-blur-2xl bg-white/80 border border-white/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/10 space-y-5">
          {/* macOS Window Titlebar with Traffic Lights */}
          <div className="flex items-center justify-between pb-4 border-b border-white/60">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-xs inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-xs inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-xs inline-block" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Portal Masuk Admin
            </span>
            <span className="text-[11px] font-mono text-indigo-700 bg-indigo-500/15 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-semibold">
              v1.2 Aqua
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-700 text-xs font-medium animate-pulse">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username Admin <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan username admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-white/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white/80 border border-white/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Memverifikasi Kredensial...' : 'Masuk ke Dashboard'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Helper Banner */}
          <div className="pt-3 border-t border-white/60">
            <div className="bg-white/70 border border-white/60 p-3 rounded-2xl flex items-center justify-between text-xs shadow-2xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  Default Credentials:
                </span>
                <span className="font-mono font-semibold text-indigo-700 text-xs">
                  admin <span className="text-slate-400">/</span> admin123
                </span>
              </div>
              <button
                type="button"
                onClick={fillDefaultCredentials}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-medium transition-colors cursor-pointer shadow-xs"
              >
                Gunakan
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400">
          Single Source of Truth (SSOT) Data Referensi Sekolah Terpusat
        </p>
      </div>
    </div>
  );
};
