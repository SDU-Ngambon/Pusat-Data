import React, { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle, FileText, Download } from 'lucide-react';

interface CsvImportModalProps {
  title: string;
  templateColumns: string[];
  sampleRow: string[];
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: any[]) => Promise<{ imported_count: number; failed_count: number; errors: string[] }>;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  title,
  templateColumns,
  sampleRow,
  isOpen,
  onClose,
  onImport,
}) => {
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    imported_count: number;
    failed_count: number;
    errors: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [templateColumns.join(','), sampleRow.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `template_${title.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvText((event.target?.result as string) || '');
      };
      reader.readAsText(file);
    }
  };

  const parseCsv = () => {
    const lines = csvText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      alert('File CSV minimal harus memiliki 1 baris header dan minimal 1 baris data!');
      return null;
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const rowObj: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowObj[header] = values[index] || '';
      });
      return rowObj;
    });

    return rows;
  };

  const handleProcessImport = async () => {
    const parsedData = parseCsv();
    if (!parsedData || parsedData.length === 0) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const res = await onImport(parsedData);
      setResult(res);
      if (res.imported_count > 0 && res.failed_count === 0) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memproses import data CSV');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-white/70 dark:border-white/10">
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            <span>Import Data {title} (Format CSV)</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Instructions and Download Template */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/60 border border-white/80 dark:border-white/10 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div>
              <p className="font-extrabold text-slate-950 dark:text-white">Panduan Format Kolom CSV:</p>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-[11px] mt-0.5">
                Pastikan nama kolom header persis sama dengan template di bawah.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-white/80 dark:border-white/10 hover:bg-white text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 text-xs self-start sm:self-auto cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Unduh Template CSV</span>
            </button>
          </div>

          {/* Template preview */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/60 p-3 rounded-2xl border border-white/80 dark:border-white/10 text-[11px] font-mono text-slate-800 dark:text-slate-200 overflow-x-auto shadow-2xs">
            <div className="text-slate-600 dark:text-slate-400 font-bold mb-1">Header Kolom Wajib:</div>
            <div className="text-blue-700 dark:text-cyan-300 font-bold">{templateColumns.join(', ')}</div>
            <div className="text-slate-600 dark:text-slate-400 font-bold mt-2 mb-1">Contoh Baris:</div>
            <div className="text-emerald-700 dark:text-emerald-300">{sampleRow.join(', ')}</div>
          </div>

          {/* Upload file or paste text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 dark:text-slate-200">
                Pilih File CSV atau Tempel (Paste) Teks:
              </label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 dark:file:bg-slate-700 file:text-white hover:file:bg-slate-800 cursor-pointer"
              />
            </div>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`Tempel baris data CSV di sini...\nContoh:\n${templateColumns.join(',')}\n${sampleRow.join(',')}`}
              className="w-full p-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-2xl text-xs font-mono text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
            />
          </div>

          {/* Result Alert */}
          {result && (
            <div
              className={`p-3.5 rounded-2xl text-xs border ${
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
                  Hasil Import: {result.imported_count} berhasil, {result.failed_count} gagal
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

        <div className="pt-3 border-t border-white/70 dark:border-white/10 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/80 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handleProcessImport}
            disabled={isProcessing || !csvText.trim()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer border border-white/20"
          >
            <Upload className="w-4 h-4" />
            <span>{isProcessing ? 'Memproses Import...' : 'Import Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
