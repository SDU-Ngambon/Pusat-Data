import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { ApiScope, ApiClient } from '../src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BRANDING_UPLOAD_DIR = path.resolve(__dirname, '../public/uploads/branding');

if (!fs.existsSync(BRANDING_UPLOAD_DIR)) {
  fs.mkdirSync(BRANDING_UPLOAD_DIR, { recursive: true });
}

const brandingStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(BRANDING_UPLOAD_DIR)) {
      fs.mkdirSync(BRANDING_UPLOAD_DIR, { recursive: true });
    }
    cb(null, BRANDING_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const ext = rawExt || (file.mimetype.includes('icon') ? '.ico' : '.png');
    const fieldType = String(req.body?.type || file.fieldname || 'brand').replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanName = `${fieldType}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`;
    cb(null, cleanName);
  },
});

const uploadBranding = multer({
  storage: brandingStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.originalname.match(/\.(png|jpe?g|svg|ico|webp|gif)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Harap unggah gambar (PNG, JPG, SVG, ICO, WebP).'));
    }
  },
});

export const apiRouter = Router();

// Extend Request interface to hold authenticated client
interface AuthenticatedRequest extends Request {
  client?: ApiClient;
}

// -------------------------------------------------------------
// SATELLITE API AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// -------------------------------------------------------------
function requireScope(scope: ApiScope) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const authHeader = req.headers.authorization;

    const logAndRespond = (statusCode: number, errorMsg: string, clientName = 'Unknown') => {
      const duration = Date.now() - startTime;
      db.addLog({
        client_id: req.client?.id,
        client_name: clientName,
        endpoint: req.originalUrl,
        method: req.method,
        status_code: statusCode,
        duration_ms: duration,
        ip_address: req.ip || req.socket.remoteAddress || '127.0.0.1',
        user_agent: (req.headers['user-agent'] as string) || 'Unknown',
        details: errorMsg,
      });

      return res.status(statusCode).json({
        success: false,
        timestamp: new Date().toISOString(),
        error: errorMsg,
      });
    };

    if (!authHeader) {
      return logAndRespond(
        401,
        "Unauthorized: Header 'Authorization' tidak ditemukan. Wajib menyertakan: Bearer <API_KEY_RAHASIA>"
      );
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return logAndRespond(
        401,
        "Unauthorized: Format token tidak valid. Gunakan format: Authorization: Bearer <API_KEY_RAHASIA>"
      );
    }

    const token = parts[1].trim();
    const client = db.getClientByApiKey(token);

    if (!client) {
      return logAndRespond(401, 'Unauthorized: API Key tidak valid atau tidak terdaftar.');
    }

    if (client.status !== 'Aktif') {
      return logAndRespond(
        403,
        `Forbidden: Kredensial aplikasi "${client.client_name}" berstatus Nonaktif. Hubungi Admin Pusat Data Sekolah.`,
        client.client_name
      );
    }

    if (!client.allowed_scopes.includes(scope)) {
      return logAndRespond(
        403,
        `Forbidden: Klien "${client.client_name}" tidak memiliki hak akses (scope: ${scope}) untuk endpoint ini.`,
        client.client_name
      );
    }

    req.client = client;
    db.recordClientAccess(client.id);

    // Capture response finish to log successful access
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      if (res.statusCode < 400) {
        db.addLog({
          client_id: client.id,
          client_name: client.client_name,
          endpoint: req.originalUrl,
          method: req.method,
          status_code: res.statusCode,
          duration_ms: duration,
          ip_address: req.ip || req.socket.remoteAddress || '127.0.0.1',
          user_agent: (req.headers['user-agent'] as string) || 'Unknown',
        });
      }
    });

    next();
  };
}

// -------------------------------------------------------------
// SATELLITE PUBLIC ENDPOINTS (/api/v1/sync/...)
// -------------------------------------------------------------

// a. Profil & Identitas Sekolah
apiRouter.get('/v1/sync/school-profile', requireScope('read:profile'), (req: AuthenticatedRequest, res: Response) => {
  const profile = db.getSchoolProfile();
  return res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: profile,
  });
});

