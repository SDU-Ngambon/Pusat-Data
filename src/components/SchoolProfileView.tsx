import React, { useState } from 'react';
import { School, Edit3, Save, Globe, Phone, Mail, Award, UserCheck, Shield } from 'lucide-react';
import { SchoolProfile } from '../types/index.js';

interface SchoolProfileViewProps {
  profile: SchoolProfile | null;
  onUpdate: (data: Partial<SchoolProfile>) => Promise<void>;
}

export const SchoolProfileView: React.FC<SchoolProfileViewProps> = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<SchoolProfile>>(profile || {});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdate(formData);
      setIsEditing(false);
      setSuccessMsg('Profil sekolah berhasil diperbarui!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/70 dark:border-white/10">
        <div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
            Profil & Identitas Sekolah
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
            Data referensi identitas sekolah yang dikonsumsi oleh aplikasi satelit via <code className="text-blue-700 dark:text-cyan-400 font-mono font-bold">/api/v1/sync/school-profile</code>
          </p>
        </div>

        <div>
          {!isEditing ? (
            <button
              onClick={() => {
                setFormData(profile);
                setIsEditing(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all cursor-pointer border border-white/20"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profil Sekolah</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 rounded-xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 cursor-pointer disabled:opacity-50 border border-white/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/35 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold animate-in fade-in">
          {successMsg}
        </div>
      )}

      {/* Main Profile Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: School ID Card */}
        <div className="backdrop-blur-2xl bg-white/55 dark:bg-slate-800/55 border border-white/80 dark:border-white/10 rounded-3xl p-6 shadow-[0_10px_30px_-5px_rgba(31,38,135,0.08)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.4)] space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-white/70 dark:border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-blue-500/25 border border-white/30">
              <School className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 dark:text-white text-base">{profile.school_name}</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-mono font-bold mt-0.5">NPSN: {profile.npsn}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-white/10 shadow-xs">
              <span className="text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Akreditasi:
              </span>
              <span className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/35 font-extrabold px-2.5 py-0.5 rounded-full text-xs">
                {profile.accreditation}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-white/10 shadow-xs">
              <span className="text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                Kepala Sekolah:
              </span>
              <span className="font-extrabold text-slate-950 dark:text-slate-100 text-right truncate max-w-[150px]">
                {profile.headmaster_name}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-white/10 shadow-xs">
              <span className="text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                NIP Kepala Sekolah:
              </span>
              <span className="font-mono font-bold text-slate-950 dark:text-slate-100 text-xs">
                {profile.headmaster_nip}
              </span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Editable / Details Form */}
        <div className="lg:col-span-2 backdrop-blur-2xl bg-white/55 dark:bg-slate-800/55 border border-white/80 dark:border-white/10 rounded-3xl p-6 shadow-[0_10px_30px_-5px_rgba(31,38,135,0.08)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.4)] space-y-5">
          <div className="border-b border-white/70 dark:border-white/10 pb-3">
            <h3 className="text-sm font-black text-slate-950 dark:text-white">
              Rincian Informasi Kontak & Domisili Resmi
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
              Seluruh parameter ini otomatis terintegrasi ke header cetak kartu barcode siswa dan dokumen e-Rapor.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1.5">
                  Nama Resmi Sekolah
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.school_name || ''}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                  className="w-full h-10 px-3.5 bg-white/80 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-bold disabled:bg-slate-100/80 dark:disabled:bg-slate-800/60 disabled:text-slate-800 dark:disabled:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1.5">
                  Nomor Pokok Sekolah Nasional (NPSN)
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.npsn || ''}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  className="w-full h-10 px-3.5 bg-white/80 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-mono font-bold disabled:bg-slate-100/80 dark:disabled:bg-slate-800/60 disabled:text-slate-800 dark:disabled:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1.5">
                Alamat Lengkap Sekolah
              </label>
              <textarea
                rows={2}
                disabled={!isEditing}
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 bg-white/80 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-medium disabled:bg-slate-100/80 dark:disabled:bg-slate-800/60 disabled:text-slate-800 dark:disabled:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Telepon</span>
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.telephone || ''}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full h-10 px-3 bg-white/80 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-bold disabled:bg-slate-100/80 dark:disabled:bg-slate-800/60 disabled:text-slate-800 dark:disabled:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Email Resmi</span>
                </label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3 bg-white/80 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-bold disabled:bg-slate-100/80 dark:disabled:bg-slate-800/60 disabled:text-slate-800 dark:disabled:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Website</span>
                </label>
                <input
                  type="url"
                  disabled={!isEditing}
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full h-10 px-3 bg-white/80 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-bold disabled:bg-slate-100/80 dark:disabled:bg-slate-800/60 disabled:text-slate-800 dark:disabled:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 border border-white/20"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Profil Sekolah'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
