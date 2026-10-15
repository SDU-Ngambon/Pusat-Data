import {
  SchoolProfile,
  AcademicClass,
  Student,
  Teacher,
  Subject,
  ApiClient,
  ApiAccessLog,
  AdminUser,
  SyncResponse,
} from '../types/index.js';

const API_BASE = '/api';

export const apiService = {
  // Admin Authentication
  async loginAdmin(username: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Login gagal.');
    return { token: data.token, user: data.user };
  },

  async getAdminAccount(): Promise<AdminUser> {
    const res = await fetch(`${API_BASE}/admin/account`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memuat akun admin');
    return data.data;
  },

  async updateAdminAccount(payload: {
    current_password: string;
    new_username?: string;
    new_password?: string;
    full_name?: string;
  }): Promise<AdminUser> {
    const res = await fetch(`${API_BASE}/admin/account`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memperbarui kredensial admin');
    return data.data;
  },

  // Overview
  async getOverview(): Promise<{
    profile: SchoolProfile;
    counts: {
      total_students: number;
      students_by_status: { aktif: number; lulus: number; pindah: number };
      total_teachers: number;
      teachers_by_employment: { pns: number; pppk: number; non_pns: number };
      total_classes: number;
      total_subjects: number;
      total_clients: number;
      clients_active: number;
    };
    recent_logs: ApiAccessLog[];
  }> {
    const res = await fetch(`${API_BASE}/admin/overview`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memuat ringkasan');
    return data.data;
  },

  // School Profile
  async getProfile(): Promise<SchoolProfile> {
    const res = await fetch(`${API_BASE}/admin/profile`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memuat profil sekolah');
    return data.data;
  },

  async updateProfile(profile: Partial<SchoolProfile>): Promise<SchoolProfile> {
    const res = await fetch(`${API_BASE}/admin/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memperbarui profil sekolah');
    return data.data;
  },

  async uploadBrandingFile(file: File, type: 'logo' | 'favicon', themeColor?: string): Promise<{ success: boolean; file_path: string; filename: string; profile?: SchoolProfile }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (themeColor) {
      formData.append('theme_color', themeColor);
    }

    const res = await fetch(`${API_BASE}/v1/settings/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gagal mengunggah file gambar ke server');
    }
    return data;
  },

  // Classes
  async getClasses(): Promise<(AcademicClass & { student_count: number; homeroom_teacher: string | null })[]> {
    const res = await fetch(`${API_BASE}/admin/classes`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memuat data rombel');
    return data.data;
  },

  async createClass(payload: Omit<AcademicClass, 'id' | 'updated_at'>): Promise<AcademicClass> {
    const res = await fetch(`${API_BASE}/admin/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menambahkan rombel');
    return data.data;
  },

  async updateClass(id: string, payload: Partial<AcademicClass>): Promise<AcademicClass> {
    const res = await fetch(`${API_BASE}/admin/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memperbarui rombel');
    return data.data;
  },

  async deleteClass(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/classes/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menghapus rombel');
  },

  // Students
  async getStudents(filters?: { class_id?: string; status?: string }): Promise<(Student & { class_name?: string })[]> {
    const params = new URLSearchParams();
    if (filters?.class_id) params.append('class_id', filters.class_id);
    if (filters?.status) params.append('status', filters.status);

    const res = await fetch(`${API_BASE}/admin/students?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memuat data siswa');
    return data.data;
  },

  async createStudent(payload: Omit<Student, 'id' | 'updated_at'>): Promise<Student> {
    const res = await fetch(`${API_BASE}/admin/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menambahkan siswa');
    return data.data;
  },

  async updateStudent(id: string, payload: Partial<Student>): Promise<Student> {
    const res = await fetch(`${API_BASE}/admin/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memperbarui siswa');
    return data.data;
  },

  async deleteStudent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/students/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menghapus siswa');
  },

  async bulkImportStudents(items: any[]): Promise<{ imported_count: number; failed_count: number; errors: string[]; message: string }> {
    const res = await fetch(`${API_BASE}/admin/students/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal import siswa');
    return data;
  },

  // Teachers
  async getTeachers(): Promise<(Teacher & { homeroom_class_name?: string | null })[]> {
    const res = await fetch(`${API_BASE}/admin/teachers`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memuat data guru');
    return data.data;
  },

  async createTeacher(payload: Omit<Teacher, 'id' | 'updated_at'>): Promise<Teacher> {
    const res = await fetch(`${API_BASE}/admin/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menambahkan guru');
    return data.data;
  },

  async updateTeacher(id: string, payload: Partial<Teacher>): Promise<Teacher> {
    const res = await fetch(`${API_BASE}/admin/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memperbarui data guru');
    return data.data;
  },

  async deleteTeacher(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/teachers/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menghapus guru');
  },

  async bulkImportTeachers(items: any[]): Promise<{ imported_count: number; failed_count: number; errors: string[]; message: string }> {
    const res = await fetch(`${API_BASE}/admin/teachers/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal import data guru');
    return data;
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const res = await fetch(`${API_BASE}/admin/subjects`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memuat mata pelajaran');
    return data.data;
  },

  async createSubject(payload: Omit<Subject, 'id' | 'updated_at'>): Promise<Subject> {
    const res = await fetch(`${API_BASE}/admin/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menambahkan mata pelajaran');
    return data.data;
  },

  async updateSubject(id: string, payload: Partial<Subject>): Promise<Subject> {
    const res = await fetch(`${API_BASE}/admin/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memperbarui mata pelajaran');
    return data.data;
  },

  async deleteSubject(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/subjects/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menghapus mata pelajaran');
  },

  async bulkImportSubjects(items: any[]): Promise<{ imported_count: number; failed_count: number; errors: string[]; message: string }> {
    const res = await fetch(`${API_BASE}/admin/subjects/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal import mata pelajaran');
    return data;
  },

  // API Clients
  async getApiClients(): Promise<ApiClient[]> {
    const res = await fetch(`${API_BASE}/admin/clients`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memuat klien API');
    return data.data;
  },

  async createApiClient(payload: {
    client_name: string;
    allowed_scopes: string[];
    status: 'Aktif' | 'Nonaktif';
    description?: string;
  }): Promise<ApiClient> {
    const res = await fetch(`${API_BASE}/admin/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal membuat klien API');
    return data.data;
  },

  async updateApiClient(id: string, payload: Partial<ApiClient>): Promise<ApiClient> {
    const res = await fetch(`${API_BASE}/admin/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal mengupdate klien API');
    return data.data;
  },

  async regenerateClientKey(id: string): Promise<ApiClient> {
    const res = await fetch(`${API_BASE}/admin/clients/${id}/regenerate-key`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal generate token baru');
    return data.data;
  },

  async deleteApiClient(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/clients/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menghapus klien API');
  },

  // Logs
  async getLogs(limit = 100): Promise<ApiAccessLog[]> {
    const res = await fetch(`${API_BASE}/admin/logs?limit=${limit}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memuat log akses');
    return data.data;
  },

  // System
  async resetSystem(): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/system/reset`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal reset data sistem');
  },

  async restoreSystem(backup: any): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/system/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backup }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Gagal merestore data backup');
  },

  async exportBackup(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/system/backup`);
    const data = await res.json();
    return data;
  },

  // Public Satellite Sync API direct tester execution
  async executeSatelliteRequest(
    endpoint: string,
    token: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<{ status: number; duration: number; response: any }> {
    const startTime = performance.now();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token.trim()}`;
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const duration = Math.round(performance.now() - startTime);
      let responseData: any;
      try {
        responseData = await res.json();
      } catch {
        responseData = { error: 'Invalid JSON response received' };
      }
      return {
        status: res.status,
        duration,
        response: responseData,
      };
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      return {
        status: 0,
        duration,
        response: {
          success: false,
          error: `Network Error: ${err.message}`,
        },
      };
    }
  },
};
