import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Sparkles,
  AlertCircle,
  Eye,
  RotateCcw,
  Volume2,
  FileText,
} from 'lucide-react';
import {
  ButirSoal,
  HasilPengerjaan,
  JawabanSiswaItem,
  KelasSD,
  PaketLatihan,
  StimulusBacaan,
} from '../../types/assessment';
import { storageService } from '../../services/storageService';
import { apiService } from '../../services/apiService';

interface PracticeSessionProps {
  paket: PaketLatihan;
  modePengerjaan: 'belajar' | 'ujian';
  onFinishSession: (hasil: HasilPengerjaan) => void;
  onExit: () => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  paket,
  modePengerjaan,
  onFinishSession,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jawabanMap, setJawabanMap] = useState<Record<string, any>>({});
  const [raguRaguMap, setRaguRaguMap] = useState<Record<string, boolean>>({});
  
  // Instant feedback tracking for "Mode Belajar"
  const [revealedStudyMap, setRevealedStudyMap] = useState<Record<string, boolean>>({});

  // Timer in seconds
  const [timeLeft, setTimeLeft] = useState<number>(paket.durasiMenit * 60);
  const [startTime] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Active question and associated stimulus
  const currentSoal: ButirSoal = paket.soalList[currentIndex];
  const currentStimulus: StimulusBacaan | undefined = paket.stimulusList.find(
    (s) => s.id === currentSoal?.stimulusId
  );

  // Timer countdown for Mode Ujian or timer-enabled
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle choice selection
  const handleSelectOption = (kode: string) => {
    setJawabanMap((prev) => ({
      ...prev,
      [currentSoal.id]: kode,
    }));

    if (modePengerjaan === 'belajar') {
      setRevealedStudyMap((prev) => ({
        ...prev,
        [currentSoal.id]: true,
      }));
    }
  };

  // Toggle Ragu-ragu
  const toggleRaguRagu = () => {
    setRaguRaguMap((prev) => ({
      ...prev,
      [currentSoal.id]: !prev[currentSoal.id],
    }));
  };

  // Calculate scores and finalize results
  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    const endTime = Date.now();
    const durationSeconds = Math.round((endTime - startTime) / 1000);

    let totalScoreObtained = 0;
    let totalScoreMax = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;

    const detailJawaban = paket.soalList.map((q) => {
      const studentAns = jawabanMap[q.id];
      const maxScore = q.bobot || 1;
      totalScoreMax += maxScore;

      let isCorrect = false;
      let scoreAwarded = 0;

      if (!studentAns) {
        emptyCount++;
      } else if (q.bentukSoal === 'pilihan_ganda') {
        if (studentAns === q.kunciJawaban) {
          isCorrect = true;
          scoreAwarded = maxScore;
          correctCount++;
        } else {
          wrongCount++;
        }
      } else if (q.bentukSoal === 'uraian_singkat') {
        // Simple heuristic or default half for essay until AI rubric evaluates
        isCorrect = studentAns.trim().length > 10;
        scoreAwarded = isCorrect ? maxScore : 0;
        if (isCorrect) correctCount++;
        else wrongCount++;
      }

      totalScoreObtained += scoreAwarded;

      return {
        soalId: q.id,
        jawabanSiswa: studentAns || null,
        kunciJawaban: q.kunciJawaban,
        apakahBenar: isCorrect,
        skor: scoreAwarded,
        skorMaks: maxScore,
      };
    });

    const finalScore = Math.round((totalScoreObtained / (totalScoreMax || 1)) * 100);

    // Calculate Competency Breakdown
    const competencies = [
      { id: 'pemahaman_tekstual', name: 'Pemahaman Tekstual' },
      { id: 'pemahaman_inferensial', name: 'Pemahaman Inferensial' },
      { id: 'evaluasi_apresiasi', name: 'Evaluasi dan Apresiasi' },
    ];

    const analisisKompetensi = competencies.map((c) => {
      const itemsInComp = paket.soalList.filter((q) => q.kompetensiId === c.id);
      const totalSoalComp = itemsInComp.length;
      const benarComp = itemsInComp.filter((q) => {
        const det = detailJawaban.find((d) => d.soalId === q.id);
        return det?.apakahBenar;
      }).length;

      return {
        kompetensiId: c.id as any,
        nama: c.name,
        totalSoal: totalSoalComp,
        benar: benarComp,
        persentase: totalSoalComp > 0 ? Math.round((benarComp / totalSoalComp) * 100) : 0,
      };
    });

    // Calculate Indicator Breakdown
    const uniqueIndicators = Array.from(new Set(paket.soalList.map((q) => q.indikatorKode)));
    const analisisIndikator = uniqueIndicators.map((indCode) => {
      const questionsWithInd = paket.soalList.filter((q) => q.indikatorKode === indCode);
      const totalSoalInd = questionsWithInd.length;
      const benarInd = questionsWithInd.filter((q) => {
        const det = detailJawaban.find((d) => d.soalId === q.id);
        return det?.apakahBenar;
      }).length;
      const pct = totalSoalInd > 0 ? Math.round((benarInd / totalSoalInd) * 100) : 0;

      return {
        kode: indCode,
        nama: questionsWithInd[0]?.indikatorNama || indCode,
        totalSoal: totalSoalInd,
        benar: benarInd,
        persentase: pct,
        status: (pct >= 80 ? 'Sangat Baik' : pct >= 50 ? 'Cukup' : 'Perlu Bimbingan') as any,
        stabil: totalSoalInd >= 3, // Peringatan stabilitas jika soal < 3
      };
    });

    const userSettings = storageService.getSettings();

    const hasil: HasilPengerjaan = {
      id: `HASIL-${Date.now().toString().slice(-6)}`,
      paketId: paket.id,
      paketJudul: paket.judul,
      namaPeserta: userSettings.namaPengguna || 'Siswa SD Cerdas',
      kelas: paket.kelas,
      mode: modePengerjaan,
      tipe: paket.tipe,
      waktuMulai: new Date(startTime).toISOString(),
      waktuSelesai: new Date(endTime).toISOString(),
      durasiPengerjaanDetik: durationSeconds,
      totalSoal: paket.soalList.length,
      jawabanBenar: correctCount,
      jawabanSalah: wrongCount,
      jawabanKosong: emptyCount,
      nilaiAkhir: finalScore,
      analisisKompetensi: analisisKompetensi,
      analisisIndikator: analisisIndikator,
      rekomendasiDiagnostik: [
        finalScore >= 80
          ? 'Pemahaman membaca kamu sudah sangat baik! Terus tingkatkan kemampuan apresiasi teks sastra.'
          : 'Latihlah fokus menemukan kata kunci pada bacaan dan cermati bukti pendukung di setiap paragraf.',
        'Biasakan membaca keseluruhan teks secara runtut sebelum menentukan pilihan jawaban.',
      ],
      pesanPenyemangat:
        finalScore >= 80
          ? 'Luar biasa! Kamu adalah pembaca yang cermat dan tangguh!'
          : 'Hebat sudah berusaha! Terus berlatih membaca, prestasimu pasti makin bersinar!',
      detailJawaban: detailJawaban,
    };

    // Save to storage
    storageService.saveHasil(hasil);
    setIsSubmitting(false);
    onFinishSession(hasil);
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Top Session Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {currentIndex + 1} / {paket.soalList.length}
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
              {paket.judul}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Kelas {paket.kelas} SD/MI</span>
              <span>•</span>
              <span
                className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                  modePengerjaan === 'belajar'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {modePengerjaan === 'belajar' ? 'Mode Belajar (Edukasi)' : 'Mode Ujian TKA'}
              </span>
            </div>
          </div>
        </div>

        {/* Timer & Finish Button */}
        <div className="flex items-center gap-3">
          {modePengerjaan === 'ujian' && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                timeLeft < 300
                  ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Sisa Waktu: {formatTimer(timeLeft)}</span>
            </div>
          )}

          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition"
          >
            <Send className="w-3.5 h-3.5" />
            Selesai Ujian
          </button>
        </div>
      </div>

      {/* Main Reading & Question Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Stimulus Bacaan (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Wacana Bacaan
              </h3>
            </div>
            {currentStimulus && (
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-lg">
                {currentStimulus.jenisTeks} • {currentStimulus.jumlahKata} kata
              </span>
            )}
          </div>

          {currentStimulus ? (
            <div className="space-y-3">
              <h4 className="font-extrabold text-base sm:text-lg text-slate-900 text-center">
                {currentStimulus.judul}
              </h4>
              <div className="bg-slate-50/70 p-4 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed max-h-[480px] overflow-y-auto whitespace-pre-line border border-slate-200/60 font-serif">
                {currentStimulus.isi}
              </div>
              <div className="text-[11px] text-slate-500 italic text-right">
                Sumber: {currentStimulus.sumber}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Stimulus wacana tidak ditemukan.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Question & Answer (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          {/* Question Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
                Soal No. {currentIndex + 1}
              </span>
              <span className="text-xs font-bold text-slate-600">
                {currentSoal?.indikatorKode}
              </span>
            </div>

            <button
              onClick={toggleRaguRagu}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition border ${
                raguRaguMap[currentSoal?.id]
                  ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Flag className="w-3.5 h-3.5 text-amber-500" />
              <span>Ragu-ragu</span>
            </button>
          </div>

          {/* Question Text */}
          <div className="space-y-1">
            <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
              {currentSoal?.pertanyaan}
            </p>
          </div>

          {/* Options */}
          {currentSoal?.pilihan && (
            <div className="space-y-2.5 pt-1">
              {currentSoal.pilihan.map((p) => {
                const isSelected = jawabanMap[currentSoal.id] === p.kode;
                const isCorrect = p.kode === currentSoal.kunciJawaban;
                const showInstantKey = modePengerjaan === 'belajar' && revealedStudyMap[currentSoal.id];

                let optionStyle = 'bg-white border-slate-200/90 text-slate-800 hover:border-blue-400';
                if (showInstantKey) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-red-50 border-red-300 text-red-900';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500/10';
                }

                return (
                  <div
                    key={p.kode}
                    onClick={() => handleSelectOption(p.kode)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition text-xs sm:text-sm flex items-start gap-3 ${optionStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {p.kode}
                    </span>
                    <span className="flex-1 leading-snug">{p.teks}</span>
                    {showInstantKey && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Essay Answer Input */}
          {currentSoal?.bentukSoal === 'uraian_singkat' && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700">Tulis Jawaban Uraian Kamu:</label>
              <textarea
                value={jawabanMap[currentSoal.id] || ''}
                onChange={(e) =>
                  setJawabanMap((prev) => ({
                    ...prev,
                    [currentSoal.id]: e.target.value,
                  }))
                }
                placeholder="Tuliskan penjelasan dan alasan jawaban berdasarkan bacaan..."
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 h-32"
              />
            </div>
          )}

          {/* Instant Educational Feedback (Mode Belajar Only) */}
          {modePengerjaan === 'belajar' && revealedStudyMap[currentSoal?.id] && (
            <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 text-xs text-indigo-950 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-indigo-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Pembahasan & Bukti Tekstual:</span>
              </div>
              <p className="leading-relaxed">{currentSoal.pembahasan}</p>
              {currentSoal.buktiTekstual && (
                <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100 text-[11px] italic">
                  <strong>Bukti Kalimat Teks:</strong> "{currentSoal.buktiTekstual}"
                </div>
              )}
            </div>
          )}

          {/* Bottom Question Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>

            <span className="text-xs font-semibold text-slate-500">
              {Object.keys(jawabanMap).length} dari {paket.soalList.length} Terjawab
            </span>

            <button
              onClick={() =>
                setCurrentIndex((prev) => Math.min(paket.soalList.length - 1, prev + 1))
              }
              disabled={currentIndex === paket.soalList.length - 1}
              className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-40"
            >
              Berikutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Question Number Palette / Sheet */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase">
              Lembar Navigasi Soal:
            </div>
            <div className="flex flex-wrap gap-2">
              {paket.soalList.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(jawabanMap[q.id]);
                const isRagu = Boolean(raguRaguMap[q.id]);

                let btnBg = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isCurrent) {
                  btnBg = 'bg-blue-600 text-white ring-2 ring-blue-500/40 font-bold';
                } else if (isRagu) {
                  btnBg = 'bg-amber-400 text-slate-900 font-bold';
                } else if (isAnswered) {
                  btnBg = 'bg-emerald-500 text-white font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center transition ${btnBg}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-bold text-lg text-slate-900">
                Selesaikan Latihan Sekarang?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kamu telah menjawab{' '}
                <strong className="text-emerald-700">
                  {Object.keys(jawabanMap).length} dari {paket.soalList.length} butir soal
                </strong>
                . Apakah kamu sudah yakin untuk mengirimkan seluruh jawabanmu?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Periksa Kembali
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmitExam();
                }}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
              >
                {isSubmitting ? 'Menilai...' : 'Ya, Kirim Jawaban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
