import * as XLSX from 'xlsx';

export const excelHelper = {
  // Download exported dataset or template
  exportToExcel(
    data: any[],
    filename: string,
    sheetName: string = 'Data'
  ) {
    let ws: XLSX.WorkSheet;
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
      ws = XLSX.utils.json_to_sheet(data);
    } else {
      ws = XLSX.utils.aoa_to_sheet(data);
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
  },

  generateStudentTemplate() {
    const headers = [
      'NISN',
      'NIS',
      'Nama Lengkap',
      'Jenis Kelamin (L/P)',
      'Rombel / Kelas',
      'Angkatan',
      'Barcode / Nomor Kartu',
      'Status (AKTIF/MUTASI/LULUS)',
    ];
    const sampleRows = [
      ['0109986644', '2026210', 'Ahmad Dani Saputra', 'L', '10 TKR 1', '2026', '0109986644', 'AKTIF'],
      ['0109986645', '2026211', 'Siti Nurhaliza', 'P', '10 TP 1', '2026', '0109986645', 'AKTIF'],
    ];
    this.exportToExcel([headers, ...sampleRows], 'Template_Import_Siswa', 'Template Siswa');
  },

  generateTeacherTemplate() {
    const headers = [
      'NIP',
      'Nama Lengkap & Gelar',
      'No. WhatsApp',
      'Status Kepegawaian (PNS/PPPK/Non-PNS)',
      'Penugasan Wali Kelas',
      'Bidang Studi / Keahlian',
    ];
    const sampleRows = [
      ['197508192002121003', 'Agus Setiawan, S.Pd., M.T.', '081234567890', 'PNS', '10 TKR 1', 'Teknik Otomotif'],
      ['-', 'Rian Hidayat, S.T.', '089677889900', 'Non-PNS', '-', 'Kelistrikan Otomotif'],
    ];
    this.exportToExcel([headers, ...sampleRows], 'Template_Import_Guru', 'Template Guru');
  },

  generateSubjectTemplate() {
    const headers = [
      'Kode Mapel',
      'Nama Mata Pelajaran',
      'Kelompok (Kejuruan/Umum/Muatan Lokal)',
      'Beban Jam (JP)',
      'Deskripsi Ringkas',
    ];
    const sampleRows = [
      ['BING', 'Bahasa Inggris', 'Kejuruan', 3, 'Bahasa Inggris komunikasi industri.'],
      ['DPK_TITL', 'Dasar Program Keahlian TITL', 'Kejuruan', 6, 'Dasar kelistrikan dan peralatan ukur.'],
    ];
    this.exportToExcel([headers, ...sampleRows], 'Template_Import_Mata_Pelajaran', 'Template Mapel');
  },

  // Parse uploaded .xlsx or .xls or .csv file
  async parseExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          resolve(rawJson);
        } catch (err) {
          reject(new Error('Gagal membaca file Excel/CSV. Pastikan format file valid.'));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.readAsArrayBuffer(file);
    });
  },

  mapStudentRows(rows: any[]) {
    return rows.map((row: any) => ({
      key: row['NISN'] || row['nisn'] || '',
      nisn: String(row['NISN'] || row['nisn'] || '').trim(),
      nis: String(row['NIS'] || row['nis'] || '').trim(),
      full_name: String(row['Nama Lengkap'] || row['full_name'] || '').trim(),
      gender: String(row['Jenis Kelamin (L/P)'] || row['gender'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
      class_name: String(row['Rombel / Kelas'] || row['class_name'] || '10 TKR 1').trim(),
      cohort_year: String(row['Angkatan'] || row['cohort_year'] || '2026').trim(),
      qr_code: String(row['Barcode / Nomor Kartu'] || row['qr_code'] || row['NISN'] || '').trim(),
      status: (String(row['Status (AKTIF/MUTASI/LULUS)'] || row['status'] || 'AKTIF').toUpperCase() as any) || 'AKTIF',
    }));
  },

  mapTeacherRows(rows: any[]) {
    return rows.map((row: any) => ({
      key: row['NIP'] || row['nip'] || row['No. WhatsApp'] || '',
      nip: row['NIP'] && row['NIP'] !== '-' ? String(row['NIP']).trim() : null,
      full_name: String(row['Nama Lengkap & Gelar'] || row['full_name'] || '').trim(),
      whatsapp: String(row['No. WhatsApp'] || row['whatsapp'] || '').trim(),
      employment_status: (String(row['Status Kepegawaian (PNS/PPPK/Non-PNS)'] || row['employment_status'] || 'PNS').trim() as any) || 'PNS',
      homeroom_class: row['Penugasan Wali Kelas'] && row['Penugasan Wali Kelas'] !== '-' ? String(row['Penugasan Wali Kelas']).trim() : null,
      subject_specialization: String(row['Bidang Studi / Keahlian'] || row['subject_specialization'] || '').trim(),
    }));
  },

  mapSubjectRows(rows: any[]) {
    return rows.map((row: any) => ({
      key: row['Kode Mapel'] || row['kode_mapel'] || '',
      kode_mapel: String(row['Kode Mapel'] || row['kode_mapel'] || '').toUpperCase().trim(),
      nama_mapel: String(row['Nama Mata Pelajaran'] || row['nama_mapel'] || '').trim(),
      kelompok: (String(row['Kelompok (Kejuruan/Umum/Muatan Lokal)'] || row['kelompok'] || 'Kejuruan').trim() as any) || 'Kejuruan',
      hours_per_week: parseInt(row['Beban Jam (JP)'] || row['hours_per_week']) || 3,
      keterangan: String(row['Deskripsi Ringkas'] || row['keterangan'] || '').trim(),
    }));
  },
};
