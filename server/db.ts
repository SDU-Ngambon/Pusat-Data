import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  SchoolProfile,
  AcademicClass,
  GradeLevel,
  Student,
  Teacher,
  Subject,
  ApiClient,
  ApiAccessLog,
  ApiScope,
} from '../src/types/index.js';
import {
  initialSchoolProfile,
  initialClasses,
  initialTeachers,
  initialSubjects,
  initialStudents,
  initialApiClients,
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'school_database.json');

export interface AdminUserRecord {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  role: string;
}

export const initialAdminUser: AdminUserRecord = {
  id: 'admin-001',
  username: 'admin',
  password_hash: 'admin123',
  full_name: 'Administrator Utama',
  role: 'SUPER_ADMIN',
};

export interface DatabaseSchema {
  school_profile: SchoolProfile;
  classes: AcademicClass[];
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  api_clients: ApiClient[];
  logs: ApiAccessLog[];
  admin_users: AdminUserRecord[];
}

let dbState: DatabaseSchema;

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const profile = parsed.school_profile ? {
        theme_color: 'indigo',
        ...initialSchoolProfile,
        ...parsed.school_profile,
      } : initialSchoolProfile;

      return {
        school_profile: profile,
        classes: parsed.classes || initialClasses,
        students: parsed.students || initialStudents,
        teachers: parsed.teachers || initialTeachers,
        subjects: parsed.subjects || initialSubjects,
        api_clients: parsed.api_clients || initialApiClients,
        logs: parsed.logs || [],
        admin_users: parsed.admin_users || [initialAdminUser],
      };
    }
  } catch (err) {
    console.error('Failed to load database from file, initializing defaults:', err);
  }

  const initial: DatabaseSchema = {
    school_profile: initialSchoolProfile,
    classes: initialClasses,
    students: initialStudents,
    teachers: initialTeachers,
    subjects: initialSubjects,
    api_clients: initialApiClients,
    logs: [
      {
        id: 'log-seed-01',
        timestamp: '2026-10-03T07:15:20.000Z',
        client_name: 'Aplikasi Presensi Siswa (Mobile Fingerprint & QR)',
        endpoint: '/api/v1/sync/students?class=10 TKR 1',
        method: 'GET',
        status_code: 200,
        duration_ms: 14,
        ip_address: '192.168.1.104',
        user_agent: 'PresensiApp-Mobile/2.4.1 (Android; Flutter)',
      },
    ],
    admin_users: [initialAdminUser],
  };

  saveDatabaseSync(initial);
  return initial;
}

function saveDatabaseSync(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('Failed to save database to file:', err);
  }
}

dbState = loadDatabase();

