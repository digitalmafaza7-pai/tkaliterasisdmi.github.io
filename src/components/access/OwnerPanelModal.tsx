import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Plus,
  Copy,
  Check,
  X,
  RefreshCw,
  Lock,
  Unlock,
  Users,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface OwnerLicenseItem {
  code: string;
  createdAt: string;
  maxUsage: number;
  usageCount: number;
  status: 'active' | 'revoked';
  note?: string;
  activations: {
    installationId: string;
    activatedAt: string;
    clientName?: string;
  }[];
}

interface OwnerPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OwnerPanelModal: React.FC<OwnerPanelModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ownerToken, setOwnerToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Licenses list
  const [licenses, setLicenses] = useState<OwnerLicenseItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Code Form
  const [newMaxUsage, setNewMaxUsage] = useState<number>(1);
  const [newNote, setNewNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Owner Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'PIN Owner salah.');
      }

      setOwnerToken(data.ownerToken);
      setIsAuthenticated(true);
      fetchLicenses(data.ownerToken);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal login.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch Licenses
  const fetchLicenses = async (token: string) => {
    try {
      const res = await fetch('/api/owner/licenses', {
        headers: { 'x-owner-token': token },
      });
      const data = await res.json();
      if (data.licenses) {
        setLicenses(data.licenses);
      }
    } catch (err) {
      console.error('Failed to fetch licenses:', err);
    }
  };

  // 3. Generate New Code
  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerToken) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/owner/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-token': ownerToken,
        },
        body: JSON.stringify({ maxUsage: newMaxUsage, note: newNote }),
      });

      const data = await res.json();
      if (data.success && data.license) {
        setLicenses((prev) => [data.license, ...prev]);
        setNewNote('');
        handleCopy(data.license.code);
      }
    } catch (err) {
      alert('Gagal membuat kode aktivasi baru.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Revoke / Restore Code
  const handleToggleStatus = async (code: string) => {
    if (!ownerToken) return;

    try {
      const res = await fetch('/api/owner/revoke-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-token': ownerToken,
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (data.success) {
        setLicenses((prev) =>
          prev.map((item) => (item.code === code ? { ...item, status: data.status } : item))
        );
      }
    } catch (err) {
      alert('Gagal mengubah status lisensi.');
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 leading-tight">
              Panel Administrator Lisensi OWNER
            </h3>
            <p className="text-xs text-slate-500">
              Pusat Penerbitan, Kontrol Kuota & Pencabutan Lisensi Premium
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          /* OWNER LOGIN */
          <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6 text-slate-600" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900">Masukkan PIN Pemilik Aplikasi</h4>
              <p className="text-xs text-slate-500">
                Otorisasi server-side untuk mengelola kode aktivasi.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN Owner (Default: owner12345)"
                className="w-full text-center text-sm p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />

              {errorMessage && (
                <div className="text-xs text-red-600 font-medium">{errorMessage}</div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !pin.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
            >
              {isLoading ? 'Memeriksa PIN...' : 'Masuk ke Panel Owner'}
            </button>
          </form>
        ) : (
          /* OWNER DASHBOARD */
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Generator Form */}
            <form
              onSubmit={handleGenerateCode}
              className="bg-indigo-50/70 p-4 sm:p-5 rounded-2xl border border-indigo-100 space-y-3"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-indigo-950">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Terbitkan Kode Aktivasi Baru:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Batas Penggunaan:</label>
                  <select
                    value={newMaxUsage}
                    onChange={(e) => setNewMaxUsage(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value={1}>1 Perangkat (Tunggal)</option>
                    <option value={5}>5 Perangkat</option>
                    <option value={20}>20 Perangkat (1 Kelas)</option>
                    <option value={100}>100 Perangkat (Sekolah)</option>
                    <option value={9999}>Tak Terbatas</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Catatan Pembeli / Sekolah:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Contoh: SD Negeri 05 Solo / Guru A"
                      className="flex-1 text-xs p-2 rounded-xl border border-slate-200 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 shrink-0"
                    >
                      {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Terbitkan</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* List of Activation Codes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Daftar Kode Aktivasi Terdaftar ({licenses.length})</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Klik kode untuk menyalin ke clipboard
                </span>
              </div>

              <div className="space-y-2.5">
                {licenses.map((lic) => {
                  const isRevoked = lic.status === 'revoked';
                  const isMaxed = lic.usageCount >= lic.maxUsage;

                  return (
                    <div
                      key={lic.code}
                      className={`p-3.5 rounded-2xl border text-xs space-y-2 transition ${
                        isRevoked
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(lic.code)}
                            className="font-mono font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-900 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition"
                            title="Salin kode"
                          >
                            <span>{lic.code}</span>
                            {copiedCode === lic.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>

                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isRevoked
                                ? 'bg-rose-100 text-rose-800'
                                : isMaxed
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isRevoked ? 'DICABUT' : isMaxed ? 'KUOTA PENUH' : 'AKTIF'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-semibold">
                            Terpakai: {lic.usageCount} / {lic.maxUsage}
                          </span>

                          <button
                            onClick={() => handleToggleStatus(lic.code)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                              isRevoked
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                          >
                            {isRevoked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{isRevoked ? 'Pulihkan' : 'Cabut'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                        <span>Catatan: {lic.note || 'Tanpa catatan'}</span>
                        <span>Dibuat: {new Date(lic.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>

                      {/* Activation list snippet */}
                      {lic.activations && lic.activations.length > 0 && (
                        <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                          <span>Instalasi aktif: </span>
                          {lic.activations.map((act) => act.installationId.slice(0, 12)).join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
