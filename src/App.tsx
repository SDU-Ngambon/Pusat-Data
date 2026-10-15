/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { DashboardView } from './components/DashboardView.js';
import { SchoolProfileView } from './components/SchoolProfileView.js';
import { ClassesView } from './components/ClassesView.js';
import { StudentsView } from './components/StudentsView.js';
import { TeachersView } from './components/TeachersView.js';
import { SubjectsView } from './components/SubjectsView.js';
import { ApiClientsView } from './components/ApiClientsView.js';
import { ApiDocumentationView } from './components/ApiDocumentationView.js';
import { LogsView } from './components/LogsView.js';
import { LoginView } from './components/LoginView.js';
import { PortalSettingsView } from './components/PortalSettingsView.js';
import { DatabaseView } from './components/DatabaseView.js';
import { AccountSettingsView } from './components/AccountSettingsView.js';
import { apiService } from './services/api.js';
import {
  SchoolProfile,
  AcademicClass,
  Student,
  Teacher,
  Subject,
  ApiClient,
  ApiAccessLog,
  AdminUser,
  ActiveTab,
} from './types/index.js';

export default function App() {
  // Auth state
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('pds_admin_token');
  });
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('pds_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('pds_sidebar_collapsed');
    return saved === 'true';
  });
  const [loading, setLoading] = useState(true);

  // Core Data
  const [overview, setOverview] = useState<any>(null);
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [classes, setClasses] = useState<(AcademicClass & { student_count: number; homeroom_teacher: string | null })[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [logs, setLogs] = useState<ApiAccessLog[]>([]);

  // Selected client for interactive testing
  const [testTargetClient, setTestTargetClient] = useState<ApiClient | null>(null);

  // Theme Dark/Light Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('pds_theme_mode');
    if (saved) return saved === 'dark';
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pds_theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pds_theme_mode', 'light');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Toggle Sidebar
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('pds_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Reactive Title & Favicon binding
  useEffect(() => {
    const appTitle = profile?.app_title || 'Pusat Data Sekolah';
    const schoolName = profile?.school_name ? ` - ${profile.school_name}` : '';
    document.title = `${appTitle}${schoolName}`;

    if (profile?.favicon_url) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = profile.favicon_url;
    }
  }, [profile]);

  // Auth Handlers
  const handleLogin = async (username: string, pass: string) => {
    try {
      const res = await apiService.loginAdmin(username, pass);
      setAuthToken(res.token);
      setCurrentUser(res.user);
      localStorage.setItem('pds_admin_token', res.token);
      localStorage.setItem('pds_admin_user', JSON.stringify(res.user));
      toast.success(`Selamat datang, ${res.user.full_name}! Login berhasil.`);
      return res;
    } catch (err: any) {
      toast.error(err.message || 'Login gagal. Periksa kembali username & password.');
      throw err;
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('pds_admin_token');
    localStorage.removeItem('pds_admin_user');
    toast.info('Anda telah keluar dari portal admin Pusat Data Sekolah.');
  };

  const handleUpdateAdminAccount = async (payload: {
    current_password: string;
    new_username?: string;
    new_password?: string;
    full_name?: string;
  }) => {
    try {
      const updated = await apiService.updateAdminAccount(payload);
      setCurrentUser(updated);
      localStorage.setItem('pds_admin_user', JSON.stringify(updated));
      toast.success('Kredensial dan profil admin berhasil diperbarui!');
      return updated;
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui kredensial');
      throw err;
    }
  };

  // Fetch all core datasets
  const fetchData = useCallback(async () => {
    if (!authToken) return;
    try {
      setLoading(true);
      const [
        overviewData,
        classesData,
        studentsData,
        teachersData,
        subjectsData,
        clientsData,
        logsData,
      ] = await Promise.all([
        apiService.getOverview(),
        apiService.getClasses(),
        apiService.getStudents(),
        apiService.getTeachers(),
        apiService.getSubjects(),
        apiService.getApiClients(),
        apiService.getLogs(100),
      ]);

      setOverview(overviewData);
      setProfile(overviewData.profile);
      setClasses(classesData);
      setStudents(studentsData);
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setClients(clientsData);
      setLogs(logsData);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data dari server');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    if (authToken) {
      fetchData();
    }
  }, [authToken, fetchData]);

  // Synchronize document title, favicon, and theme color dynamically
  useEffect(() => {
    if (profile?.app_title) {
      document.title = `${profile.app_title} - SSOT Core Data Hub`;
    }
    if (profile?.favicon_url) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = profile.favicon_url;
    }
    if (profile?.theme_color) {
      document.documentElement.setAttribute('data-theme-color', profile.theme_color);
    }
  }, [profile?.app_title, profile?.favicon_url, profile?.theme_color]);

  // If not authenticated, render Login Portal
  if (!authToken || !currentUser) {
    return (
      <>
        <Toaster position="top-right" theme="light" richColors />
        <LoginView
          profile={profile}
          onLogin={handleLogin}
          onLoginSuccess={(token, user) => {
            setAuthToken(token);
            setCurrentUser(user);
          }}
        />
      </>
    );
  }

  // Profile / Portal Settings Update
  const handleUpdateProfile = async (data: Partial<SchoolProfile>) => {
    try {
      const updated = await apiService.updateProfile(data);
      setProfile(updated);
      toast.success('Pengaturan profil & identitas portal berhasil disimpan!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui pengaturan portal');
    }
  };

  // Classes
  const handleCreateClass = async (data: Omit<AcademicClass, 'id' | 'updated_at'>) => {
    try {
      await apiService.createClass(data);
      toast.success(`Rombel "${data.class_name}" berhasil ditambahkan!`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambah rombel');
      throw err;
    }
  };

  const handleUpdateClass = async (id: string, data: Partial<AcademicClass>) => {
    try {
      await apiService.updateClass(id, data);
      toast.success('Rombongan belajar berhasil diperbarui!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui rombel');
      throw err;
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await apiService.deleteClass(id);
      toast.success('Rombongan belajar berhasil dihapus!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus rombel');
      throw err;
    }
  };

  // Students
  const handleCreateStudent = async (data: Omit<Student, 'id' | 'updated_at'>) => {
    try {
      await apiService.createStudent(data);
      toast.success(`Siswa "${data.full_name}" berhasil ditambahkan!`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambah siswa');
      throw err;
    }
  };

  const handleUpdateStudent = async (id: string, data: Partial<Student>) => {
    try {
      await apiService.updateStudent(id, data);
      toast.success('Data siswa berhasil diperbarui!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui siswa');
      throw err;
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await apiService.deleteStudent(id);
      toast.success('Data siswa berhasil dihapus!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus siswa');
      throw err;
    }
  };

  const handleBulkImportStudents = async (items: any[]) => {
    try {
      const result = await apiService.bulkImportStudents(items);
      toast.success(`Import Excel Selesai: ${result.imported_count} siswa berhasil diproses.`);
      fetchData();
      return result;
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengimpor data siswa');
      throw err;
    }
  };

  // Teachers
  const handleCreateTeacher = async (data: Omit<Teacher, 'id' | 'updated_at'>) => {
    try {
      await apiService.createTeacher(data);
      toast.success(`Guru "${data.full_name}" berhasil ditambahkan!`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambah guru');
      throw err;
    }
  };

  const handleUpdateTeacher = async (id: string, data: Partial<Teacher>) => {
    try {
      await apiService.updateTeacher(id, data);
      toast.success('Data guru berhasil diperbarui!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui guru');
      throw err;
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      await apiService.deleteTeacher(id);
      toast.success('Data guru berhasil dihapus!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus guru');
      throw err;
    }
  };

  const handleBulkImportTeachers = async (items: any[]) => {
    try {
      const result = await apiService.bulkImportTeachers(items);
      toast.success(`Import Excel Selesai: ${result.imported_count} guru berhasil diproses.`);
      fetchData();
      return result;
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengimpor data guru');
      throw err;
    }
  };

  // Subjects
  const handleCreateSubject = async (data: Omit<Subject, 'id' | 'updated_at'>) => {
    try {
      await apiService.createSubject(data);
      toast.success(`Mata pelajaran "${data.nama_mapel}" berhasil ditambahkan!`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambah mata pelajaran');
      throw err;
    }
  };

  const handleUpdateSubject = async (id: string, data: Partial<Subject>) => {
    try {
      await apiService.updateSubject(id, data);
      toast.success('Mata pelajaran berhasil diperbarui!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui mata pelajaran');
      throw err;
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await apiService.deleteSubject(id);
      toast.success('Mata pelajaran berhasil dihapus!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus mata pelajaran');
      throw err;
    }
  };

  const handleBulkImportSubjects = async (items: any[]) => {
    try {
      const result = await apiService.bulkImportSubjects(items);
      toast.success(`Import Excel Selesai: ${result.imported_count} mata pelajaran berhasil diproses.`);
      fetchData();
      return result;
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengimpor mata pelajaran');
      throw err;
    }
  };

  // API Clients
  const handleCreateClient = async (data: {
    client_name: string;
    allowed_scopes: string[];
    status: 'Aktif' | 'Nonaktif';
    description?: string;
  }) => {
    try {
      await apiService.createApiClient(data);
      toast.success(`Klien API "${data.client_name}" berhasil didaftarkan!`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambah klien API');
      throw err;
    }
  };

  const handleUpdateClient = async (id: string, data: Partial<ApiClient>) => {
    try {
      await apiService.updateApiClient(id, data);
      toast.success('Kredensial Klien API berhasil diperbarui!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui klien API');
      throw err;
    }
  };

  const handleRegenerateKey = async (id: string) => {
    try {
      await apiService.regenerateClientKey(id);
      toast.success('API Key rahasia baru berhasil di-generate!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal me-regenerate API Key');
      throw err;
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await apiService.deleteApiClient(id);
      toast.success('Klien API berhasil dihapus!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus klien API');
      throw err;
    }
  };

  const handleTestClientInPlayground = (client: ApiClient) => {
    setTestTargetClient(client);
    setActiveTab('api-docs');
    toast.info(`Membuka API Tester dengan token "${client.client_name}"`);
  };

  // Reset to Seed (Database)
  const handleResetSystem = async () => {
    try {
      await apiService.resetSystem();
      toast.success('Database berhasil di-reset ke data bawaan awal (seed)!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal reset data database');
    }
  };

  // Restore Database from JSON
  const handleRestoreSystem = async (backupData: any) => {
    try {
      await apiService.restoreSystem(backupData);
      toast.success('Database berhasil dipulihkan dari arsip backup JSON!');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal merestore database');
    }
  };

  // Export JSON Backup (Full App Backup)
  const handleBackup = async () => {
    try {
      const backup = await apiService.exportBackup();
      const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonStr);
      downloadAnchor.setAttribute(
        'download',
        `backup_full_pusat_data_sekolah_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Backup Full Aplikasi (.json) berhasil diunduh!');
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat backup');
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-300 font-sans p-2 sm:p-4 lg:p-6 flex flex-col ${
        isDarkMode
          ? 'dark bg-gradient-to-br from-[#090d16] via-[#0c1322] to-[#11192e] text-slate-100'
          : 'bg-gradient-to-br from-[#e8f1f8] via-[#e2ecf5] to-[#ebf3fa] text-slate-900'
      }`}
    >
      {/* Fixed Ambient Background Orbs Layer for Real Glassmorphism Refraction */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Orb 1: Vibrant Ocean Blue (Top-Left / behind sidebar) */}
        <div className="absolute -top-[10%] -left-[5%] w-[580px] h-[580px] rounded-full bg-gradient-to-br from-blue-500/35 via-sky-400/30 to-transparent blur-[110px] dark:from-blue-600/30 dark:via-indigo-600/25" />
        {/* Orb 2: Bright Aqua / Turquoise (Top-Right / behind header & hero card) */}
        <div className="absolute top-[5%] -right-[8%] w-[640px] h-[640px] rounded-full bg-gradient-to-bl from-cyan-400/40 via-teal-400/30 to-transparent blur-[120px] dark:from-cyan-500/25 dark:via-blue-600/20" />
        {/* Orb 3: Soft Indigo & Purple (Bottom-Left / behind table) */}
        <div className="absolute -bottom-[12%] left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500/35 via-purple-500/25 to-transparent blur-[110px] dark:from-purple-600/30 dark:via-indigo-800/25" />
        {/* Orb 4: Fresh Emerald & Sky (Bottom-Right / center accent) */}
        <div className="absolute top-[45%] right-[22%] w-[450px] h-[450px] rounded-full bg-gradient-to-r from-teal-400/30 to-sky-400/25 blur-[100px] dark:from-sky-600/25 dark:to-teal-600/20" />
      </div>

      {/* Sonner Toast Container adapting to mode */}
      <Toaster position="top-right" theme={isDarkMode ? 'dark' : 'light'} richColors />

      {/* macOS Aqua Outer Window Card */}
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-[1750px] mx-auto backdrop-blur-2xl bg-white/55 dark:bg-slate-900/55 border border-white/80 dark:border-white/12 rounded-3xl shadow-[0_16px_50px_rgba(30,58,138,0.12)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.6)] overflow-hidden min-h-0 transition-colors duration-300">
        {/* macOS Aqua Window Header Nav */}
        <Navbar
          profile={profile}
          currentUser={currentUser}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />

        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* macOS Aqua Frosted Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => setActiveTab(tab)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
            currentUser={currentUser}
            profile={profile}
            onLogout={handleLogout}
            counts={{
              students: students.length,
              teachers: teachers.length,
              classes: classes.length,
              subjects: subjects.length,
              clients: clients.length,
            }}
          />

          {/* Frosted Canvas Area */}
          <div className="flex-1 p-2.5 sm:p-4 lg:p-5 flex flex-col min-w-0 overflow-hidden">
            <main className="flex-1 backdrop-blur-2xl bg-white/60 dark:bg-slate-900/50 border border-white/70 dark:border-white/10 rounded-2xl sm:rounded-[28px] shadow-xl p-5 sm:p-7 lg:p-8 overflow-y-auto min-w-0 text-slate-900 dark:text-slate-100 transition-colors duration-300">
              {loading && !overview ? (
                <div className="flex flex-col items-center justify-center min-h-[500px] space-y-3">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Memuat data referensi sekolah terpusat...
                  </p>
                </div>
              ) : (
              <>
              {/* UTAMA */}
              {activeTab === 'dashboard' && (
                <DashboardView
                  overview={overview}
                  setActiveTab={setActiveTab}
                  onOpenTester={() => setActiveTab('api-docs')}
                />
              )}

              {/* MASTER DATA */}
              {activeTab === 'profile' && (
                <SchoolProfileView
                  profile={profile}
                  onUpdate={handleUpdateProfile}
                />
              )}

              {activeTab === 'students' && (
                <StudentsView
                  students={students}
                  classes={classes}
                  schoolName={profile?.school_name || 'Sekolah'}
                  onCreate={handleCreateStudent}
                  onUpdate={handleUpdateStudent}
                  onDelete={handleDeleteStudent}
                  onBulkImport={handleBulkImportStudents}
                />
              )}

              {activeTab === 'teachers' && (
                <TeachersView
                  teachers={teachers}
                  classes={classes}
                  onCreate={handleCreateTeacher}
                  onUpdate={handleUpdateTeacher}
                  onDelete={handleDeleteTeacher}
                  onBulkImport={handleBulkImportTeachers}
                />
              )}

              {activeTab === 'subjects' && (
                <SubjectsView
                  subjects={subjects}
                  onCreate={handleCreateSubject}
                  onUpdate={handleUpdateSubject}
                  onDelete={handleDeleteSubject}
                  onBulkImport={handleBulkImportSubjects}
                />
              )}

              {activeTab === 'classes' && (
                <ClassesView
                  classes={classes}
                  students={students}
                  onCreate={handleCreateClass}
                  onUpdate={handleUpdateClass}
                  onDelete={handleDeleteClass}
                />
              )}

              {/* INTEGRASI SATELIT */}
              {activeTab === 'clients' && (
                <ApiClientsView
                  clients={clients}
                  onCreateClient={handleCreateClient}
                  onUpdateClient={handleUpdateClient}
                  onRegenerateKey={handleRegenerateKey}
                  onDeleteClient={handleDeleteClient}
                  onTestClient={handleTestClientInPlayground}
                />
              )}

              {activeTab === 'api-docs' && (
                <ApiDocumentationView
                  clients={clients}
                  classes={classes}
                  preselectedClient={testTargetClient}
                />
              )}

              {activeTab === 'logs' && (
                <LogsView
                  logs={logs}
                  onRefresh={() => {
                    fetchData();
                    toast.success('Log akses satelit berhasil disegarkan.');
                  }}
                />
              )}

              {/* PENGATURAN UMUM */}
              {activeTab === 'portal-settings' && (
                <PortalSettingsView
                  profile={profile}
                  onUpdate={handleUpdateProfile}
                />
              )}

              {activeTab === 'database' && (
                <DatabaseView
                  profile={profile}
                  classes={classes}
                  students={students}
                  teachers={teachers}
                  subjects={subjects}
                  clients={clients}
                  logs={logs}
                  onBackupFull={handleBackup}
                  onResetDatabase={handleResetSystem}
                  onRestoreDatabase={handleRestoreSystem}
                />
              )}

              {activeTab === 'account-settings' && (
                <AccountSettingsView
                  currentUser={currentUser}
                  onUpdateAccount={handleUpdateAdminAccount}
                />
              )}
            </>
          )}
        </main>
        </div>
      </div>
      </div>
    </div>
  );
}
