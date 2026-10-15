import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Globe,
  Upload,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Palette,
  Check,
} from 'lucide-react';
import { SchoolProfile } from '../types/index.js';
import { apiService } from '../services/api.js';

interface PortalSettingsViewProps {
  profile: SchoolProfile | null;
  onUpdate: (data: Partial<SchoolProfile>) => Promise<void>;
}

export type ThemeColorOption = 'indigo' | 'blue' | 'rose' | 'emerald' | 'slate';

const THEME_OPTIONS: { id: ThemeColorOption; name: string; hex: string; bgClass: string; borderClass: string; textClass: string; ringClass: string }[] = [
  {
    id: 'indigo',
    name: 'Indigo Modern',
    hex: '#4f46e5',
    bgClass: 'bg-indigo-600',
    borderClass: 'border-indigo-500',
    textClass: 'text-indigo-600',
    ringClass: 'ring-indigo-400',
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    hex: '#2563eb',
    bgClass: 'bg-blue-600',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-600',
    ringClass: 'ring-blue-400',
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    hex: '#e11d48',
    bgClass: 'bg-rose-600',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-600',
    ringClass: 'ring-rose-400',
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    hex: '#059669',
    bgClass: 'bg-emerald-600',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-600',
    ringClass: 'ring-emerald-400',
  },
  {
    id: 'slate',
    name: 'Slate Minimal',
    hex: '#334155',
    bgClass: 'bg-slate-700',
    borderClass: 'border-slate-600',
    textClass: 'text-slate-700',
    ringClass: 'ring-slate-400',
  },
];

