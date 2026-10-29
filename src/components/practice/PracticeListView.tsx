import React from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Play,
  ArrowRight,
  Layers,
  Sparkles,
  Award,
  Lock,
} from 'lucide-react';
import { KelasSD, PaketLatihan } from '../../types/assessment';
import { storageService } from '../../services/storageService';

interface PracticeListViewProps {
  currentKelas: KelasSD;
  onSelectPaket: (paket: PaketLatihan, mode: 'belajar' | 'ujian') => void;
  onOpenSimulation: () => void;
  isPremium?: boolean;
  onOpenActivation?: () => void;
}

export const PracticeListView: React.FC<PracticeListViewProps> = ({
  currentKelas,
  onSelectPaket,
  onOpenSimulation,
  isPremium = false,
  onOpenActivation,
}) => {
  const allPaket = storageService.getPaketList();
  const classPaket = allPaket.filter((p) => p.kelas === currentKelas);
  const otherPaket = allPaket.filter((p) => p.kelas !== currentKelas);

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-700 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="max-w-4xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            Paket Latihan Terstruktur SD/MI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Latihan Literasi Membaca Kelas {currentKelas} SD/MI
          </h1>
          <p className="text-sm text-blue-100">
            Pilih paket latihan untuk mengasah pemahaman tersurat, inferensi tersirat, dan evaluasi apresiasi dengan bimbingan pembahasan langkah demi langkah.
          </p>
        </div>
      </div>

      {/* Mode Comparison Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50/70 border border-blue-200 p-5 rounded-3xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Mode Belajar (Edukasi Interaktif)</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Siswa langsung melihat kunci jawaban dan pembahasan mendidik segera setelah memilih jawaban. Cocok untuk mengasah konsep dan membaca ulang stimulus.
          </p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-3xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Mode Ujian / Simulasi TKA</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Kunci jawaban disembunyikan sampai akhir pengerjaan. Timer countdown berjalan dan seluruh hasil dievaluasi menyeluruh di lembar akhir.
          </p>
        </div>
      </div>

      {/* Main Packages for Current Grade */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-900">
            Paket Sesuai Kelas {currentKelas} SD/MI
          </h3>
          <button
            onClick={() => {
              if (!isPremium && onOpenActivation) {
                onOpenActivation();
              } else {
                onOpenSimulation();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Buka Menu Simulasi TKA</span>
            {!isPremium && <Lock className="w-3 h-3 text-amber-600" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classPaket.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold">
                Belum ada paket khusus Kelas {currentKelas}. Kamu bisa membuat paket baru dari Generator AI atau mencoba paket kelas lainnya di bawah!
              </p>
            </div>
          ) : (
            classPaket.map((paket) => (
              <div
                key={paket.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                        Kelas {paket.kelas} SD/MI
                      </span>
                      {paket.tipe === 'simulasi_tka' && !isPremium && (
                        <span className="flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] border border-amber-200">
                          <Lock className="w-2.5 h-2.5 text-amber-600" />
                          PREMIUM
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {paket.durasiMenit} Menit
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                    {paket.judul}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {paket.deskripsi}
                  </p>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700 flex items-center justify-between">
                    <span>{paket.soalList.length} Butir Soal</span>
                    <span>•</span>
                    <span>{paket.stimulusList.length} Stimulus Teks</span>
                    <span>•</span>
                    <span className="font-semibold text-indigo-700">3 Kompetensi</span>
                  </div>
                </div>

                {/* Mode Action Buttons */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectPaket(paket, 'belajar')}
                    className="flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 px-3 rounded-xl text-xs transition"
                  >
                    <BookOpen className="w-4 h-4" />
                    Mode Belajar
                  </button>

                  <button
                    onClick={() => {
                      if (!isPremium && paket.tipe === 'simulasi_tka') {
                        if (onOpenActivation) onOpenActivation();
                        return;
                      }
                      onSelectPaket(paket, 'ujian');
                    }}
                    className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-xs transition"
                  >
                    <Play className="w-4 h-4" />
                    <span>Mode Ujian</span>
                    {!isPremium && paket.tipe === 'simulasi_tka' && (
                      <Lock className="w-3.5 h-3.5 text-amber-200" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Packages from other classes */}
      {otherPaket.length > 0 && (
        <div className="space-y-4 pt-6">
          <h3 className="font-bold text-sm text-slate-700">
            Paket dari Jenjang Kelas Lainnya:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherPaket.map((paket) => (
              <div
                key={paket.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                      Kelas {paket.kelas}
                    </span>
                    <span className="text-slate-500">{paket.soalList.length} Soal</span>
                  </div>
                  <h5 className="font-bold text-slate-900 line-clamp-1">{paket.judul}</h5>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectPaket(paket, 'belajar')}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition"
                  >
                    Belajar
                  </button>
                  <button
                    onClick={() => {
                      if (!isPremium && paket.tipe === 'simulasi_tka') {
                        if (onOpenActivation) onOpenActivation();
                        return;
                      }
                      onSelectPaket(paket, 'ujian');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
                  >
                    <span>Ujian</span>
                    {!isPremium && paket.tipe === 'simulasi_tka' && (
                      <Lock className="w-2.5 h-2.5 text-amber-200" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
