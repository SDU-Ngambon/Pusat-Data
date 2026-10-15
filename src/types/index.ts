export interface SchoolProfile {
  npsn: string;
  school_name: string;
  app_title?: string;
  portal_tagline?: string;
  theme_color?: 'indigo' | 'blue' | 'rose' | 'emerald' | 'slate' | string;
  address: string;
  headmaster_name: string;
  headmaster_nip: string;
  logo_url: string;
  favicon_url: string;
  accreditation: string;
  telephone: string;
  email: string;
  website: string;
  updated_at: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'profile'
  | 'classes'
  | 'students'
  | 'teachers'
  | 'subjects'
  | 'clients'
  | 'api-docs'
  | 'logs'
  | 'portal-settings'
  | 'database'
  | 'account-settings';

export type GradeLevel = 10 | 11 | 12;

export interface AcademicClass {
  id: string;
  class_name: string; // e.g. "10 TKR 1" (UNIQUE)
  grade_level: GradeLevel;
  department: string; // TKR, TITL, TP, TKJ, APHP, dll
  homeroom_teacher_name?: string | null;
  status: 'AKTIF' | 'NONAKTIF';
  academic_year?: string;
  capacity?: number;
  updated_at: string;
}

export type StudentStatus = 'AKTIF' | 'MUTASI' | 'LULUS';
export type Gender = 'L' | 'P';

export interface Student {
  id: string;
  nisn: string; // VARCHAR(20), UNIQUE, INDEXED
  nis: string; // VARCHAR(25)
  full_name: string;
  gender: Gender;
  class_name: string; // Nama rombel riil, e.g. '10 TKR 1'
  cohort_year: string; // Angkatan, e.g. '2026'
  qr_code: string; // Nilai barcode/QR presensi (UNIQUE, default = nisn)
  status: StudentStatus;
  photo_url?: string | null;
  birth_place?: string;
  birth_date?: string;
  parent_phone?: string;
  updated_at: string;
}

export type EmploymentStatus = 'PNS' | 'PPPK' | 'Non-PNS';

export interface Teacher {
  id: string;
  nip: string | null; // VARCHAR(50), NULL if '-' or empty
  full_name: string;
  whatsapp: string; // Format 08xx
  employment_status: EmploymentStatus;
  homeroom_class: string | null; // Nama rombel binaan
  subject_specialization?: string | null;
  is_active: boolean;
  updated_at: string;
}

export type CurriculumGroup = 'Kejuruan' | 'Umum' | 'Muatan Lokal';

export interface Subject {
  id: string;
  kode_mapel: string; // UNIQUE
  nama_mapel: string;
  kelompok: CurriculumGroup;
  keterangan: string;
  hours_per_week?: number;
  updated_at: string;
}

export type ApiScope =
  | 'read:students'
  | 'read:teachers'
  | 'read:classes'
  | 'read:subjects'
  | 'read:profile';

export type ApiClientStatus = 'Aktif' | 'Nonaktif';

export interface ApiClient {
  id: string;
  client_name: string;
  api_key: string; // Bearer token (sk_live_...)
  allowed_scopes: ApiScope[];
  status: ApiClientStatus;
  description?: string;
  created_at: string;
  last_accessed_at: string | null;
  total_requests: number;
}

export interface ApiAccessLog {
  id: string;
  timestamp: string;
  client_id?: string;
  client_name: string;
  endpoint: string;
  method: string;
  status_code: number;
  duration_ms: number;
  ip_address: string;
  user_agent: string;
  details?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  role: string;
}

export interface SyncResponse<T> {
  success: boolean;
  timestamp: string;
  data_count?: number;
  data?: T;
  error?: string;
}
