import React from 'react';
import { X, Printer, User, QrCode } from 'lucide-react';
import { Student } from '../types/index.js';

interface BarcodeModalProps {
  student: Student | null;
  schoolName: string;
  onClose: () => void;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ student, schoolName, onClose }) => {
  if (!student) return null;

  // Simple visual barcode line pattern generator from string hash
  const generateBarcodeLines = (str: string) => {
    const chars = str.split('');
    return chars.flatMap((char, index) => {
      const code = char.charCodeAt(0);
      const w1 = (code % 3) + 1.5;
      const w2 = ((code * 2) % 4) + 1;
      return [
        <div key={`b-${index}-1`} style={{ width: `${w1}px` }} className="bg-slate-900 h-14" />,
        <div key={`s-${index}-1`} style={{ width: `${w2}px` }} className="bg-white h-14" />,
      ];
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-white/70 dark:border-white/10">
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
            <QrCode className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Kartu Pelajar & Barcode Presensi</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Card Design (High contrast physical card preview) */}
        <div className="p-4 bg-white text-slate-950 rounded-2xl border-2 border-sky-200/80 shadow-md space-y-4 select-none print:m-0 print:border-none">
          {/* Header */}
          <div className="text-center border-b pb-2 border-slate-200">
            <h4 className="font-black text-sm uppercase tracking-wide text-blue-900">
              KARTU TANDA PELAJAR
            </h4>
            <p className="text-[11px] font-bold text-slate-600">{schoolName}</p>
          </div>

          {/* Student Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-24 rounded-xl bg-sky-50 border border-sky-200/80 flex flex-col items-center justify-center shrink-0 text-blue-600">
              <User className="w-8 h-8" />
              <span className="text-[9px] uppercase font-extrabold mt-1 text-blue-800">
                {student.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
              </span>
            </div>

            <div className="space-y-1 text-xs min-w-0">
              <h5 className="font-extrabold text-sm text-slate-950 truncate leading-snug">
                {student.full_name}
              </h5>
              <p className="text-slate-600 font-mono text-[11px] font-medium">
                NISN: <strong className="text-slate-950 font-bold">{student.nisn}</strong>
              </p>
              <p className="text-slate-600 font-mono text-[11px] font-medium">
                NIS: <strong className="text-slate-950 font-bold">{student.nis}</strong>
              </p>
              <p className="text-slate-700 font-bold text-[11px]">
                Kelas: <span className="text-blue-700 font-extrabold">{student.class_name}</span>
              </p>
              <p className="text-slate-500 text-[10px] font-medium">
                Angkatan: {student.cohort_year}
              </p>
            </div>
          </div>

          {/* Barcode Lines Output */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center justify-center overflow-hidden max-w-full px-2">
              {generateBarcodeLines(student.qr_code || student.nisn)}
            </div>
            <div className="font-mono text-xs tracking-widest font-extrabold text-slate-900">
              *{student.qr_code || student.nisn}*
            </div>
          </div>

          <div className="text-[10px] text-center text-slate-500 font-medium border-t border-slate-200 pt-2">
            Kartu resmi identitas presensi mobile & gerbang otomatis
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/80 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all cursor-pointer border border-white/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Kartu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