// b. Rombongan Belajar (Classes)
apiRouter.get('/v1/sync/classes', requireScope('read:classes'), (req: AuthenticatedRequest, res: Response) => {
  const classes = db.getClasses();
  return res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data_count: classes.length,
    data: classes,
  });
});

// c. Data Siswa (Students) with class & updated_after filter
apiRouter.get('/v1/sync/students', requireScope('read:students'), (req: AuthenticatedRequest, res: Response) => {
  const className = req.query.class as string | undefined;
  const updatedAfter = req.query.updated_after as string | undefined;
  const status = req.query.status as string | undefined;

  const students = db.getStudents({
    class_name: className,
    updated_after: updatedAfter,
    status: status,
  });

  return res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data_count: students.length,
    data: students,
  });
});

// d. Data Guru & Tendik (Teachers)
apiRouter.get('/v1/sync/teachers', requireScope('read:teachers'), (req: AuthenticatedRequest, res: Response) => {
  const teachers = db.getTeachers();
  return res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data_count: teachers.length,
    data: teachers,
  });
});

// e. Data Mata Pelajaran (Subjects)
apiRouter.get('/v1/sync/subjects', requireScope('read:subjects'), (req: AuthenticatedRequest, res: Response) => {
  const subjects = db.getSubjects();
  return res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data_count: subjects.length,
    data: subjects,
  });
});

// f. Verify Token endpoint (Supports Authorization header or JSON body)
apiRouter.post('/v1/sync/verify-token', (req: Request, res: Response) => {
  const startTime = Date.now();
  let token = '';

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.body && req.body.api_key) {
    token = String(req.body.api_key).trim();
  }

  const duration = Date.now() - startTime;

  if (!token) {
    return res.status(400).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Token tidak ditemukan. Kirim via Authorization: Bearer <API_KEY> atau Body: {"api_key": "..."}',
    });
  }

  const client = db.getClientByApiKey(token);
  if (!client) {
    db.addLog({
      client_name: 'Unknown',
      endpoint: '/api/v1/sync/verify-token',
      method: 'POST',
      status_code: 401,
      duration_ms: duration,
      ip_address: req.ip || req.socket.remoteAddress || '127.0.0.1',
      user_agent: (req.headers['user-agent'] as string) || 'Unknown',
      details: 'Percobaan verifikasi token gagal (token tidak valid)',
    });

    return res.status(401).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'API Key tidak valid atau tidak terdaftar.',
    });
  }

  db.recordClientAccess(client.id);

  db.addLog({
    client_id: client.id,
    client_name: client.client_name,
    endpoint: '/api/v1/sync/verify-token',
    method: 'POST',
    status_code: 200,
    duration_ms: duration,
    ip_address: req.ip || req.socket.remoteAddress || '127.0.0.1',
    user_agent: (req.headers['user-agent'] as string) || 'Unknown',
    details: 'Verifikasi token berhasil',
  });

  return res.json({
    success: true,
    timestamp: new Date().toISOString(),
    client: {
      id: client.id,
      name: client.client_name,
      scopes: client.allowed_scopes,
      status: client.status,
      created_at: client.created_at,
    },
    message: client.status === 'Aktif' ? 'API Key valid dan aktif.' : 'API Key terdaftar namun status Nonaktif.',
  });
});

// -------------------------------------------------------------
// ADMIN INTERNAL API (/api/admin/...)
// -------------------------------------------------------------

