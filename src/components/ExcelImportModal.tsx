import React, { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle, FileSpreadsheet, Download, Eye } from 'lucide-react';
import { excelHelper } from '../utils/excelHelper.js';

type EntityType = 'students' | 'teachers' | 'subjects';

export interface ExcelImportModalProps {
  entityType?: EntityType;
  type?: EntityType;
  title?: string;
  isOpen: boolean;
  existingKeys?: Set<string>; // Set of existing NISNs, NIPs, or Subject Codes for Preview badge
  classes?: any[];
  onClose: () => void;
  onBulkImport?: (items: any[]) => Promise<{ imported_count: number; failed_count: number; errors: string[] }>;
  onImport?: (items: any[]) => Promise<{ imported_count: number; failed_count: number; errors: string[] }>;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  entityType: rawEntityType,
  type: rawType,
  title: rawTitle,
  isOpen,
  existingKeys,
  onClose,
  onImport: rawOnImport,
  onBulkImport,
}) => {
  const onImport = rawOnImport || onBulkImport || (async () => ({ imported_count: 0, failed_count: 0, errors: [] }));
  const currentEntityType: EntityType = rawEntityType || rawType || 'students';
  const displayTitle =
    rawTitle ||
    (currentEntityType === 'students'
      ? 'Data Siswa'
      : currentEntityType === 'teachers'
      ? 'Data Guru & Tendik'
      : 'Data Mata Pelajaran');

  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [mappedItems, setMappedItems] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    imported_count: number;
    failed_count: number;
    errors: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    if (currentEntityType === 'students') {
      excelHelper.generateStudentTemplate();
    } else if (currentEntityType === 'teachers') {
      excelHelper.generateTeacherTemplate();
    } else {
      excelHelper.generateSubjectTemplate();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);

    try {
      const rows = await excelHelper.parseExcelFile(file);
      setParsedRows(rows);

      let items: any[] = [];
      if (currentEntityType === 'students') {
        items = excelHelper.mapStudentRows(rows);
      } else if (currentEntityType === 'teachers') {
        items = excelHelper.mapTeacherRows(rows);
      } else {
        items = excelHelper.mapSubjectRows(rows);
      }

      setMappedItems(items);
    } catch (err: any) {
      alert('Gagal membaca file Excel: ' + err.message);
    }
  };

  const handleExecuteImport = async () => {
    if (mappedItems.length === 0) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const res = await onImport(mappedItems);
      setResult(res);
      if (res.imported_count > 0 && res.failed_count === 0) {
        setTimeout(() => {
          onClose();
        }, 2200);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memproses import');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/70 dark:border-white/10 shrink-0">
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Import Native Excel (.xlsx) - {displayTitle}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Actions */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/60 border border-white/80 dark:border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div>
              <p className="text-xs font-extrabold text-slate-950 dark:text-white">1. Unduh Format Kolom Template Excel (.xlsx):</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Setiap bidang data telah terpisah per kolom sel Excel resmi.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-white/80 dark:border-white/10 hover:bg-white text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 text-xs shrink-0 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Unduh Template Excel</span>
            </button>
          </div>

          <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/60 border border-white/80 dark:border-white/10 rounded-2xl p-4 space-y-2 shadow-2xs">
            <label className="block text-xs font-extrabold text-slate-950 dark:text-white">
              2. Pilih File Excel (.xlsx / .xls / .csv) untuk Diunggah:
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-700 dark:text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 dark:file:bg-slate-700 file:text-white hover:file:bg-slate-800 cursor-pointer"
            />
            {fileName && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono flex items-center gap-1 mt-1 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>File terpilih: <strong>{fileName}</strong> ({mappedItems.length} baris terdeteksi)</span>
              </p>
            )}
          </div>

          {/* Modal Preview Table */}
          {mappedItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  Pratinjau Data Calon Commit (Preview):
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  {mappedItems.length} Baris Siap Diimpor
                </span>
              </div>

              <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/80 dark:border-white/10 rounded-2xl overflow-hidden max-h-56 overflow-y-auto shadow-2xs">
                <table className="w-full text-left text-[11px]">
                  <thead className="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-900/70 border-b border-white/70 dark:border-white/10">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      {currentEntityType === 'students' && (
                        <>
                          <th className="py-2.5 px-3">NISN / NIS</th>
                          <th className="py-2.5 px-3">Nama Lengkap</th>
                          <th className="py-2.5 px-3">JK</th>
                          <th className="py-2.5 px-3">Rombel</th>
                        </>
                      )}
                      {currentEntityType === 'teachers' && (
                        <>
                          <th className="py-2.5 px-3">NIP / WA</th>
                          <th className="py-2.5 px-3">Nama Lengkap</th>
                          <th className="py-2.5 px-3">Status Pegawai</th>
                          <th className="py-2.5 px-3">Wali Kelas</th>
                        </>
                      )}
                      {currentEntityType === 'subjects' && (
                        <>
                          <th className="py-2.5 px-3">Kode Mapel</th>
                          <th className="py-2.5 px-3">Nama Mapel</th>
                          <th className="py-2.5 px-3">Kelompok</th>
                          <th className="py-2.5 px-3">JP</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/60 dark:divide-white/10 font-mono text-slate-800 dark:text-slate-200">
                    {mappedItems.map((item, idx) => {
                      const isExisting = item.key && existingKeys && existingKeys.has(item.key);
                      return (
                        <tr key={idx} className="hover:bg-sky-50/50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="py-2 px-3">
                            {isExisting ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 text-[9px] font-bold">
                                UPDATE (UPSERT)
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 text-[9px] font-bold">
                                BARU
                              </span>
                            )}
                          </td>
                          {currentEntityType === 'students' && (
                            <>
                              <td className="py-2 px-3 text-blue-700 dark:text-cyan-300 font-bold">{item.nisn} / {item.nis}</td>
                              <td className="py-2 px-3 font-sans text-slate-950 dark:text-white font-bold">{item.full_name}</td>
                              <td className="py-2 px-3">{item.gender}</td>
                              <td className="py-2 px-3 text-slate-800 dark:text-slate-200">{item.class_name}</td>
                            </>
                          )}
                          {currentEntityType === 'teachers' && (
                            <>
                              <td className="py-2 px-3 text-blue-700 dark:text-cyan-300 font-bold">{item.nip || item.whatsapp}</td>
                              <td className="py-2 px-3 font-sans text-slate-950 dark:text-white font-bold">{item.full_name}</td>
                              <td className="py-2 px-3">{item.employment_status}</td>
                              <td className="py-2 px-3">{item.homeroom_class || '-'}</td>
                            </>
                          )}
                          {currentEntityType === 'subjects' && (
                            <>
                              <td className="py-2 px-3 text-blue-700 dark:text-cyan-300 font-bold">{item.kode_mapel}</td>
                              <td className="py-2 px-3 font-sans text-slate-950 dark:text-white font-bold">{item.nama_mapel}</td>
                              <td className="py-2 px-3">{item.kelompok}</td>
                              <td className="py-2 px-3">{item.hours_per_week} JP</td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Result Alert */}
          {result && (
            <div
              className={`p-3.5 rounded-xl text-xs border ${
                result.failed_count === 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                  : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold'
              }`}
            >
              <div className="font-extrabold flex items-center gap-1.5">
                {result.failed_count === 0 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
                <span>
                  Hasil Import Excel: {result.imported_count} diproses/di-upsert, {result.failed_count} gagal
                </span>
              </div>
              {result.errors.length > 0 && (
                <ul className="mt-2 space-y-1 list-disc list-inside text-[11px] font-mono text-amber-700 dark:text-amber-300">
                  {result.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/70 dark:border-white/10 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/80 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handleExecuteImport}
            disabled={isProcessing || mappedItems.length === 0}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer border border-white/20"
          >
            <Upload className="w-4 h-4" />
            <span>{isProcessing ? 'Memproses Upsert...' : 'Komit Import Excel'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
