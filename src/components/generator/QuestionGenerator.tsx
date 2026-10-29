import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Send,
  Save,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  FileText,
  AlertCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Eye,
  Sliders,
} from 'lucide-react';
import {
  BentukSoal,
  ButirSoal,
  IndikatorKode,
  JenisTeks,
  KelasSD,
  KompetensiId,
  StimulusBacaan,
  TingkatKesulitan,
} from '../../types/assessment';
import {
  INDIKATOR_MATRIKS,
  KOMPETENSI_LIST,
  STANDAR_KELAS_SD,
} from '../../data/assessmentFramework';
import { apiService } from '../../services/apiService';
import { storageService } from '../../services/storageService';

import { LockedFeatureBanner } from '../access/LockedFeatureBanner';

interface QuestionGeneratorProps {
  currentKelas: KelasSD;
  isPremium?: boolean;
  onOpenActivation?: () => void;
  onQuestionsSaved?: () => void;
  onNavigateToValidator?: (soal: ButirSoal, stimulus: StimulusBacaan) => void;
}

export const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({
  currentKelas: initialKelas,
  isPremium = false,
  onOpenActivation,
  onQuestionsSaved,
  onNavigateToValidator,
}) => {
  // Config state
  const [kelas, setKelas] = useState<KelasSD>(initialKelas);
  const [kompetensiId, setKompetensiId] = useState<KompetensiId>('pemahaman_tekstual');
  const [indikatorKode, setIndikatorKode] = useState<IndikatorKode>('SD-T01');
  const [jenisTeks, setJenisTeks] = useState<JenisTeks>('Fiksi');
  const [topik, setTopik] = useState('');
  const [tingkatKesulitan, setTingkatKesulitan] = useState<TingkatKesulitan>('Sedang');
  const [bentukSoal, setBentukSoal] = useState<BentukSoal>('pilihan_ganda');
  const [jumlahSoal, setJumlahSoal] = useState<number>(2);

  // Stimulus source: 'generate_new' | 'existing_bank'
  const [stimulusMode, setStimulusMode] = useState<'generate_new' | 'existing_bank'>('generate_new');
  const [selectedStimulusId, setSelectedStimulusId] = useState<string>('');

  // Active stimulus being used
  const [activeStimulus, setActiveStimulus] = useState<StimulusBacaan | null>(null);

  // Results
  const [generatedQuestions, setGeneratedQuestions] = useState<ButirSoal[]>([]);
  const [isGeneratingStimulus, setIsGeneratingStimulus] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const existingStimulusList = storageService.getStimulusList().filter((s) => s.kelas === kelas);
  const currentKompetensi = KOMPETENSI_LIST[kompetensiId];
  const currentIndikator = INDIKATOR_MATRIKS[indikatorKode];

  // Auto-update indicator if competency changes
  const handleKompetensiChange = (newKompetensiId: KompetensiId) => {
    setKompetensiId(newKompetensiId);
    const available = KOMPETENSI_LIST[newKompetensiId].indikatorList;
    if (available.length > 0 && !available.includes(indikatorKode)) {
      setIndikatorKode(available[0]);
    }
  };

  // 1. Generate or Select Stimulus
  const handleGenerateStimulus = async () => {
    if (!isPremium) {
      if (onOpenActivation) onOpenActivation();
      setErrorMessage(
        'Pembuatan stimulus baru dengan AI merupakan fitur Premium. Silakan masukkan kode aktivasi Anda untuk membuka akses tanpa batas.'
      );
      return;
    }

    setIsGeneratingStimulus(true);
    setErrorMessage(null);
    setStatusMessage('Sedang menyusun stimulus bacaan ramah anak dengan AI...');

    try {
      const stim = await apiService.generateStimulus({
        kelas: kelas,
        jenisTeks: jenisTeks,
        topik: topik.trim() || undefined,
        panjangKata: STANDAR_KELAS_SD[kelas].panjangKataMin + 40,
      });

      setActiveStimulus(stim);
      storageService.saveStimulus(stim);
      setStatusMessage(`Stimulus "${stim.judul}" (${stim.jumlahKata} kata) berhasil dibuat dan disimpan ke Bank Stimulus!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat stimulus bacaan.');
    } finally {
      setIsGeneratingStimulus(false);
    }
  };

  // 2. Generate Questions
  const handleGenerateQuestions = async () => {
    if (!isPremium) {
      if (onOpenActivation) onOpenActivation();
      setErrorMessage(
        'Pembuatan butir soal baru dengan AI merupakan fitur Premium. Silakan masukkan kode aktivasi Anda untuk membuka akses tanpa batas.'
      );
      return;
    }

    let stimToUse = activeStimulus;

    if (stimulusMode === 'existing_bank') {
      stimToUse = storageService.getStimulusById(selectedStimulusId) || null;
      if (!stimToUse) {
        setErrorMessage('Silakan pilih salah satu stimulus dari bank data terlebih dahulu.');
        return;
      }
    }

    if (!stimToUse) {
      setErrorMessage('Stimulus bacaan belum ada. Silakan buat stimulus baru atau pilih dari bank.');
      return;
    }

    setIsGeneratingQuestions(true);
    setErrorMessage(null);
    setStatusMessage(`Menghasilkan ${jumlahSoal} soal berbasis indikator ${indikatorKode}...`);

    try {
      const questions = await apiService.generateQuestions({
        stimulus: stimToUse,
        kelas: kelas,
        kompetensiId: kompetensiId,
        kompetensiNama: currentKompetensi.nama,
        indikatorKode: indikatorKode,
        indikatorNama: currentIndikator.nama,
        bentukSoal: bentukSoal,
        tingkatKesulitan: tingkatKesulitan,
        jumlahSoal: jumlahSoal,
      });

      setGeneratedQuestions(questions);
      setStatusMessage(`Berhasil menghasilkan ${questions.length} butir soal berkualitas terikat indikator ${indikatorKode}!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghasilkan butir soal.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // 3. Save Questions to Bank
  const handleSaveToBank = () => {
    if (generatedQuestions.length === 0) return;
    storageService.saveBatchSoal(generatedQuestions);
    setStatusMessage(`Seluruh butir soal (${generatedQuestions.length} soal) berhasil disimpan permanen ke Bank Soal!`);
    if (onQuestionsSaved) onQuestionsSaved();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-700 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="max-w-4xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Item Generator Berorientasi Indikator
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Generator Soal & Stimulus TKA SD/MI</h1>
          <p className="text-sm text-indigo-100">
            Sistem menyusun stimulus bacaan ramah anak dan butir pertanyaan yang benar-benar mengukur target indikator asesmen (SD-T01 s.d. SD-E03), lengkap dengan bukti kutipan kalimat dan pembahasan mendalam.
          </p>
        </div>
      </div>

      {/* Demo Locked Banner if in Demo Mode */}
      {!isPremium && onOpenActivation && (
        <LockedFeatureBanner
          title="Pembuat Soal AI Terkunci (Mode Demo)"
          description="Pembuatan stimulus wacana baru dan butir pertanyaan dengan AI hanya dapat dijalankan setelah aktivasi lisensi Premium. Anda tetap dapat meninjau dan menggunakan ratusan soal berkualitas dari Bank Soal bawaan."
          onActivate={onOpenActivation}
        />
      )}

      {/* Main Grid: Form Controls (Left) & Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM CONFIGURATION (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-lg text-slate-900">Konfigurasi Parameter Asesmen</h2>
          </div>

          {/* 1. Kelas Sasaran */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Kelas Sasaran SD/MI:</span>
              <span className="text-indigo-600 font-semibold text-[11px]">
                {STANDAR_KELAS_SD[kelas].panjangKataMin}–{STANDAR_KELAS_SD[kelas].panjangKataMax} kata
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([4, 5, 6] as KelasSD[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKelas(k)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    kelas === k
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Kelas {k}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Kompetensi Asesmen */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Kompetensi Literasi:</label>
            <select
              value={kompetensiId}
              onChange={(e) => handleKompetensiChange(e.target.value as KompetensiId)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pemahaman_tekstual">1. Pemahaman Tekstual (Tersurat)</option>
              <option value="pemahaman_inferensial">2. Pemahaman Inferensial (Tersirat)</option>
              <option value="evaluasi_apresiasi">3. Evaluasi dan Apresiasi (Refleksi)</option>
            </select>
          </div>

          {/* 3. Indikator Spesifik */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Indikator Asesmen Wajib:</label>
            <select
              value={indikatorKode}
              onChange={(e) => setIndikatorKode(e.target.value as IndikatorKode)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              {currentKompetensi.indikatorList.map((code) => {
                const ind = INDIKATOR_MATRIKS[code];
                return (
                  <option key={code} value={code}>
                    {ind.kode}: {ind.nama.slice(0, 48)}...
                  </option>
                );
              })}
            </select>
            <div className="bg-indigo-50/70 p-2.5 rounded-xl text-[11px] text-indigo-900 border border-indigo-100">
              <span className="font-bold">{currentIndikator.kode}: </span>
              {currentIndikator.definisi}
            </div>
          </div>

          {/* 4. Jenis Teks & Topik */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Jenis Teks:</label>
              <select
                value={jenisTeks}
                onChange={(e) => setJenisTeks(e.target.value as JenisTeks)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="Fiksi">Teks Fiksi</option>
                <option value="Nonfiksi">Teks Nonfiksi</option>
                <option value="Informasi Praktis">Informasi Praktis</option>
                <option value="Multimodal">Multimodal</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Kesulitan:</label>
              <select
                value={tingkatKesulitan}
                onChange={(e) => setTingkatKesulitan(e.target.value as TingkatKesulitan)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="Mudah">Mudah</option>
                <option value="Sedang">Sedang</option>
                <option value="Sulit">Sulit</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Topik Bacaan (Opsional):</label>
            <input
              type="text"
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Contoh: Menjaga Kebersihan Sungai, Fabel Persahabatan"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* 5. Bentuk Soal & Jumlah */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Bentuk Soal:</label>
              <select
                value={bentukSoal}
                onChange={(e) => setBentukSoal(e.target.value as BentukSoal)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="pilihan_ganda">Pilihan Ganda (1 Benar)</option>
                <option value="pilihan_ganda_kompleks">Pilihan Ganda Kompleks</option>
                <option value="uraian_singkat">Uraian Singkat (+Rubrik)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Jumlah Butir Soal:</label>
              <select
                value={jumlahSoal}
                onChange={(e) => setJumlahSoal(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value={1}>1 Butir Soal</option>
                <option value={2}>2 Butir Soal</option>
                <option value={3}>3 Butir Soal</option>
                <option value={4}>4 Butir Soal</option>
              </select>
            </div>
          </div>

          {/* 6. Stimulus Mode Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700">Pilihan Sumber Stimulus:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStimulusMode('generate_new')}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  stimulusMode === 'generate_new'
                    ? 'bg-blue-50 text-blue-700 border-blue-400 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Buat Baru (AI)
              </button>
              <button
                type="button"
                onClick={() => setStimulusMode('existing_bank')}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  stimulusMode === 'existing_bank'
                    ? 'bg-blue-50 text-blue-700 border-blue-400 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Pilih Dari Bank ({existingStimulusList.length})
              </button>
            </div>

            {stimulusMode === 'existing_bank' ? (
              <select
                value={selectedStimulusId}
                onChange={(e) => setSelectedStimulusId(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 mt-2"
              >
                <option value="">-- Pilih Stimulus Tersimpan --</option>
                {existingStimulusList.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.jenisTeks}] {s.judul} ({s.jumlahKata} kata)
                  </option>
                ))}
              </select>
            ) : (
              <button
                type="button"
                onClick={handleGenerateStimulus}
                disabled={isGeneratingStimulus}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition disabled:opacity-50"
              >
                {isGeneratingStimulus ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Menyusun Teks Bacaan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    1. Generate Stimulus Bacaan AI
                  </>
                )}
              </button>
            )}
          </div>

          {/* Action: Generate Questions */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerateQuestions}
              disabled={isGeneratingQuestions || isGeneratingStimulus}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl text-sm shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
            >
              {isGeneratingQuestions ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Merumuskan Butir Soal Asesmen...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  2. Hasilkan Butir Soal ({indikatorKode})
                </>
              )}
            </button>
          </div>

          {/* Messages */}
          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* LIVE PREVIEW SECTION (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Stimulus Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Stimulus Bacaan Aktif
                </h3>
              </div>
              {activeStimulus && (
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
                  {activeStimulus.jenisTeks} • {activeStimulus.jumlahKata} kata
                </span>
              )}
            </div>

            {activeStimulus ? (
              <div className="space-y-3">
                <h4 className="font-extrabold text-lg text-slate-900 text-center">
                  {activeStimulus.judul}
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl text-xs sm:text-sm text-slate-700 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-line border border-slate-200/60 font-serif">
                  {activeStimulus.isi}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Sumber: {activeStimulus.sumber}</span>
                  <span className="font-semibold text-emerald-600">
                    Status: {activeStimulus.statusValidasi}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-medium">
                  Belum ada stimulus bacaan aktif. Klik "1. Generate Stimulus Bacaan AI" atau pilih dari Bank.
                </p>
              </div>
            )}
          </div>

          {/* Generated Questions List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Pratinjau Butir Soal ({generatedQuestions.length})
                </h3>
              </div>

              {generatedQuestions.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToBank}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan ke Bank Soal
                  </button>
                </div>
              )}
            </div>

            {generatedQuestions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-medium">
                  Soal belum dibuat. Tekan tombol "2. Hasilkan Butir Soal" di kolom kiri setelah stimulus siap.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                          {q.indikatorKode}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          {q.kompetensiNama}
                        </span>
                      </div>

                      {onNavigateToValidator && (
                        <button
                          onClick={() => {
                            if (activeStimulus) onNavigateToValidator(q, activeStimulus);
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Uji di Validator AI
                        </button>
                      )}
                    </div>

                    <p className="font-bold text-sm text-slate-900 leading-snug">{q.pertanyaan}</p>

                    {/* Options */}
                    {q.pilihan && (
                      <div className="space-y-2 pl-2">
                        {q.pilihan.map((p) => {
                          const isCorrect =
                            p.kode === q.kunciJawaban ||
                            (Array.isArray(q.kunciJawaban) && q.kunciJawaban.includes(p.kode));

                          return (
                            <div
                              key={p.kode}
                              className={`p-2.5 rounded-xl text-xs flex items-start gap-2.5 border transition ${
                                isCorrect
                                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold'
                                  : 'bg-white border-slate-200/80 text-slate-700'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {p.kode}
                              </span>
                              <span className="flex-1">{p.teks}</span>
                              {isCorrect && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  KUNCI JAWABAN
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Textual evidence & Discussion */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs">
                      {q.buktiTekstual && (
                        <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/60 text-amber-900">
                          <span className="font-bold text-[11px] uppercase tracking-wider block text-amber-800">
                            Bukti Tekstual dalam Stimulus:
                          </span>
                          <span className="italic">"{q.buktiTekstual}"</span>
                        </div>
                      )}

                      <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/60 text-blue-900 space-y-1">
                        <span className="font-bold text-[11px] uppercase tracking-wider block text-blue-800">
                          Pembahasan Edukatif:
                        </span>
                        <p className="leading-relaxed">{q.pembahasan}</p>
                      </div>

                      {q.rubrikUraian && (
                        <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/60 text-purple-900 space-y-1">
                          <span className="font-bold text-[11px] uppercase tracking-wider block text-purple-800">
                            Rubrik Penilaian Uraian (Maks {q.rubrikUraian.skorMaksimal}):
                          </span>
                          <div className="space-y-1">
                            {q.rubrikUraian.kriteria.map((crit) => (
                              <div key={crit.skor} className="text-[11px]">
                                <strong>Skor {crit.skor}:</strong> {crit.deskripsi}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
