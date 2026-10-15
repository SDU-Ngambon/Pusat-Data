import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
  Sliders,
  LogOut,
  User,
  ChevronDown,
  Sun,
  Moon,
  Sparkles,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { SchoolProfile, AdminUser, ActiveTab } from '../types/index.js';

interface NavbarProps {
  profile: SchoolProfile | null;
  currentUser: AdminUser | null;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  currentUser,
  isSidebarCollapsed,
  onToggleSidebar,
  onNavigateTab,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isHoveredTraffic, setIsHoveredTraffic] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const appTitle = profile?.app_title || 'Pusat Data Sekolah';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="relative z-30 px-4 py-2.5 flex items-center justify-between select-none backdrop-blur-2xl bg-white/55 dark:bg-slate-900/60 border-b border-white/70 dark:border-white/10 transition-colors duration-300">
      {/* Left: Classic macOS Aqua Traffic Lights + Window Title */}
      <div className="flex items-center space-x-3.5">
        {/* macOS Aqua 3 Traffic Light Buttons */}
        <div
          className="flex items-center space-x-2 px-1 py-1 group/traffic cursor-pointer"
          onMouseEnter={() => setIsHoveredTraffic(true)}
          onMouseLeave={() => setIsHoveredTraffic(false)}
          title="macOS Window Controls"
        >
          {/* Close / Return to Dashboard */}
          <button
            type="button"
            onClick={() => onNavigateTab('dashboard')}
            className="w-3.5 h-3.5 rounded-full traffic-light-close flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            title="Tutup / Beranda"
          >
            {isHoveredTraffic && (
              <span className="text-[9px] font-black leading-none text-red-950 opacity-80">✕</span>
            )}
          </button>

          {/* Minimize / Toggle Sidebar */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="w-3.5 h-3.5 rounded-full traffic-light-minimize flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            title="Minimize / Ciutkan Sidebar"
          >
            {isHoveredTraffic && (
              <span className="text-[9px] font-black leading-none text-amber-950 opacity-80">−</span>
            )}
          </button>

          {/* Zoom / Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-3.5 h-3.5 rounded-full traffic-light-zoom flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            title="Layar Penuh (Zoom)"
          >
            {isHoveredTraffic && (
              <span className="text-[8px] font-black leading-none text-emerald-950 opacity-80">＋</span>
            )}
          </button>
        </div>

        {/* Tab pill with Aqua glass effect & Deep midnight slate text */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 shadow-xs text-xs font-bold text-slate-950 dark:text-white">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-xs" />
          <span className="truncate max-w-[190px]">{appTitle}</span>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold px-1.5 py-0.2 bg-slate-200/60 dark:bg-slate-900/60 rounded">
            v1.2 Aqua
          </span>
        </div>
      </div>

      {/* Center: macOS Safari-style Unified Search / URL Pill */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4">
        <div className="w-full bg-white/60 dark:bg-slate-950/60 border border-white/80 dark:border-white/10 rounded-full px-4 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold flex items-center justify-center gap-2 shadow-xs">
          <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-mono text-[11px] truncate tracking-tight text-slate-800 dark:text-slate-200">
            https://pusatdata.sekolah.sch.id
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-extrabold uppercase tracking-wider ml-1 border border-emerald-500/30">
            SSOT Active
          </span>
        </div>
      </div>

      {/* Right: Theme Toggle (Dark/Light) + School Info + Admin Dropdown */}
      <div className="flex items-center space-x-2.5">
        {/* Dark / Light Mode Toggle Button */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl bg-white/70 hover:bg-white dark:bg-slate-800/70 dark:hover:bg-slate-700/80 border border-white/80 dark:border-white/10 text-slate-900 dark:text-amber-400 transition-all cursor-pointer shadow-xs active:scale-95"
          title={isDarkMode ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-slate-900 animate-in spin-in-180 duration-300" />
          )}
        </button>

        {/* School Info Header */}
        <div className="hidden lg:block text-right pr-1">
          <span className="text-xs font-black text-slate-950 dark:text-white block truncate max-w-[190px]">
            {profile?.school_name || 'SMK Negeri 1 Indonesia'}
          </span>
          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-mono font-bold block">
            NPSN: {profile?.npsn || '20109988'} • {profile?.accreditation || 'Akreditasi A'}
          </span>
        </div>

        {/* Admin Account Button & Glass Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/70 hover:bg-white dark:bg-slate-800/70 dark:hover:bg-slate-700/80 border border-white/80 dark:border-white/10 text-xs text-slate-950 dark:text-white font-bold transition-all cursor-pointer shadow-xs"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-[11px] shadow-xs">
              {currentUser?.full_name?.charAt(0) || 'A'}
            </div>
            <span className="hidden sm:inline-block font-extrabold text-xs">
              {currentUser?.username || 'admin'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 transition-transform duration-200" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 backdrop-blur-2xl bg-white/95 dark:bg-slate-800/95 border border-white/80 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs text-slate-900 dark:text-slate-100 font-semibold">
              <div className="px-3 py-2 border-b border-slate-200/80 dark:border-slate-700/80">
                <p className="font-extrabold text-slate-950 dark:text-white truncate">
                  {currentUser?.full_name || 'Administrator'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold">
                    SUPER_ADMIN • SSOT
                  </span>
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab('account-settings');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100/90 dark:hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer font-bold"
                >
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Pengaturan Akun</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab('portal-settings');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100/90 dark:hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer font-bold"
                >
                  <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Pengaturan Portal</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3 py-2 text-left rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