export const db = {
  // Database backup / reset
  getRawData(): DatabaseSchema {
    return dbState;
  },

  resetToSeed(): void {
    dbState = {
      school_profile: JSON.parse(JSON.stringify(initialSchoolProfile)),
      classes: JSON.parse(JSON.stringify(initialClasses)),
      students: JSON.parse(JSON.stringify(initialStudents)),
      teachers: JSON.parse(JSON.stringify(initialTeachers)),
      subjects: JSON.parse(JSON.stringify(initialSubjects)),
      api_clients: JSON.parse(JSON.stringify(initialApiClients)),
      logs: [],
      admin_users: [JSON.parse(JSON.stringify(initialAdminUser))],
    };
    saveDatabaseSync(dbState);
  },

  importDatabase(imported: Partial<DatabaseSchema>): void {
    if (imported.school_profile) dbState.school_profile = imported.school_profile;
    if (Array.isArray(imported.classes)) dbState.classes = imported.classes;
    if (Array.isArray(imported.students)) dbState.students = imported.students;
    if (Array.isArray(imported.teachers)) dbState.teachers = imported.teachers;
    if (Array.isArray(imported.subjects)) dbState.subjects = imported.subjects;
    if (Array.isArray(imported.api_clients)) dbState.api_clients = imported.api_clients;
    if (Array.isArray(imported.admin_users)) dbState.admin_users = imported.admin_users;
    saveDatabaseSync(dbState);
  },

  // ADMIN AUTHENTICATION
  getAdminUser(): AdminUserRecord {
    if (!dbState.admin_users || dbState.admin_users.length === 0) {
      dbState.admin_users = [initialAdminUser];
      saveDatabaseSync(dbState);
    }
    return dbState.admin_users[0];
  },

  validateAdminLogin(username: string, password: string): AdminUserRecord | null {
    const admin = db.getAdminUser();
    if (admin.username.toLowerCase() === username.trim().toLowerCase() && admin.password_hash === password) {
      return admin;
    }
    return null;
  },

  updateAdminUser(data: { username?: string; password?: string; full_name?: string }): AdminUserRecord {
    const admin = db.getAdminUser();
    if (data.username && data.username.trim()) {
      // check unique username
      admin.username = data.username.trim();
    }
    if (data.password && data.password.trim()) {
      admin.password_hash = data.password.trim();
    }
    if (data.full_name && data.full_name.trim()) {
      admin.full_name = data.full_name.trim();
    }
    dbState.admin_users[0] = admin;
    saveDatabaseSync(dbState);
    return admin;
  },

  // SCHOOL PROFILE
  getSchoolProfile(): SchoolProfile {
    return dbState.school_profile;
  },

  updateSchoolProfile(profile: Partial<SchoolProfile>): SchoolProfile {
    dbState.school_profile = {
      ...dbState.school_profile,
      ...profile,
      updated_at: new Date().toISOString(),
    };
    saveDatabaseSync(dbState);
    return dbState.school_profile;
  },

  // ACADEMIC CLASSES
  getClasses(): (AcademicClass & { student_count: number; homeroom_teacher: string | null })[] {
    const teacherMap = new Map<string, string>();
    dbState.teachers.forEach((t) => {
      if (t.homeroom_class) {
        teacherMap.set(t.homeroom_class.toLowerCase(), t.full_name);
      }
    });

    const studentCounts = new Map<string, number>();
    dbState.students.forEach((s) => {
      if (s.status === 'AKTIF' && s.class_name) {
        const key = s.class_name.toLowerCase();
        studentCounts.set(key, (studentCounts.get(key) || 0) + 1);
      }
    });

    return dbState.classes.map((cls) => {
      const classKey = cls.class_name.toLowerCase();
      return {
        ...cls,
        student_count: studentCounts.get(classKey) || 0,
        homeroom_teacher: teacherMap.get(classKey) || cls.homeroom_teacher_name || null,
      };
    });
  },

  getClassByName(className: string): AcademicClass | undefined {
    return dbState.classes.find(
      (c) => c.class_name.toLowerCase() === className.trim().toLowerCase()
    );
  },

  ensureClassExists(className: string): AcademicClass {
    const cleanName = className.trim();
    const existing = db.getClassByName(cleanName);
    if (existing) return existing;

    let gradeLevel: GradeLevel = 10;
    if (/^11|\s11\s|\s11$/.test(cleanName)) {
      gradeLevel = 11;
    } else if (/^12|\s12\s|\s12$/.test(cleanName)) {
      gradeLevel = 12;
    }

    const parts = cleanName.split(/\s+/);
    let dept = 'UMUM';
    const nonNumPart = parts.find((p) => !/^\d+$/.test(p));
    if (nonNumPart) dept = nonNumPart.toUpperCase();

    const newClass: AcademicClass = {
      id: `cls-${crypto.randomUUID().slice(0, 8)}`,
      class_name: cleanName,
      grade_level: gradeLevel,
      department: dept,
      academic_year: '2026/2027',
      capacity: 36,
      status: 'AKTIF',
      updated_at: new Date().toISOString(),
    };
    dbState.classes.push(newClass);
    saveDatabaseSync(dbState);
    return newClass;
  },

  createClass(data: Omit<AcademicClass, 'id' | 'updated_at'>): AcademicClass {
    const existing = db.getClassByName(data.class_name);
    if (existing) {
      throw new Error(`Nama rombel "${data.class_name}" sudah terdaftar.`);
    }
    const newClass: AcademicClass = {
      ...data,
      id: `cls-${crypto.randomUUID().slice(0, 8)}`,
      updated_at: new Date().toISOString(),
    };
    dbState.classes.push(newClass);
    saveDatabaseSync(dbState);
    return newClass;
  },

  updateClass(id: string, data: Partial<AcademicClass>): AcademicClass {
    const index = dbState.classes.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Rombel tidak ditemukan.');

    if (data.class_name && data.class_name !== dbState.classes[index].class_name) {
      const existing = db.getClassByName(data.class_name);
      if (existing && existing.id !== id) {
        throw new Error(`Nama rombel "${data.class_name}" sudah digunakan.`);
      }
    }

    dbState.classes[index] = {
      ...dbState.classes[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    saveDatabaseSync(dbState);
    return dbState.classes[index];
  },

  deleteClass(id: string): void {
    const cls = dbState.classes.find((c) => c.id === id);
    if (cls) {
      const studentCount = dbState.students.filter((s) => s.class_name === cls.class_name).length;
      if (studentCount > 0) {
        throw new Error(`Tidak dapat menghapus rombel. Masih ada ${studentCount} siswa terdaftar di rombel ini.`);
      }
    }
    dbState.classes = dbState.classes.filter((c) => c.id !== id);
    saveDatabaseSync(dbState);
  },

  // STUDENTS
  getStudents(filter?: { class_name?: string; updated_after?: string; status?: string }): Student[] {
    let list = dbState.students;

    if (filter?.class_name) {
      const q = filter.class_name.trim().toLowerCase();
      list = list.filter((s) => s.class_name && s.class_name.trim().toLowerCase() === q);
    }

    if (filter?.status) {
      const st = filter.status.trim().toLowerCase();
      list = list.filter((s) => s.status && s.status.trim().toLowerCase() === st);
    }

    if (filter?.updated_after) {
      const filterDate = new Date(filter.updated_after);
      if (!isNaN(filterDate.getTime())) {
        list = list.filter((s) => s.updated_at && new Date(s.updated_at) >= filterDate);
      }
    }

    return list;
  },

  getStudentById(id: string): Student | undefined {
    return dbState.students.find((s) => s.id === id);
  },

  createStudent(data: Omit<Student, 'id' | 'updated_at'>): Student {
    if (data.class_name) {
      db.ensureClassExists(data.class_name);
    }

    if (dbState.students.some((s) => s.nisn === data.nisn.trim())) {
      throw new Error(`NISN "${data.nisn}" sudah terdaftar.`);
    }

    const newStudent: Student = {
      ...data,
      id: `std-${crypto.randomUUID().slice(0, 8)}`,
      nisn: data.nisn.trim(),
      nis: data.nis.trim(),
      qr_code: data.qr_code?.trim() || data.nisn.trim(),
      updated_at: new Date().toISOString(),
    };
    dbState.students.push(newStudent);
    saveDatabaseSync(dbState);
    return newStudent;
  },

  upsertStudent(data: Omit<Student, 'id' | 'updated_at'>): { student: Student; created: boolean } {
    if (data.class_name) {
      db.ensureClassExists(data.class_name);
    }

    const cleanNisn = data.nisn.trim();
    const cleanNis = data.nis.trim();

    const existingIndex = dbState.students.findIndex((s) => s.nisn === cleanNisn || s.nis === cleanNis);

    if (existingIndex !== -1) {
      dbState.students[existingIndex] = {
        ...dbState.students[existingIndex],
        ...data,
        nisn: cleanNisn,
        nis: cleanNis,
        qr_code: data.qr_code?.trim() || cleanNisn,
        updated_at: new Date().toISOString(),
      };
      saveDatabaseSync(dbState);
      return { student: dbState.students[existingIndex], created: false };
    } else {
      const newStudent: Student = {
        ...data,
        id: `std-${crypto.randomUUID().slice(0, 8)}`,
        nisn: cleanNisn,
        nis: cleanNis,
        qr_code: data.qr_code?.trim() || cleanNisn,
        updated_at: new Date().toISOString(),
      };
      dbState.students.push(newStudent);
      saveDatabaseSync(dbState);
      return { student: newStudent, created: true };
    }
  },

  updateStudent(id: string, data: Partial<Student>): Student {
    const index = dbState.students.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Siswa tidak ditemukan.');

    if (data.nisn && data.nisn !== dbState.students[index].nisn) {
      if (dbState.students.some((s) => s.nisn === data.nisn!.trim() && s.id !== id)) {
        throw new Error(`NISN "${data.nisn}" sudah digunakan oleh siswa lain.`);
      }
    }

    if (data.class_name) {
      db.ensureClassExists(data.class_name);
    }

    dbState.students[index] = {
      ...dbState.students[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    saveDatabaseSync(dbState);
    return dbState.students[index];
  },

  deleteStudent(id: string): void {
    dbState.students = dbState.students.filter((s) => s.id !== id);
    saveDatabaseSync(dbState);
  },

  // TEACHERS
  getTeachers(): Teacher[] {
    return dbState.teachers;
  },

  getTeacherById(id: string): Teacher | undefined {
    return dbState.teachers.find((t) => t.id === id);
  },

  createTeacher(data: Omit<Teacher, 'id' | 'updated_at'>): Teacher {
    const wa = data.whatsapp.trim();
    if (!/^08[0-9]{8,13}$/.test(wa)) {
      throw new Error(`Nomor WhatsApp "${wa}" tidak valid. Wajib berformat 08xx.`);
    }

    if (data.nip && data.nip.trim()) {
      const cleanNip = data.nip.trim();
      if (dbState.teachers.some((t) => t.nip === cleanNip)) {
        throw new Error(`NIP "${cleanNip}" sudah terdaftar.`);
      }
    }

    const newTeacher: Teacher = {
      ...data,
      id: `tch-${crypto.randomUUID().slice(0, 8)}`,
      nip: data.nip ? data.nip.trim() : null,
      whatsapp: wa,
      updated_at: new Date().toISOString(),
    };
    dbState.teachers.push(newTeacher);
    saveDatabaseSync(dbState);
    return newTeacher;
  },

  updateTeacher(id: string, data: Partial<Teacher>): Teacher {
    const index = dbState.teachers.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Guru tidak ditemukan.');

    if (data.nip && data.nip !== dbState.teachers[index].nip) {
      const cleanNip = data.nip.trim();
      if (dbState.teachers.some((t) => t.nip === cleanNip && t.id !== id)) {
        throw new Error(`NIP "${cleanNip}" sudah digunakan oleh guru lain.`);
      }
    }

    dbState.teachers[index] = {
      ...dbState.teachers[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    saveDatabaseSync(dbState);
    return dbState.teachers[index];
  },

  upsertTeacher(data: Omit<Teacher, 'id' | 'updated_at'>): { teacher: Teacher; created: boolean } {
    const cleanNip = data.nip ? data.nip.trim() : null;
    const cleanWa = data.whatsapp.trim();

    const existingIndex = dbState.teachers.findIndex(
      (t) => (cleanNip && t.nip === cleanNip) || t.whatsapp === cleanWa
    );

    if (existingIndex !== -1) {
      dbState.teachers[existingIndex] = {
        ...dbState.teachers[existingIndex],
        ...data,
        nip: cleanNip,
        whatsapp: cleanWa,
        updated_at: new Date().toISOString(),
      };
      saveDatabaseSync(dbState);
      return { teacher: dbState.teachers[existingIndex], created: false };
    } else {
      const newTeacher: Teacher = {
        ...data,
        id: `tch-${crypto.randomUUID().slice(0, 8)}`,
        nip: cleanNip,
        whatsapp: cleanWa,
        updated_at: new Date().toISOString(),
      };
      dbState.teachers.push(newTeacher);
      saveDatabaseSync(dbState);
      return { teacher: newTeacher, created: true };
    }
  },

  deleteTeacher(id: string): void {
    dbState.teachers = dbState.teachers.filter((t) => t.id !== id);
    saveDatabaseSync(dbState);
  },

  // SUBJECTS
  getSubjects(): Subject[] {
    return dbState.subjects;
  },

  getSubjectById(id: string): Subject | undefined {
    return dbState.subjects.find((s) => s.id === id);
  },

  createSubject(data: Omit<Subject, 'id' | 'updated_at'>): Subject {
    const code = data.kode_mapel.trim().toUpperCase();
    if (dbState.subjects.some((s) => s.kode_mapel.toUpperCase() === code)) {
      throw new Error(`Kode mata pelajaran "${code}" sudah terdaftar.`);
    }

    const newSubject: Subject = {
      ...data,
      id: `sbj-${crypto.randomUUID().slice(0, 8)}`,
      kode_mapel: code,
      updated_at: new Date().toISOString(),
    };
    dbState.subjects.push(newSubject);
    saveDatabaseSync(dbState);
    return newSubject;
  },

  updateSubject(id: string, data: Partial<Subject>): Subject {
    const index = dbState.subjects.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Mata pelajaran tidak ditemukan.');

    if (data.kode_mapel && data.kode_mapel !== dbState.subjects[index].kode_mapel) {
      const code = data.kode_mapel.trim().toUpperCase();
      if (dbState.subjects.some((s) => s.kode_mapel.toUpperCase() === code && s.id !== id)) {
        throw new Error(`Kode mata pelajaran "${code}" sudah terdaftar.`);
      }
    }

    dbState.subjects[index] = {
      ...dbState.subjects[index],
      ...data,
      kode_mapel: data.kode_mapel ? data.kode_mapel.trim().toUpperCase() : dbState.subjects[index].kode_mapel,
      updated_at: new Date().toISOString(),
    };
    saveDatabaseSync(dbState);
    return dbState.subjects[index];
  },

  upsertSubject(data: Omit<Subject, 'id' | 'updated_at'>): { subject: Subject; created: boolean } {
    const cleanCode = data.kode_mapel.trim().toUpperCase();

    const existingIndex = dbState.subjects.findIndex((s) => s.kode_mapel.toUpperCase() === cleanCode);

    if (existingIndex !== -1) {
      dbState.subjects[existingIndex] = {
        ...dbState.subjects[existingIndex],
        ...data,
        kode_mapel: cleanCode,
        updated_at: new Date().toISOString(),
      };
      saveDatabaseSync(dbState);
      return { subject: dbState.subjects[existingIndex], created: false };
    } else {
      const newSubject: Subject = {
        ...data,
        id: `sbj-${crypto.randomUUID().slice(0, 8)}`,
        kode_mapel: cleanCode,
        updated_at: new Date().toISOString(),
      };
      dbState.subjects.push(newSubject);
      saveDatabaseSync(dbState);
      return { subject: newSubject, created: true };
    }
  },

  deleteSubject(id: string): void {
    dbState.subjects = dbState.subjects.filter((s) => s.id !== id);
    saveDatabaseSync(dbState);
  },

  // API CLIENTS
  getApiClients(): ApiClient[] {
    return dbState.api_clients;
  },

  getClientByApiKey(apiKey: string): ApiClient | undefined {
    return dbState.api_clients.find((c) => c.api_key === apiKey);
  },

  getClientById(id: string): ApiClient | undefined {
    return dbState.api_clients.find((c) => c.id === id);
  },

  generateApiKey(clientName: string): string {
    const prefix = clientName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 8) || 'client';
    const randomHex = crypto.randomBytes(12).toString('hex');
    return `sk_live_${prefix}_${randomHex}`;
  },

  createApiClient(data: {
    client_name: string;
    allowed_scopes: ApiScope[];
    status?: 'Aktif' | 'Nonaktif';
    description?: string;
  }): ApiClient {
    if (!data.client_name?.trim()) {
      throw new Error('Nama klien wajib diisi.');
    }
    if (!data.allowed_scopes || data.allowed_scopes.length === 0) {
      throw new Error('Pilih minimal satu hak akses (scope).');
    }

    const newClient: ApiClient = {
      id: `client-${crypto.randomUUID().slice(0, 8)}`,
      client_name: data.client_name.trim(),
      api_key: db.generateApiKey(data.client_name),
      allowed_scopes: data.allowed_scopes,
      status: data.status || 'Aktif',
      description: data.description?.trim() || '',
      created_at: new Date().toISOString(),
      last_accessed_at: null,
      total_requests: 0,
    };
    dbState.api_clients.push(newClient);
    saveDatabaseSync(dbState);
    return newClient;
  },

  updateApiClient(id: string, data: Partial<ApiClient>): ApiClient {
    const index = dbState.api_clients.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Klien API tidak ditemukan.');

    dbState.api_clients[index] = {
      ...dbState.api_clients[index],
      ...data,
    };
    saveDatabaseSync(dbState);
    return dbState.api_clients[index];
  },

  regenerateClientApiKey(id: string): ApiClient {
    const client = db.getClientById(id);
    if (!client) throw new Error('Klien API tidak ditemukan.');
    const newKey = db.generateApiKey(client.client_name);
    return db.updateApiClient(id, { api_key: newKey });
  },

  deleteApiClient(id: string): void {
    dbState.api_clients = dbState.api_clients.filter((c) => c.id !== id);
    saveDatabaseSync(dbState);
  },

  recordClientAccess(clientId: string): void {
    const client = dbState.api_clients.find((c) => c.id === clientId);
    if (client) {
      client.last_accessed_at = new Date().toISOString();
      client.total_requests = (client.total_requests || 0) + 1;
      saveDatabaseSync(dbState);
    }
  },

  // AUDIT LOGS
  getLogs(limit = 100): ApiAccessLog[] {
    return [...dbState.logs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },

  addLog(entry: Omit<ApiAccessLog, 'id' | 'timestamp'>): void {
    const log: ApiAccessLog = {
      ...entry,
      id: `log-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
    };
    dbState.logs.unshift(log);
    if (dbState.logs.length > 500) {
      dbState.logs = dbState.logs.slice(0, 500);
    }
    saveDatabaseSync(dbState);
  },
};
