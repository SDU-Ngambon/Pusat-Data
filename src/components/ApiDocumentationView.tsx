import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Send,
  Copy,
  Check,
  Code2,
  Clock,
  ShieldCheck,
  KeyRound,
  Layers,
  GraduationCap,
  Users,
  BookOpen,
  School,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { ApiClient, AcademicClass } from '../types/index.js';
import { apiService } from '../services/api.js';

interface ApiDocumentationViewProps {
  clients: ApiClient[];
  classes: AcademicClass[];
  preselectedClient?: ApiClient | null;
}

interface EndpointDef {
  path: string;
  method: 'GET' | 'POST';
  scope: string;
  title: string;
  description: string;
  queryParams?: { name: string; desc: string; sample: string }[];
  bodyParams?: { name: string; desc: string; sample: string }[];
}

const ENDPOINTS: EndpointDef[] = [
  {
    path: '/api/v1/sync/school-profile',
    method: 'GET',
    scope: 'read:profile',
    title: 'Profil & Identitas Sekolah',
    description: 'Mengembalikan informasi identitas resmi sekolah, NPSN, akreditasi, nama kepala sekolah, NIP, serta URL logo dan favicon.',
  },
  {
    path: '/api/v1/sync/classes',
    method: 'GET',
    scope: 'read:classes',
    title: 'Daftar Rombongan Belajar',
    description: 'Mengembalikan seluruh data rombel aktif pada tahun ajaran berjalan lengkap dengan tingkat kelas dan konsentrasi kejuruan.',
  },
  {
    path: '/api/v1/sync/students',
    method: 'GET',
    scope: 'read:students',
    title: 'Data Siswa & Barcode Presensi',
    description: 'Mengembalikan data siswa lengkap dengan NISN unik, NIS, nama rombel, angkatan, barcode kartu pelajar. Mendukung filter rombel dan inkremental update via timestamp.',
    queryParams: [
      { name: 'class', desc: 'Filter berdasarkan nama rombel (Contoh: "10 TKR 1")', sample: '10 TKR 1' },
      { name: 'updated_after', desc: 'Filter inkremental (hanya data yang diupdate setelah ISO date ini)', sample: '2026-09-01T00:00:00Z' },
      { name: 'status', desc: 'Filter status siswa (Aktif / Lulus / Pindah)', sample: 'Aktif' },
    ],
  },
  {
    path: '/api/v1/sync/teachers',
    method: 'GET',
    scope: 'read:teachers',
    title: 'Data Guru & Wali Kelas',
    description: 'Mengembalikan data pendidik, NIP unik, no WA, dan penugasan wali kelas untuk integrasi aplikasi e-rapor dan bot presensi.',
    queryParams: [
      { name: 'homeroom_only', desc: 'Hanya tampilkan guru yang menjadi wali kelas (true/false)', sample: 'true' },
      { name: 'updated_after', desc: 'Filter inkremental ISO timestamp', sample: '2026-09-01T00:00:00Z' },
    ],
  },
  {
    path: '/api/v1/sync/subjects',
    method: 'GET',
    scope: 'read:subjects',
    title: 'Data Mata Pelajaran',
    description: 'Mengembalikan daftar mata pelajaran kurikulum merdeka (Kejuruan, Umum, Muatan Lokal) dan alokasi JP per minggu.',
    queryParams: [
      { name: 'kelompok', desc: 'Filter kelompok mapel (Kejuruan / Umum / Muatan Lokal)', sample: 'Kejuruan' },
    ],
  },
  {
    path: '/api/v1/sync/verify-token',
    method: 'POST',
    scope: 'read:profile',
    title: 'Verifikasi Token Klien Satelit',
    description: 'Endpoint health check bagi aplikasi satelit untuk memastikan API Key masih aktif dan mendapatkan informasi identitas klien yang berwenang.',
    bodyParams: [
      { name: 'client_app_name', desc: 'Nama aplikasi pemanggil untuk dicatat di log audit', sample: 'Presensi-App-Mobile' },
    ],
  },
];

