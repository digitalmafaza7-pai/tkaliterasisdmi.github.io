import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Sparkles,
  Download,
  Share2,
  ArrowRight,
  Brain,
  HeartHandshake,
  FileCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { HasilPengerjaan } from '../../types/assessment';
import { exportService } from '../../services/exportService';
import { apiService } from '../../services/apiService';
import { storageService } from '../../services/storageService';

interface ResultAnalysisViewProps {
  hasil: HasilPengerjaan;
  onRetry: () => void;
  onBackToHome: () => void;
}

export const ResultAnalysisView: React.FC<ResultAnalysisViewProps> = ({
  hasil,
  onRetry,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'tinjauan'>('ringkasan');
  const [aiRecommendation, setAiRecommendation] = useState<{
    rekomendasi: string[];
    pesanPenyemangat: string;
  } | null>(null);
  const [isLoadingRec, setIsLoadingRec] = useState(false);

  // Trigger celebration confetti if score >= 75
  useEffect(() => {
    if (hasil.nilaiAkhir >= 75) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    // Fetch dynamic AI recommendation if online
    const fetchRec = async () => {
      setIsLoadingRec(true);
      try {
        const res = await apiService.generateRecommendation({ hasilPengerjaan: hasil });
        setAiRecommendation(res);
      } catch {
        // Fallback already in hasil.rekomendasiDiagnostik
      } finally {
        setIsLoadingRec(false);
      }
    };
    fetchRec();
  }, [hasil]);

  const allSoalList = storageService.getSoalList();

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* SCORE BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-10 rounded-3xl shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              Laporan Hasil Asesmen Literasi Membaca
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{hasil.paketJudul}</h1>
            <p className="text-xs sm:text-sm text-indigo-100">
              Peserta: <strong>{hasil.namaPeserta}</strong> • Kelas {hasil.kelas} SD/MI • Durasi: {Math.round(hasil.durasiPengerjaanDetik / 60)} Menit
            </p>
          </div>

          {/* Big Score Badge */}
          <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 min-w-[160px] text-center shadow-inner">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
              Nilai Akhir
            </span>
            <div className="text-5xl font-black text-white my-1">{hasil.nilaiAkhir}</div>
            <span className="text-xs font-bold text-indigo-100">Skala 0 – 100</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10 text-center">
          <div className="bg-white/10 rounded-2xl p-3">
            <div className="text-xl font-bold">{hasil.totalSoal}</div>
            <div className="text-[11px] text-indigo-200">Total Soal</div>
          </div>
          <div className="bg-emerald-500/20 rounded-2xl p-3 text-emerald-200">
            <div className="text-xl font-bold text-white">{hasil.jawabanBenar}</div>
            <div className="text-[11px]">Jawaban Benar</div>
          </div>
          <div className="bg-rose-500/20 rounded-2xl p-3 text-rose-200">
            <div className="text-xl font-bold text-white">{hasil.jawabanSalah}</div>
            <div className="text-[11px]">Jawaban Salah</div>
          </div>
          <div className="bg-amber-500/20 rounded-2xl p-3 text-amber-200">
            <div className="text-xl font-bold text-white">{hasil.jawabanKosong}</div>
            <div className="text-[11px]">Tidak Dijawab</div>
          </div>
        </div>
      </div>

      {/* VIEW TABS: Ringkasan Analisis vs Tinjauan Soal */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'ringkasan'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Analisis Kompetensi & Rekomendasi
          </button>
          <button
            onClick={() => setActiveTab('tinjauan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'tinjauan'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tinjauan Kunci & Pembahasan
          </button>
        </div>

        {/* Export and Retry Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportService.exportHasilCSV([hasil])}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Hasil (CSV)
          </button>
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-xl text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Latihan Ulang
          </button>
        </div>
      </div>

      {activeTab === 'ringkasan' ? (
        <div className="space-y-8">
          {/* 3 COMPETENCY BREAKDOWN CARDS */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-900">
              Hasil Berdasarkan 3 Kompetensi Utama
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hasil.analisisKompetensi.map((comp) => {
                const isGood = comp.persentase >= 75;
                const isFair = comp.persentase >= 50 && comp.persentase < 75;

                return (
                  <div
                    key={comp.kompetensiId}
                    className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{comp.nama}</span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          isGood
                            ? 'bg-emerald-100 text-emerald-800'
                            : isFair
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {comp.persentase}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isGood ? 'bg-emerald-600' : isFair ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${comp.persentase}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Benar {comp.benar} dari {comp.totalSoal} butir</span>
                      <span className="font-semibold text-slate-700">
                        {isGood ? 'Sangat Baik' : isFair ? 'Cukup' : 'Perlu Penguatan'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INDICATOR LEVEL BREAKDOWN & STABILITY WARNING */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Capaian per Indikator Asesmen (10 Indikator Matriks)
                </h3>
                <p className="text-xs text-slate-500">
                  Menganalisis penguasaan kemampuan membaca siswa pada setiap indikator spesifik.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {hasil.analisisIndikator.map((ind) => (
                <div
                  key={ind.kode}
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px]">
                        {ind.kode}
                      </span>
                      <span className="font-bold text-slate-900">{ind.nama}</span>
                    </div>

                    {!ind.stabil && (
                      <div className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Jumlah soal ({ind.totalSoal} butir) belum cukup untuk menggambarkan kemampuan stabil.</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-slate-500 text-[11px]">
                      {ind.benar}/{ind.totalSoal} Soal
                    </span>
                    <span
                      className={`font-black px-2.5 py-1 rounded-xl text-xs ${
                        ind.persentase >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : ind.persentase >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ind.persentase}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI DIAGNOSTIC RECOMMENDATIONS */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 sm:p-8 rounded-3xl border border-indigo-200 space-y-4">
            <div className="flex items-center gap-2 font-bold text-indigo-900 text-base">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Rekomendasi Belajar Cerdas & Penyemangat Siswa</span>
            </div>

            <p className="text-sm text-indigo-950 font-semibold italic">
              "{aiRecommendation?.pesanPenyemangat || hasil.pesanPenyemangat}"
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
                Langkah Latihan Selanjutnya yang Disarankan:
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-indigo-900/90 font-medium">
                {(aiRecommendation?.rekomendasi || hasil.rekomendasiDiagnostik).map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* QUESTION REVIEW WITH DISCUSSION & TEXTUAL EVIDENCE */
        <div className="space-y-6">
          {hasil.detailJawaban.map((item, idx) => {
            const soalData = allSoalList.find((q) => q.id === item.soalId);
            if (!soalData) return null;

            return (
              <div
                key={item.soalId}
                className={`p-6 rounded-3xl border bg-white shadow-xs space-y-4 ${
                  item.apakahBenar ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg text-white font-bold flex items-center justify-center text-xs ${
                        item.apakahBenar ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      {soalData.indikatorKode}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {soalData.kompetensiNama}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      item.apakahBenar
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.apakahBenar ? 'Benar (+1)' : 'Kurang Tepat (0)'}
                  </span>
                </div>

                <p className="font-bold text-sm text-slate-900 leading-snug">
                  {soalData.pertanyaan}
                </p>

                {soalData.pilihan && (
                  <div className="space-y-1.5 pl-2">
                    {soalData.pilihan.map((p) => {
                      const isStudentAns = item.jawabanSiswa === p.kode;
                      const isKey = soalData.kunciJawaban === p.kode;

                      let style = 'bg-slate-50 border-slate-200/60 text-slate-700';
                      if (isKey) {
                        style = 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950';
                      } else if (isStudentAns && !isKey) {
                        style = 'bg-rose-50 border-rose-300 font-bold text-rose-950';
                      }

                      return (
                        <div
                          key={p.kode}
                          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${style}`}
                        >
                          <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-[10px]">
                            {p.kode}
                          </span>
                          <span className="flex-1">{p.teks}</span>
                          {isKey && (
                            <span className="text-[10px] font-black bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded">
                              KUNCI BENAR
                            </span>
                          )}
                          {isStudentAns && !isKey && (
                            <span className="text-[10px] font-black bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded">
                              JAWABAN KAMU
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Bukti & Pembahasan */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  {soalData.buktiTekstual && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                      <span className="font-bold block text-amber-800 text-[10px] uppercase">
                        Bukti Tekstual dalam Stimulus:
                      </span>
                      <span className="italic">"{soalData.buktiTekstual}"</span>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-900 space-y-1">
                    <span className="font-bold block text-blue-800 text-[10px] uppercase">
                      Pembahasan Lengkap:
                    </span>
                    <p className="leading-relaxed">{soalData.pembahasan}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
