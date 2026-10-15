import React, { useState } from 'react';
import {
  LayoutDashboard,
  School,
  Layers,
  GraduationCap,
  Users,
  BookOpen,
  KeyRound,
  Terminal,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sliders,
  HardDrive,
  UserCog,
  Sparkles,
  LogOut,
  MoreVertical,
} from 'lucide-react';
import { ActiveTab, AdminUser, SchoolProfile } from '../types/index.js';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  currentUser?: AdminUser | null;
  profile?: SchoolProfile | null;
  onLogout?: () => void;
  counts?: {
    students: number;
    teachers: number;
    classes: number;
    subjects: number;
    clients: number;
  };
}

interface MenuItemDef {
  id: ActiveTab;
  label: string;
  icon: any;
  badge?: string | number | null;
  highlight?: boolean;
  section: 'MAIN MENU' | 'MASTER DATA' | 'INTEGRASI SATELIT' | 'PENGATURAN UMUM';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  onToggleCollapse,
  currentUser,
  profile,
  onLogout,
  counts,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoImgError, setLogoImgError] = useState(false);

  const menuItems: MenuItemDef[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      section: 'MAIN MENU',
    },
    {
      id: 'profile',
      label: 'Profil Sekolah',
      icon: School,
      badge: null,
      section: 'MASTER DATA',
    },
    {
      id: 'students',
      label: 'Data Siswa',
      icon: GraduationCap,
      badge: counts?.students,
      section: 'MASTER DATA',
    },
    {
      id: 'teachers',
      label: 'Data Guru & Tendik',
      icon: Users,
      badge: counts?.teachers,
      section: 'MASTER DATA',
    },
    {
      id: 'subjects',
      label: 'Data Mata Pelajaran',
      icon: BookOpen,
      badge: counts?.subjects,
      section: 'MASTER DATA',
    },
    {
      id: 'classes',
      label: 'Rombongan Belajar',
      icon: Layers,
      badge: counts?.classes,
      section: 'MASTER DATA',
    },
    {
      id: 'clients',
      label: 'Klien Satelit (API)',
      icon: KeyRound,
      badge: counts?.clients,
      highlight: true,
      section: 'INTEGRASI SATELIT',
    },
    {
      id: 'api-docs',
      label: 'Dokumentasi API',
      icon: Terminal,
      badge: 'Live',
      section: 'INTEGRASI SATELIT',
    },
    {
      id: 'logs',
      label: 'Log Akses Satelit',
      icon: Activity,
      badge: 'Audit',
      section: 'INTEGRASI SATELIT',
    },
    {
      id: 'portal-settings',
      label: 'Pengaturan Portal',
      icon: Sliders,
      badge: null,
      section: 'PENGATURAN UMUM',
    },
    {
      id: 'database',
      label: 'Database',
      icon: HardDrive,
      badge: 'SSOT',
      section: 'PENGATURAN UMUM',
    },
    {
      id: 'account-settings',
      label: 'Pengaturan Akun',
      icon: UserCog,
      badge: null,
      section: 'PENGATURAN UMUM',
    },
  ];

  const sections: ('MAIN MENU' | 'MASTER DATA' | 'INTEGRASI SATELIT' | 'PENGATURAN UMUM')[] = [
    'MAIN MENU',
    'MASTER DATA',
    'INTEGRASI SATELIT',
    'PENGATURAN UMUM',
  ];

  const appTitle = profile?.app_title || 'Pusat Data';

  return (
    <aside
      className={`shrink-0 flex flex-col justify-between transition-all duration-300 ease-in-out select-none backdrop-blur-2xl bg-white/50 dark:bg-slate-900/55 border-r border-white/70 dark:border-white/10 ${
        isCollapsed ? 'w-20 p-2.5' : 'w-64 p-4'
      }`}
    >
      <div className="space-y-4 overflow-y-auto overflow-x-hidden pr-1">
        {/* macOS Traffic Lights accent bar inside sidebar */}
        <div className="flex items-center justify-between px-1 pt-0.5">
          <div className="flex items-center space-x-1.5" title="macOS Window Controls">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-xs inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-xs inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-xs inline-block" />
          </div>
          {!isCollapsed && (
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              macOS Aqua
            </span>
          )}
        </div>

        {/* Brand Header with Logo & Modern Top Collapsible Toggle */}
        {isCollapsed ? (
          /* Collapsed View: Logo centered with Chevron button below it without overlap */
          <div className="flex flex-col items-center gap-2.5 pt-1 pb-2 border-b border-white/50 dark:border-white/10">
            <div
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0 overflow-hidden border border-white/60 dark:border-white/20 p-0.5"
              title={appTitle}
            >
              {profile?.logo_url && !logoImgError ? (
                <img
                  src={profile.logo_url}
                  alt="Logo"
                  onError={() => setLogoImgError(true)}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Sparkles className="w-5 h-5 fill-white" />
              )}
            </div>

            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/80 dark:border-white/10 shadow-xs hover:scale-105 active:scale-95"
                title="Buka Menu Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* Expanded View: Logo + App Title on Left, Modern Chevron button on Right */
          <div className="flex items-center justify-between px-1 pt-1 pb-2 border-b border-white/50 dark:border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0 overflow-hidden border border-white/60 dark:border-white/20 p-0.5">
                {profile?.logo_url && !logoImgError ? (
                  <img
                    src={profile.logo_url}
                    alt="Logo"
                    onError={() => setLogoImgError(true)}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Sparkles className="w-4 h-4 fill-white" />
                )}
              </div>
              <div className="min-w-0">
                <span className="font-black text-sm tracking-tight text-slate-950 dark:text-white block truncate leading-tight">
                  {appTitle}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold tracking-wider block">
                  SSOT HUB
                </span>
              </div>
            </div>

            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1.5 rounded-xl bg-white/70 hover:bg-white dark:bg-slate-800/70 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer border border-white/80 dark:border-white/10 shadow-xs hover:scale-105 active:scale-95 shrink-0 ml-1"
                title="Ciutkan Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Menu Navigation */}
        <div className="space-y-3.5">
          {sections.map((section) => {
            const items = menuItems.filter((item) => item.section === section);
            return (
              <div key={section} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 mb-1 text-[10px] font-extrabold tracking-wider uppercase text-slate-600 dark:text-slate-400">
                    {section}
                  </div>
                )}

                {isCollapsed && (
                  <div className="w-full h-px bg-white/50 dark:bg-white/10 my-1.5" />
                )}

                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        title={isCollapsed ? `${item.label} (${item.section})` : item.label}
                        className={`w-full flex items-center rounded-xl text-xs transition-all duration-200 group cursor-pointer border ${
                          isCollapsed
                            ? 'justify-center p-2.5'
                            : 'justify-between px-3 py-2'
                        } ${
                          isActive
                            ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-extrabold shadow-md shadow-blue-500/25 border-white/30'
                            : 'border-transparent text-slate-700 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white hover:bg-white/70 dark:hover:bg-white/10 font-bold'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                            }`}
                          />
                          {!isCollapsed && (
                            <span className="truncate whitespace-nowrap text-xs">
                              {item.label}
                            </span>
                          )}
                        </div>

                        {!isCollapsed && (
                          <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                            {item.badge !== null && item.badge !== undefined && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                  isActive
                                    ? 'bg-white/25 text-white border border-white/30 shadow-xs'
                                    : item.highlight
                                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40'
                                    : 'bg-slate-200/80 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-white/10'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Small notification indicator if collapsed with badge */}
                        {isCollapsed && item.badge !== null && item.badge !== undefined && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 shadow-xs" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Profile Card at Sidebar Bottom */}
      <div className="pt-3 border-t border-white/50 dark:border-white/10 relative">
        <div
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={`flex items-center gap-2.5 p-2 rounded-2xl bg-white/60 hover:bg-white/90 dark:bg-white/5 dark:hover:bg-white/10 border border-white/70 dark:border-white/10 transition-all cursor-pointer shadow-xs ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {currentUser?.full_name?.charAt(0) || 'A'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 text-left">
                <span className="font-extrabold text-xs text-slate-950 dark:text-white block truncate leading-tight">
                  {currentUser?.full_name || 'Admin'}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 block truncate font-mono font-bold">
                  {currentUser?.username ? `@${currentUser.username}` : '@admin'}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <MoreVertical className="w-4 h-4 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0" />
          )}
        </div>

        {/* User Dropdown Menu */}
        {userMenuOpen && (
          <div className="absolute bottom-16 left-2 right-2 backdrop-blur-2xl bg-white/95 dark:bg-slate-800/95 border border-white/80 dark:border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 text-xs text-slate-900 dark:text-slate-100 font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('account-settings');
                setUserMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100/90 dark:hover:bg-white/10 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <UserCog className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Pengaturan Akun</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('portal-settings');
                setUserMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100/90 dark:hover:bg-white/10 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Pengaturan Portal</span>
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  onLogout();
                }}
                className="w-full px-3 py-2 text-left rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 cursor-pointer border-t border-slate-200/70 dark:border-slate-700/60 mt-1 font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar (Logout)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