// Admin Portal Login
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username dan password wajib diisi.' });
    }

    const admin = db.validateAdminLogin(username, password);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Username atau password yang Anda masukkan salah.' });
    }

    // Generate simple token session
    const sessionToken = `session_admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return res.json({
      success: true,
      message: 'Login berhasil. Selamat datang di Pusat Data Sekolah.',
      token: sessionToken,
      user: {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name,
        role: admin.role,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Account Settings
apiRouter.get('/admin/account', (req: Request, res: Response) => {
  const admin = db.getAdminUser();
  return res.json({
    success: true,
    data: {
      id: admin.id,
      username: admin.username,
      full_name: admin.full_name,
      role: admin.role,
    },
  });
});

apiRouter.put('/admin/account', (req: Request, res: Response) => {
  try {
    const { current_password, new_username, new_password, full_name } = req.body;
    const admin = db.getAdminUser();

    if (current_password !== admin.password_hash) {
      return res.status(400).json({ success: false, error: 'Password saat ini (password lama) salah.' });
    }

    const updated = db.updateAdminUser({
      username: new_username,
      password: new_password,
      full_name: full_name,
    });

    return res.json({
      success: true,
      message: 'Kredensial dan profil admin berhasil diperbarui.',
      data: {
        id: updated.id,
        username: updated.username,
        full_name: updated.full_name,
        role: updated.role,
      },
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Dashboard Overview
apiRouter.get('/admin/overview', (req: Request, res: Response) => {
  const students = db.getStudents();
  const teachers = db.getTeachers();
  const classes = db.getClasses();
  const subjects = db.getSubjects();
  const clients = db.getApiClients();
  const logs = db.getLogs(15);
  const profile = db.getSchoolProfile();

  const studentsByStatus = {
    aktif: students.filter((s) => s.status === 'AKTIF').length,
    lulus: students.filter((s) => s.status === 'LULUS').length,
    mutasi: students.filter((s) => s.status === 'MUTASI').length,
  };

  const teachersByEmployment = {
    pns: teachers.filter((t) => t.employment_status === 'PNS').length,
    pppk: teachers.filter((t) => t.employment_status === 'PPPK').length,
    non_pns: teachers.filter((t) => t.employment_status === 'Non-PNS').length,
  };

  const clientsActive = clients.filter((c) => c.status === 'Aktif').length;

  return res.json({
    success: true,
    data: {
      profile,
      counts: {
        total_students: students.length,
        students_by_status: studentsByStatus,
        total_teachers: teachers.length,
        teachers_by_employment: teachersByEmployment,
        total_classes: classes.length,
        total_subjects: subjects.length,
        total_clients: clients.length,
        clients_active: clientsActive,
      },
      recent_logs: logs,
    },
  });
});

// School Profile
apiRouter.get('/admin/profile', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.getSchoolProfile() });
});

apiRouter.put('/admin/profile', (req: Request, res: Response) => {
  try {
    const updated = db.updateSchoolProfile(req.body);
    return res.json({ success: true, data: updated, message: 'Profil sekolah berhasil diperbarui.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Branding Upload Handler (Logo & Favicon)
const handleBrandingUpload = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Tidak ada file gambar yang diunggah.' });
    }

    const relativePath = `/uploads/branding/${req.file.filename}`;
    const targetType = req.body?.type || req.file.fieldname; // 'logo' | 'favicon'

    const updatePayload: any = {};
    if (targetType === 'logo') {
      updatePayload.logo_url = relativePath;
    } else if (targetType === 'favicon') {
      updatePayload.favicon_url = relativePath;
    }
    if (req.body?.theme_color) {
      updatePayload.theme_color = req.body.theme_color;
    }

    if (Object.keys(updatePayload).length > 0) {
      db.updateSchoolProfile(updatePayload);
    }

    return res.json({
      success: true,
      message: 'File branding berhasil diunggah ke server lokal.',
      file_path: relativePath,
      filename: req.file.filename,
      original_name: req.file.originalname,
      profile: db.getSchoolProfile(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Gagal menyimpan file unggahan.' });
  }
};

apiRouter.post('/v1/settings/upload', uploadBranding.single('file'), handleBrandingUpload);
apiRouter.post('/admin/settings/upload', uploadBranding.single('file'), handleBrandingUpload);

// Classes
apiRouter.get('/admin/classes', (req: Request, res: Response) => {
  const classes = db.getClasses();
  const students = db.getStudents();
  const teachers = db.getTeachers();

  const enriched = classes.map((c) => {
    const studentCount = students.filter((s) => s.class_name === c.class_name).length;
    const homeroomTeacher = teachers.find((t) => t.homeroom_class === c.class_name);
    return {
      ...c,
      student_count: studentCount,
      homeroom_teacher: homeroomTeacher ? homeroomTeacher.full_name : c.homeroom_teacher_name || null,
    };
  });

  return res.json({ success: true, data: enriched });
});

apiRouter.post('/admin/classes', (req: Request, res: Response) => {
  try {
    const newClass = db.createClass(req.body);
    return res.status(201).json({ success: true, data: newClass, message: 'Rombel berhasil ditambahkan.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/classes/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateClass(req.params.id, req.body);
    return res.json({ success: true, data: updated, message: 'Rombel berhasil diperbarui.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/classes/:id', (req: Request, res: Response) => {
  try {
    db.deleteClass(req.params.id);
    return res.json({ success: true, message: 'Rombel berhasil dihapus.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Students
apiRouter.get('/admin/students', (req: Request, res: Response) => {
  const students = db.getStudents({
    class_name: req.query.class_name as string | undefined,
    status: req.query.status as string | undefined,
  });
  return res.json({ success: true, data: students });
});

apiRouter.post('/admin/students', (req: Request, res: Response) => {
  try {
    const created = db.createStudent(req.body);
    return res.status(201).json({ success: true, data: created, message: 'Data siswa berhasil ditambahkan.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/students/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateStudent(req.params.id, req.body);
    return res.json({ success: true, data: updated, message: 'Data siswa berhasil diperbarui.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/students/:id', (req: Request, res: Response) => {
  try {
    db.deleteStudent(req.params.id);
    return res.json({ success: true, message: 'Siswa berhasil dihapus.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/students/bulk-import', (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Daftar siswa untuk diimpor tidak boleh kosong.' });
    }

    const processed = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const className = item.class_name || '10 TKR 1';
        const res = db.upsertStudent({
          nisn: String(item.nisn).trim(),
          nis: String(item.nis).trim(),
          full_name: String(item.full_name).trim(),
          gender: item.gender === 'P' ? 'P' : 'L',
          class_name: className,
          cohort_year: String(item.cohort_year || '2026'),
          qr_code: item.qr_code ? String(item.qr_code).trim() : String(item.nisn).trim(),
          status: item.status === 'MUTASI' ? 'MUTASI' : item.status === 'LULUS' ? 'LULUS' : 'AKTIF',
          birth_place: item.birth_place || undefined,
          birth_date: item.birth_date || undefined,
          parent_phone: item.parent_phone || undefined,
        });
        processed.push(res.student);
      } catch (e: any) {
        errors.push(`Baris ${i + 1} (${item.full_name || item.nisn || 'Data'}): ${e.message}`);
      }
    }

    return res.json({
      success: processed.length > 0,
      imported_count: processed.length,
      failed_count: errors.length,
      errors: errors.slice(0, 10),
      message: `Berhasil memproses ${processed.length} siswa.${errors.length > 0 ? ` (${errors.length} gagal)` : ''}`,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Teachers
apiRouter.get('/admin/teachers', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.getTeachers() });
});

apiRouter.post('/admin/teachers', (req: Request, res: Response) => {
  try {
    const created = db.createTeacher(req.body);
    return res.status(201).json({ success: true, data: created, message: 'Data guru berhasil ditambahkan.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/teachers/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateTeacher(req.params.id, req.body);
    return res.json({ success: true, data: updated, message: 'Data guru berhasil diperbarui.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/teachers/:id', (req: Request, res: Response) => {
  try {
    db.deleteTeacher(req.params.id);
    return res.json({ success: true, message: 'Data guru berhasil dihapus.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/teachers/bulk-import', (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Daftar guru tidak boleh kosong.' });
    }

    const processed = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const res = db.upsertTeacher({
          nip: item.nip && String(item.nip).trim() !== '-' ? String(item.nip).trim() : null,
          full_name: String(item.full_name).trim(),
          whatsapp: String(item.whatsapp || item.phone_number || '081234567890').trim(),
          employment_status: item.employment_status || 'Non-PNS',
          homeroom_class: item.homeroom_class || item.homeroom_class_name || null,
          subject_specialization: item.subject_specialization || item.specialization || null,
          is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
        });
        processed.push(res.teacher);
      } catch (e: any) {
        errors.push(`Baris ${i + 1} (${item.full_name || 'Data'}): ${e.message}`);
      }
    }

    return res.json({
      success: processed.length > 0,
      imported_count: processed.length,
      failed_count: errors.length,
      errors: errors.slice(0, 10),
      message: `Berhasil memproses ${processed.length} data guru.${errors.length > 0 ? ` (${errors.length} gagal)` : ''}`,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Subjects
apiRouter.get('/admin/subjects', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.getSubjects() });
});

apiRouter.post('/admin/subjects', (req: Request, res: Response) => {
  try {
    const created = db.createSubject(req.body);
    return res.status(201).json({ success: true, data: created, message: 'Mata pelajaran berhasil ditambahkan.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/subjects/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateSubject(req.params.id, req.body);
    return res.json({ success: true, data: updated, message: 'Mata pelajaran berhasil diperbarui.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/subjects/:id', (req: Request, res: Response) => {
  try {
    db.deleteSubject(req.params.id);
    return res.json({ success: true, message: 'Mata pelajaran berhasil dihapus.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/subjects/bulk-import', (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Daftar mata pelajaran tidak boleh kosong.' });
    }

    const processed = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const res = db.upsertSubject({
          kode_mapel: String(item.kode_mapel || item.subject_code || item.code || '').trim().toUpperCase(),
          nama_mapel: String(item.nama_mapel || item.subject_name || item.name || '').trim(),
          kelompok: item.kelompok || item.curriculum_group || 'Kejuruan',
          keterangan: item.keterangan || item.description || '',
          hours_per_week: Number(item.hours_per_week) || 3,
        });
        processed.push(res.subject);
      } catch (e: any) {
        errors.push(`Baris ${i + 1} (${item.kode_mapel || item.subject_code || 'Data'}): ${e.message}`);
      }
    }

    return res.json({
      success: processed.length > 0,
      imported_count: processed.length,
      failed_count: errors.length,
      errors: errors.slice(0, 10),
      message: `Berhasil memproses ${processed.length} mata pelajaran.${errors.length > 0 ? ` (${errors.length} gagal)` : ''}`,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// API Clients Management
apiRouter.get('/admin/clients', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.getApiClients() });
});

apiRouter.post('/admin/clients', (req: Request, res: Response) => {
  try {
    const created = db.createApiClient(req.body);
    return res.status(201).json({ success: true, data: created, message: 'Klien API berhasil didaftarkan.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.put('/admin/clients/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateApiClient(req.params.id, req.body);
    return res.json({ success: true, data: updated, message: 'Klien API berhasil diperbarui.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/clients/:id/regenerate-key', (req: Request, res: Response) => {
  try {
    const updated = db.regenerateClientApiKey(req.params.id);
    return res.json({ success: true, data: updated, message: 'API Key baru berhasil di-generate!' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/admin/clients/:id', (req: Request, res: Response) => {
  try {
    db.deleteApiClient(req.params.id);
    return res.json({ success: true, message: 'Klien API berhasil dihapus.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Logs
apiRouter.get('/admin/logs', (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  return res.json({ success: true, data: db.getLogs(limit) });
});

// System Backup / Restore / Reset
apiRouter.get('/admin/system/backup', (req: Request, res: Response) => {
  const data = db.getRawData();
  return res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data,
  });
});

apiRouter.post('/admin/system/restore', (req: Request, res: Response) => {
  try {
    const { backup } = req.body;
    if (!backup) throw new Error('Data backup tidak ditemukan.');
    db.importDatabase(backup);
    return res.json({ success: true, message: 'Database berhasil dipulihkan dari data backup.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/system/reset', (req: Request, res: Response) => {
  try {
    db.resetToSeed();
    return res.json({ success: true, message: 'Database berhasil di-reset ke data bawaan awal.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});
