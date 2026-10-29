import React from 'react';
import { Lock, Sparkles, KeyRound, ArrowRight } from 'lucide-react';

interface LockedFeatureBannerProps {
  title?: string;
  description?: string;
  onActivate: () => void;
  compact?: boolean;
}

export const LockedFeatureBanner: React.FC<LockedFeatureBannerProps> = ({
  title = 'Fitur Premium Terkunci',
  description = 'Fitur ini tersedia untuk pengguna Premium. Aktifkan kode lisensi Anda untuk membuka seluruh fitur aplikasi.',
  onActivate,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 font-bold">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-extrabold text-amber-900 mr-2">PREMIUM:</span>
            <span className="text-amber-800">{description}</span>
          </div>
        </div>

        <button
          onClick={onActivate}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs shadow-xs transition shrink-0"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Aktivasi Premium</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/60 to-white p-6 sm:p-8 rounded-3xl border-2 border-amber-300 shadow-sm space-y-4 text-center">
      <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-md shadow-amber-400/25">
        <Lock className="w-7 h-7" />
      </div>

      <div className="space-y-1.5 max-w-lg mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Mode Demo: Akses Terbatas</span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{description}</p>
      </div>

      <div className="pt-2">
        <button
          onClick={onActivate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md shadow-amber-500/25 transition transform hover:-translate-y-0.5"
        >
          <KeyRound className="w-4 h-4" />
          <span>AKTIVASI PREMIUM SEKARANG</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
