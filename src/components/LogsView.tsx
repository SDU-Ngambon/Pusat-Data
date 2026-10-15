import React, { useState } from 'react';
import { Activity, Search, RefreshCw, Clock, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { ApiAccessLog } from '../types/index.js';

interface LogsViewProps {
  logs: ApiAccessLog[];
  onRefresh: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = logs.filter((log) => {
    const q = (searchTerm || '').toLowerCase();
    const client = (log.client_name || '').toLowerCase();
    const endpoint = (log.endpoint || '').toLowerCase();
    const ip = log.ip_address || '';
    const details = (log.details || '').toLowerCase();

    const matchesSearch =
      client.includes(q) ||
      endpoint.includes(q) ||
      ip.includes(q) ||
      details.includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'success' && log.status_code >= 200 && log.status_code < 300) ||
      (statusFilter === 'error' && log.status_code >= 400);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60 dark:border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Log Akses Satelit (Audit Trail)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Riwayat lengkap penarikan data secara real-time oleh aplikasi satelit melalui RESTful API terproteksi Bearer Token.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 bg-white/70 hover:bg-white dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-white/70 dark:border-white/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Segarkan Log</span>
        </button>
      </div>

      {/* Unified Search & Filters Bar */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-white/80 dark:border-white/10 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama klien, endpoint, IP address, catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-bold"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-white/90 dark:bg-slate-900/80 border border-white/80 dark:border-white/10 rounded-xl text-xs text-slate-950 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all w-full sm:w-auto cursor-pointer"
          >
            <option value="all">Semua Kode Status HTTP</option>
            <option value="success">Sukses (HTTP 200 OK)</option>
            <option value="error">Ditolak / Error (HTTP 4xx / 5xx)</option>
          </select>
        </div>
      </div>

      {/* Table Summary Meta Bar */}
      <div className="px-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
        <span>
          Menampilkan <strong className="text-slate-950 dark:text-white font-extrabold">{filtered.length}</strong> log akses
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Pencatatan Audit Trail Otomatis</span>
      </div>

      {/* Frosted Glass Table */}
      <div className="overflow-x-auto backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-white/80 dark:border-white/10 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border-b border-white/70 dark:border-white/10 font-extrabold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Waktu Akses</th>
              <th className="py-3.5 px-4">Klien Satelit Pemanggil</th>
              <th className="py-3.5 px-4">Endpoint & Metode</th>
              <th className="py-3.5 px-4">Status & Latensi</th>
              <th className="py-3.5 px-4">IP & Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/60 dark:divide-white/5 text-slate-800 dark:text-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Tidak ada rekaman log akses yang sesuai.
                </td>
              </tr>
            ) : (
              filtered.map((log) => {
                const isSuccess = log.status_code >= 200 && log.status_code < 300;
                return (
                  <tr key={log.id} className="hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{log.client_name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{log.user_agent}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[10px]">
                          {log.method}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 text-xs font-semibold">{log.endpoint}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            isSuccess
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {log.status_code}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {log.duration_ms} ms
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400">{log.ip_address}</div>
                      {log.details && (
                        <div className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                          {log.details}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