export const ApiDocumentationView: React.FC<ApiDocumentationViewProps> = ({
  clients,
  classes,
  preselectedClient,
}) => {
  const [activeTab, setActiveTab] = useState<'tester' | 'specs'>('tester');
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(2); // default /students
  const [selectedClientId, setSelectedClientId] = useState<string>(
    preselectedClient?.id || clients[0]?.id || ''
  );

  // Custom token override for negative testing
  const [useCustomToken, setUseCustomToken] = useState(false);
  const [customTokenValue, setCustomTokenValue] = useState('sk_invalid_test_token_12345');

  // Query parameter inputs
  const [paramClass, setParamClass] = useState<string>('');
  const [paramUpdatedAfter, setParamUpdatedAfter] = useState<string>('');
  const [paramStatus, setParamStatus] = useState<string>('');
  const [postBodyJson, setPostBodyJson] = useState<string>('{\n  "client_app_name": "Testing Client Satelit"\n}');

  // Execution states
  const [executing, setExecuting] = useState(false);
  const [responseResult, setResponseResult] = useState<{
    status: number;
    duration: number;
    url: string;
    headers: Record<string, string>;
    response: any;
  } | null>(null);

  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  useEffect(() => {
    if (preselectedClient) {
      setSelectedClientId(preselectedClient.id);
    }
  }, [preselectedClient]);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const endpoint = ENDPOINTS[selectedEndpointIndex];

  // Active API Token to use
  const activeToken = useCustomToken ? customTokenValue : selectedClient?.api_key || '';

  // Generate full URL
  const buildFullUrl = () => {
    let url = endpoint.path;
    const qParams: string[] = [];

    if (endpoint.path === '/api/v1/sync/students') {
      if (paramClass) qParams.push(`class=${encodeURIComponent(paramClass)}`);
      if (paramUpdatedAfter) qParams.push(`updated_after=${encodeURIComponent(paramUpdatedAfter)}`);
      if (paramStatus) qParams.push(`status=${encodeURIComponent(paramStatus)}`);
    }

    if (qParams.length > 0) {
      url += '?' + qParams.join('&');
    }

    return url;
  };

  const fullUrl = buildFullUrl();

  // Generate equivalent cURL string
  const generateCurlCommand = () => {
    const host = window.location.origin;
    if (endpoint.method === 'POST') {
      return `curl -X POST "${host}${fullUrl}" \\\n  -H "Authorization: Bearer ${activeToken}" \\\n  -H "Content-Type: application/json" \\\n  -d '${postBodyJson.replace(/\n/g, '')}'`;
    }
    return `curl -X GET "${host}${fullUrl}" \\\n  -H "Authorization: Bearer ${activeToken}" \\\n  -H "Accept: application/json"`;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurlCommand());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyResponse = () => {
    if (!responseResult) return;
    navigator.clipboard.writeText(JSON.stringify(responseResult.response, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const handleSendTestRequest = async () => {
    setExecuting(true);
    setResponseResult(null);

    const startTime = performance.now();
    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };

      if (endpoint.method === 'POST') {
        options.body = postBodyJson;
      }

      const res = await fetch(fullUrl, options);
      const duration = Math.round(performance.now() - startTime);

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: 'Respons bukan JSON yang valid' };
      }

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });

      setResponseResult({
        status: res.status,
        duration,
        url: fullUrl,
        headers: resHeaders,
        response: data,
      });
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      setResponseResult({
        status: 0,
        duration,
        url: fullUrl,
        headers: {},
        response: { error: err.message || 'Network error atau koneksi server terputus.' },
      });
    } finally {
      setExecuting(false);
    }
  };

  const applyPresetUpdatedAfter = (hours: number) => {
    const d = new Date(Date.now() - hours * 3600 * 1000);
    setParamUpdatedAfter(d.toISOString());
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60 dark:border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Dokumentasi & Playground API
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Spesifikasi teknis protokol RESTful API Bearer Token serta sarana pengujian interaktif secara real-time.
          </p>
        </div>

        {/* Tab Navigation Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-xl self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'tester'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Playground Tester
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Spesifikasi Lengkap
          </button>
        </div>
      </div>

      {/* TAB 1: PLAYGROUND TESTER */}
      {activeTab === 'tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Form Controls (5 cols) */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 border border-white/70 dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 pb-2 border-b border-white/60 dark:border-white/10">
              <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Konfigurasi Request Pengujian</span>
            </h3>

            {/* Step 1: Select Satellite Client Key */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                1. Pilih Klien Satelit Pemanggil:
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setUseCustomToken(false);
                }}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.client_name} ({c.status})
                  </option>
                ))}
              </select>

              {selectedClient && (
                <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Scope Terdaftar:</span>
                    <span className="font-semibold text-indigo-600">
                      {selectedClient.allowed_scopes.length} scope
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedClient.allowed_scopes.map((sc) => (
                      <span
                        key={sc}
                        className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono text-[10px] px-1.5 py-0.2 rounded"
                      >
                        {sc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Negative testing checkbox */}
              <div className="pt-1 flex items-center justify-between">
                <label className="text-[11px] text-slate-500 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomToken}
                    onChange={(e) => setUseCustomToken(e.target.checked)}
                    className="accent-slate-900 rounded"
                  />
                  <span>Gunakan Token Kustom (Uji Error 401)</span>
                </label>
              </div>

              {useCustomToken && (
                <input
                  type="text"
                  value={customTokenValue}
                  onChange={(e) => setCustomTokenValue(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-rose-300 rounded-xl text-xs font-mono text-rose-700 focus:outline-none"
                  placeholder="Masukkan token invalid..."
                />
              )}
            </div>

            {/* Step 2: Select Endpoint */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                2. Pilih Endpoint REST API:
              </label>
              <div className="space-y-1.5">
                {ENDPOINTS.map((ep, idx) => {
                  const isSelected = selectedEndpointIndex === idx;
                  return (
                    <button
                      key={ep.path}
                      type="button"
                      onClick={() => {
                        setSelectedEndpointIndex(idx);
                        setResponseResult(null);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-300 text-slate-900 shadow-xs'
                          : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              ep.method === 'GET'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            }`}
                          >
                            {ep.method}
                          </span>
                          <span className="text-slate-900 text-xs">{ep.path}</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-indigo-700">
                          {ep.scope}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate">{ep.title}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Query Parameters if applicable */}
            {endpoint.path === '/api/v1/sync/students' && (
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="text-xs font-bold text-slate-800">
                  Parameter Filter / Inkremental:
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Filter Rombel (<code className="text-indigo-600 font-mono">?class=</code>):
                  </label>
                  <select
                    value={paramClass}
                    onChange={(e) => setParamClass(e.target.value)}
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="">Semua Rombel (Tanpa Filter)</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.class_name}>
                        {c.class_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-500">
                      Inkremental (<code className="text-indigo-600 font-mono">?updated_after=</code>):
                    </label>
                    <button
                      type="button"
                      onClick={() => setParamUpdatedAfter('')}
                      className="text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: 2026-09-01T00:00:00Z"
                    value={paramUpdatedAfter}
                    onChange={(e) => setParamUpdatedAfter(e.target.value)}
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
                  />
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => applyPresetUpdatedAfter(1)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600 cursor-pointer"
                    >
                      1 Jam Lalu
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetUpdatedAfter(24)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600 cursor-pointer"
                    >
                      24 Jam
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetUpdatedAfter(168)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600 cursor-pointer"
                    >
                      7 Hari
                    </button>
                  </div>
                </div>
              </div>
            )}

            {endpoint.method === 'POST' && (
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  JSON Body:
                </label>
                <textarea
                  rows={3}
                  value={postBodyJson}
                  onChange={(e) => setPostBodyJson(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>
            )}

            {/* Big Send Request Button */}
            <button
              onClick={handleSendTestRequest}
              disabled={executing}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {executing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mengirim Permintaan ke Endpoint...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Permintaan (Uji Endpoint Sekarang)</span>
                </>
              )}
            </button>
          </div>

          {/* Right Execution & Response Panel (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* cURL Command Preview */}
            <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 border border-white/70 dark:border-white/10 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  cURL Equivalent
                </span>
                <button
                  onClick={handleCopyCurl}
                  className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-white/60 dark:border-white/10 hover:bg-white text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Salin cURL</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3 bg-white/80 dark:bg-slate-900/80 border border-white/60 dark:border-white/10 text-indigo-950 dark:text-indigo-200 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre-wrap font-medium">
                {generateCurlCommand()}
              </pre>
            </div>

            {/* Live Response Result Box */}
            <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-800/60 border border-white/70 dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-3 min-h-[380px] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-white/60 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Live Response Output</h3>
                  {responseResult && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                          responseResult.status >= 200 && responseResult.status < 300
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                        }`}
                      >
                        HTTP {responseResult.status} {responseResult.status === 200 ? 'OK' : ''}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {responseResult.duration} ms
                      </span>
                      {responseResult.response?.data_count !== undefined && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-mono">
                          {responseResult.response.data_count} data
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {responseResult && (
                  <button
                    onClick={handleCopyResponse}
                    className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-white/60 dark:border-white/10 hover:bg-white text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    {copiedResponse ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Salin JSON</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Response Body Viewer */}
              {!responseResult ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500 space-y-2">
                  <Terminal className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Belum ada permintaan yang dikirim.
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-sm">
                    Pilih endpoint dan klik tombol <span className="text-slate-900 dark:text-white font-semibold">"Kirim Permintaan"</span> untuk melihat output data JSON yang sesungguhnya.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <pre className="flex-1 p-4 bg-white/80 dark:bg-slate-900/80 border border-white/60 dark:border-white/10 rounded-2xl font-mono text-xs text-slate-800 dark:text-slate-100 overflow-y-auto max-h-[460px] leading-relaxed select-all">
                    {JSON.stringify(responseResult.response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPESIFIKASI ENDPOINT LENGKAP */}
      {activeTab === 'specs' && (
        <div className="space-y-6">
          <div className="bg-[#F9FAFB] border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Standarisasi Format Respons RESTful API Pusat Data Sekolah
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Semua respons API dijamin menggunakan struktur JSON terstandarisasi dengan field <code className="text-indigo-600 font-mono">success</code> (boolean), <code className="text-indigo-600 font-mono">timestamp</code> (ISO 8601), <code className="text-indigo-600 font-mono">data_count</code> (jumlah item), dan <code className="text-indigo-600 font-mono">data</code> (payload utama).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-700 block mb-1">
                  Format Sukses (HTTP 200 OK):
                </span>
                <pre className="p-3 bg-white border border-emerald-200 text-emerald-800 rounded-xl font-mono text-[11px] overflow-x-auto">
{`{
  "success": true,
  "timestamp": "2026-10-05T08:00:00.000Z",
  "data_count": 816,
  "data": [ ... ]
}`}
                </pre>
              </div>

              <div>
                <span className="text-xs font-semibold text-rose-700 block mb-1">
                  Format Penolakan (HTTP 401 / 403):
                </span>
                <pre className="p-3 bg-white border border-rose-200 text-rose-800 rounded-xl font-mono text-[11px] overflow-x-auto">
{`{
  "success": false,
  "timestamp": "2026-10-05T08:00:00.000Z",
  "error": "Forbidden: Klien tidak memiliki hak akses (scope)"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
