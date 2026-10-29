import React, { useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { accessService } from '../../services/accessService';

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMessage('Silakan masukkan kode aktivasi terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await accessService.activateCode(code);
    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      setSuccessMessage(result.message);
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleClose = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                Lisensi Terverifikasi Permanen
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                AKTIVASI BERHASIL!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                {successMessage ||
                  'Selamat! Seluruh fitur aplikasi kini telah terbuka. Anda dapat menggunakan aplikasi dengan akses premium permanen sesuai ketentuan lisensi.'}
              </p>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 font-medium space-y-1 text-left">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Hak Akses Terbuka Sekarang:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-900/90 pl-1">
                <li>Generator Soal & Stimulus AI Tanpa Batas</li>
                <li>Simulasi Ujian TKA Berbatas Waktu Lengkap</li>
                <li>Pusat Cetak Dokumen Resmi Word (.doc) & Excel (.csv)</li>
                <li>Penyimpanan Permanen tanpa biaya berlangganan</li>
              </ul>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition"
            >
              MULAI MENGGUNAKAN APLIKASI
            </button>
          </div>
        ) : (
          /* FORM STATE */
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 leading-tight">
                  Aktivasi Premium
                </h3>
                <p className="text-xs text-slate-500">
                  Akses Penuh Selamanya Tanpa Berlangganan
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Masukkan kode aktivasi resmi dari <strong>OWNER</strong> untuk membuka seluruh fitur aplikasi secara permanen.
            </p>

            {/* Form */}
            <form onSubmit={handleActivate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Kode Aktivasi Resmi:</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Contoh: TKAPRO-XXXX-XXXX-XXXX
                  </span>
                </label>

                <div className="relative">
                  <input
                    type={showCode ? 'text' : 'password'}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Masukkan kode aktivasi di sini..."
                    disabled={isSubmitting}
                    className="w-full text-sm font-mono tracking-wider p-3.5 pr-11 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 uppercase font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Benefits Info Box */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Manfaat Aktivasi Premium Permanen:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 pl-1">
                  <div>✓ Membuka seluruh fitur aplikasi</div>
                  <div>✓ Pembuatan soal & stimulus AI</div>
                  <div>✓ Simulasi ujian TKA resmi</div>
                  <div>✓ Ekspor dokumen Word & Excel</div>
                  <div>✓ Tersimpan permanen di perangkat</div>
                  <div>✓ Tanpa biaya langganan bulanan</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-500/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Aktivasi Sekarang
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