export const PortalSettingsView: React.FC<PortalSettingsViewProps> = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    app_title: profile?.app_title || 'Pusat Data Sekolah',
    theme_color: (profile?.theme_color as ThemeColorOption) || 'indigo',
    logo_url: profile?.logo_url || '',
    favicon_url: profile?.favicon_url || '',
  });

  // Local File selection states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(profile?.logo_url || '');
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string>(profile?.favicon_url || '');

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewError, setPreviewError] = useState<{ logo: boolean; favicon: boolean }>({
    logo: false,
    favicon: false,
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        app_title: profile.app_title || 'Pusat Data Sekolah',
        theme_color: (profile.theme_color as ThemeColorOption) || 'indigo',
        logo_url: profile.logo_url || '',
        favicon_url: profile.favicon_url || '',
      });
      setLogoPreview(profile.logo_url || '');
      setFaviconPreview(profile.favicon_url || '');
      setPreviewError({ logo: false, favicon: false });
    }
  }, [profile]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'File logo harus berupa gambar (PNG, JPG, SVG, WebP).' });
      return;
    }

    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
    setPreviewError((prev) => ({ ...prev, logo: false }));
    setStatusMessage(null);
  };

  const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.endsWith('.ico')) {
      setStatusMessage({ type: 'error', text: 'File favicon harus berupa gambar (.ico, .png, .svg).' });
      return;
    }

    setFaviconFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFaviconPreview(objectUrl);
    setPreviewError((prev) => ({ ...prev, favicon: false }));
    setStatusMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      let finalLogoUrl = formData.logo_url;
      let finalFaviconUrl = formData.favicon_url;

      // 1. Upload Logo if new local file chosen
      if (logoFile) {
        const uploadRes = await apiService.uploadBrandingFile(logoFile, 'logo', formData.theme_color);
        finalLogoUrl = uploadRes.file_path;
      }

      // 2. Upload Favicon if new local file chosen
      if (faviconFile) {
        const uploadRes = await apiService.uploadBrandingFile(faviconFile, 'favicon', formData.theme_color);
        finalFaviconUrl = uploadRes.file_path;
      }

      // 3. Save profile updates with theme_color and local file paths
      await onUpdate({
        app_title: formData.app_title.trim() || 'Pusat Data Sekolah',
        theme_color: formData.theme_color,
        logo_url: finalLogoUrl,
        favicon_url: finalFaviconUrl,
      });

      // Update local state
      setFormData((prev) => ({
        ...prev,
        logo_url: finalLogoUrl,
        favicon_url: finalFaviconUrl,
      }));
      setLogoFile(null);
      setFaviconFile(null);

      setStatusMessage({
        type: 'success',
        text: 'Pengaturan portal, file gambar lokal, dan tema berhasil disimpan ke database!',
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menyimpan pengaturan identitas portal.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetToDefault = () => {
    setFormData({
      app_title: 'Pusat Data Sekolah',
      theme_color: 'indigo',
      logo_url: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=200&auto=format&fit=crop&q=80',
      favicon_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=64&auto=format&fit=crop&q=80',
    });
    setLogoFile(null);
    setFaviconFile(null);
    setLogoPreview('https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=200&auto=format&fit=crop&q=80');
    setFaviconPreview('https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=64&auto=format&fit=crop&q=80');
    setPreviewError({ logo: false, favicon: false });
  };

  const selectedTheme = THEME_OPTIONS.find((t) => t.id === formData.theme_color) || THEME_OPTIONS[0];

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60 dark:border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Pengaturan Identitas Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload file logo & favicon lokal, atur judul portal, dan sesuaikan palet warna tema utama dengan gaya Aqua Glass.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToDefault}
          className="px-3.5 py-2 bg-white/70 hover:bg-white dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-white/70 dark:border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset ke Default</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Configuration (7 cols) */}
        <div className="lg:col-span-7 backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 border border-white/70 dark:border-white/10 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="border-b border-white/60 dark:border-white/10 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Konfigurasi Branding & Visual</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upload logo dan favicon fisik ke direktori server lokal <code className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px]">/public/uploads/branding/</code>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Application Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Judul Utama Aplikasi (Application Title) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pusat Data Sekolah"
                value={formData.app_title}
                onChange={(e) => setFormData({ ...formData, app_title: e.target.value })}
                className="w-full h-10 px-3.5 bg-white/80 dark:bg-slate-900/80 border border-white/70 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium shadow-2xs"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                Tampil di Title Bar Browser, Navbar, Sidebar, dan Halaman Login.
              </span>
            </div>

            {/* Theme Color Picker / Swatches */}
            <div className="p-4 bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-white/70 dark:border-white/10 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Warna Tema Utama (Primary Theme)</span>
                </label>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {selectedTheme.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih aksen warna tema antarmuka aplikasi. Warna ini diterapkan reaktif ke seluruh elemen visual.
              </p>

              {/* Color Swatches Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = formData.theme_color === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, theme_color: theme.id })}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer text-center ${
                        isSelected
                          ? `bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-400 ring-2 ${theme.ringClass} shadow-xs`
                          : 'bg-white/80 dark:bg-slate-800/80 border-white/60 dark:border-white/10 hover:bg-white dark:hover:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full ${theme.bgClass} flex items-center justify-center text-white shadow-sm transition-transform ${
                          isSelected ? 'scale-110' : 'group-hover:scale-105'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        {theme.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Local Logo File Upload */}
            <div className="p-4 bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-white/70 dark:border-white/10 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Upload Logo Institusi (File Fisik)</span>
                </label>
                {formData.logo_url && (
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                    {formData.logo_url.startsWith('/uploads/') ? '● File Lokal Server' : '○ URL Eksternal'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Logo Preview box */}
                <div className="w-16 h-16 rounded-2xl border border-white/70 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {logoPreview && !previewError.logo ? (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      onError={() => setPreviewError((prev) => ({ ...prev, logo: true }))}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Sparkles className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3.5 py-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-white/60 dark:border-white/10"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{logoFile ? 'Ganti File Logo Terpilih' : 'Pilih File Logo dari Komputer'}</span>
                  </button>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {logoFile ? (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        File baru: {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                      </span>
                    ) : (
                      <span>Format PNG, JPG, WebP, SVG transparan. Maks. 5MB.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Local Favicon File Upload */}
            <div className="p-4 bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-white/70 dark:border-white/10 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Upload Favicon Browser (.ico / .png)</span>
                </label>
                {formData.favicon_url && (
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                    {formData.favicon_url.startsWith('/uploads/') ? '● File Lokal Server' : '○ URL Eksternal'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Favicon Preview box */}
                <div className="w-12 h-12 rounded-xl border border-white/70 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {faviconPreview && !previewError.favicon ? (
                    <img
                      src={faviconPreview}
                      alt="Favicon Preview"
                      onError={() => setPreviewError((prev) => ({ ...prev, favicon: true }))}
                      className="w-7 h-7 object-contain"
                    />
                  ) : (
                    <Globe className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/*,.ico"
                    onChange={handleFaviconFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    className="px-3.5 py-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-white/60 dark:border-white/10"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{faviconFile ? 'Ganti File Favicon' : 'Pilih File Favicon (.ico/.png)'}</span>
                  </button>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {faviconFile ? (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        File baru: {faviconFile.name} ({(faviconFile.size / 1024).toFixed(1)} KB)
                      </span>
                    ) : (
                      <span>Ikon kecil untuk tab browser (rekomendasi 32x32 atau 64x64).</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-3 border-t border-white/60 dark:border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Disimpan ke: public/uploads/branding/
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Menyimpan & Mengunggah...' : 'Terapkan & Simpan Identitas'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Live Preview Card */}
          <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 border border-white/70 dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-white/60 dark:border-white/10">
              <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Simulasi Pratinjau Identitas Real-Time</span>
            </h4>

            {/* Browser Tab Simulation */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Tab Browser:</span>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-white/60 dark:border-white/10 shadow-xs">
                {faviconPreview && !previewError.favicon ? (
                  <img
                    src={faviconPreview}
                    alt="Favicon"
                    onError={() => setPreviewError((prev) => ({ ...prev, favicon: true }))}
                    className="w-4 h-4 rounded object-cover"
                  />
                ) : (
                  <div className={`w-4 h-4 rounded ${selectedTheme.bgClass} text-white text-[9px] font-bold flex items-center justify-center`}>
                    P
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {formData.app_title || 'Pusat Data Sekolah'} - SMK Negeri 1
                </span>
              </div>
            </div>

            {/* Header Brand Simulation */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Header Navigasi (macOS Style):</span>
              <div className="flex items-center gap-3 p-3 bg-white/70 dark:bg-slate-900/80 rounded-xl border border-white/60 dark:border-white/10 text-slate-800 dark:text-white shadow-xs">
                {logoPreview && !previewError.logo ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    onError={() => setPreviewError((prev) => ({ ...prev, logo: true }))}
                    className="w-9 h-9 rounded-xl object-cover border border-white/60 dark:border-slate-700 shrink-0"
                  />
                ) : (
                  <div className={`w-9 h-9 rounded-xl ${selectedTheme.bgClass} flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm truncate">{formData.app_title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 uppercase">
                      {selectedTheme.id}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    {profile?.school_name || 'SMK Negeri 1 Indonesia Maju'}
                  </span>
                </div>
              </div>
            </div>

            {/* Accent Theme Badge Preview */}
            <div className="p-3.5 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-white/60 dark:border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 block">
                Komponen Beraksen Tema ({selectedTheme.name}):
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${selectedTheme.bgClass}`}>
                  Primary Button
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedTheme.textClass} bg-white/60 dark:bg-slate-800 border-current`}>
                  Status Badge
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {selectedTheme.hex}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
