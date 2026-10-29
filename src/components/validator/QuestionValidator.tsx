import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Award,
  Sparkles,
  FileCheck,
  Check,
  Edit3,
} from 'lucide-react';
import { ButirSoal, HasilValidasiAI, StatusValidasi, StimulusBacaan } from '../../types/assessment';
import { apiService } from '../../services/apiService';
import { storageService } from '../../services/storageService';

interface QuestionValidatorProps {
  initialSoal?: ButirSoal | null;
  initialStimulus?: StimulusBacaan | null;
  onValidationUpdated?: () => void;
}

export const QuestionValidator: React.FC<QuestionValidatorProps> = ({
  initialSoal,
  initialStimulus,
  onValidationUpdated,
}) => {
  const allSoalList = storageService.getSoalList();
  const allStimulusList = storageService.getStimulusList();

  const [selectedSoalId, setSelectedSoalId] = useState<string>(
    initialSoal?.id || (allSoalList.length > 0 ? allSoalList[0].id : '')
  );

  const currentSoal = allSoalList.find((q) => q.id === selectedSoalId) || initialSoal || null;
  const currentStimulus =
    allStimulusList.find((s) => s.id === currentSoal?.stimulusId) || initialStimulus || null;

  const [validationResult, setValidationResult] = useState<HasilValidasiAI | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [teacherStatus, setTeacherStatus] = useState<StatusValidasi>(
    currentSoal?.statusValidasi || 'Perlu Ditinjau'
  );
  const [teacherNote, setTeacherNote] = useState<string>(currentSoal?.catatanValidasi || '');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleRunValidation = async () => {
    if (!currentSoal || !currentStimulus) return;
    setIsValidating(true);
    setSavedNotice(null);

    try {
      const res = await apiService.validateQuestion({
        soal: currentSoal,
        stimulus: currentStimulus,
      });
      setValidationResult(res);
      setTeacherStatus(res.statusRekomendasi);
    } catch (err: any) {
      alert(err.message || 'Gagal memvalidasi butir soal.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveApproval = (status: StatusValidasi) => {
    if (!currentSoal) return;
    const updatedSoal: ButirSoal = {
      ...currentSoal,
      statusValidasi: status,
      catatanValidasi: teacherNote,
    };
    storageService.saveSoal(updatedSoal);
    setTeacherStatus(status);
    setSavedNotice(`Status soal ${currentSoal.id} berhasil diperbarui menjadi "${status}"!`);
    if (onValidationUpdated) onValidationUpdated();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="max-w-4xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            AI Quality Assurance Asesmen Literasi
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Validator Soal 10 Parameter Mutu Asesmen
          </h1>
          <p className="text-sm text-purple-100">
            Audit komprehensif menguji kesesuaian butir soal terhadap indikator baku, kekuatan bukti teks, homogenitas distraktor, kelogisan kunci, dan kejelasan bahasa anak SD/MI.
          </p>
        </div>
      </div>

      {/* Select Question to Validate */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-slate-700">Pilih Soal dari Bank:</label>
          <select
            value={selectedSoalId}
            onChange={(e) => {
              setSelectedSoalId(e.target.value);
              setValidationResult(null);
            }}
            className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50"
          >
            {allSoalList.map((q) => (
              <option key={q.id} value={q.id}>
                [{q.indikatorKode}] Kelas {q.kelas} - {q.pertanyaan.slice(0, 60)}...
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRunValidation}
          disabled={isValidating || !currentSoal || !currentStimulus}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-2xl text-xs shadow-md shadow-purple-500/20 transition disabled:opacity-50 self-start sm:self-end"
        >
          {isValidating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Memeriksa 10 Parameter...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Mulai Uji Validasi 10 Parameter AI
            </>
          )}
        </button>
      </div>

      {currentSoal && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Question Details Column (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-extrabold text-xs px-2.5 py-1 rounded-md bg-purple-100 text-purple-800">
                {currentSoal.indikatorKode}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  teacherStatus === 'Disetujui Guru'
                    ? 'bg-emerald-100 text-emerald-800'
                    : teacherStatus === 'Lolos Validasi Otomatis'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {teacherStatus}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Indikator:
              </div>
              <p className="text-xs font-bold text-slate-800">{currentSoal.indikatorNama}</p>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pertanyaan:
              </div>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                {currentSoal.pertanyaan}
              </p>
            </div>

            {currentSoal.pilihan && (
              <div className="space-y-1.5 pt-1">
                {currentSoal.pilihan.map((p) => {
                  const isCorrect = p.kode === currentSoal.kunciJawaban;
                  return (
                    <div
                      key={p.kode}
                      className={`p-2 rounded-xl text-xs flex items-center gap-2 border ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900'
                          : 'bg-slate-50 border-slate-200/70 text-slate-700'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-[10px]">
                        {p.kode}
                      </span>
                      <span>{p.teks}</span>
                      {isCorrect && (
                        <span className="ml-auto text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          KUNCI
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {currentSoal.buktiTekstual && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block text-amber-800 text-[10px] uppercase">
                  Bukti Tekstual:
                </span>
                <span className="italic">"{currentSoal.buktiTekstual}"</span>
              </div>
            )}

            {/* Teacher Manual Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-slate-500" />
                Verifikasi & Catatan Penelaah (Guru):
              </h4>
              <textarea
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                placeholder="Tuliskan catatan verifikasi atau saran perbaikan guru..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white h-20"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveApproval('Disetujui Guru')}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs shadow-xs transition"
                >
                  <Check className="w-4 h-4" />
                  Disetujui Guru
                </button>
                <button
                  onClick={() => handleSaveApproval('Perlu Revisi')}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl text-xs shadow-xs transition"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Perlu Revisi
                </button>
              </div>

              {savedNotice && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium">
                  {savedNotice}
                </div>
              )}
            </div>
          </div>

          {/* 10 Checks Breakdown Column (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Laporan Evaluasi 10 Parameter Mutu
                </h3>
              </div>

              {validationResult && (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">
                      Indeks Mutu
                    </div>
                    <div className="text-lg font-black text-purple-700">
                      {validationResult.skorKualitas} / 100
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>

            {!validationResult ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <ShieldCheck className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-xs font-medium">
                  Tekan tombol "Mulai Uji Validasi 10 Parameter AI" di atas untuk menganalisis butir soal ini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 10 Checks Grid */}
                <div className="space-y-2.5">
                  {[
                    {
                      key: 'kesesuaianIndikator',
                      label: '1. Kesesuaian Indikator',
                      desc: 'Mengukur secara presisi indikator yang ditentukan.',
                      item: validationResult.pemeriksaan.kesesuaianIndikator,
                    },
                    {
                      key: 'kesesuaianStimulus',
                      label: '2. Kesesuaian Stimulus',
                      desc: 'Didukung oleh informasi eksplisit / implisit teks.',
                      item: validationResult.pemeriksaan.kesesuaianStimulus,
                    },
                    {
                      key: 'kunciJawabanValid',
                      label: '3. Kunci Jawaban Valid',
                      desc: 'Kunci jawaban tidak terbantahkan dan dapat dibuktikan.',
                      item: validationResult.pemeriksaan.kunciJawabanValid,
                    },
                    {
                      key: 'kualitasDistraktor',
                      label: '4. Kualitas Distraktor',
                      desc: 'Pengecoh masuk akal dan bukan jawaban yang sama benarnya.',
                      item: validationResult.pemeriksaan.kualitasDistraktor,
                    },
                    {
                      key: 'kejelasanBahasa',
                      label: '5. Kejelasan Bahasa',
                      desc: 'Bahasa baku, ramah anak, dan bebas dari ambiguitas.',
                      item: validationResult.pemeriksaan.kejelasanBahasa,
                    },
                    {
                      key: 'kesesuaianTingkatKesulitan',
                      label: '6. Kesesuaian Tingkat Kesulitan',
                      desc: 'Proporsional dengan tahap kognitif kelas sasaran.',
                      item: validationResult.pemeriksaan.kesesuaianTingkatKesulitan,
                    },
                    {
                      key: 'kualitasPembahasan',
                      label: '7. Kualitas Pembahasan',
                      desc: 'Menjelaskan alur penalaran secara mendidik.',
                      item: validationResult.pemeriksaan.kualitasPembahasan,
                    },
                    {
                      key: 'antiDuplikasi',
                      label: '8. Anti Duplikasi',
                      desc: 'Tidak mengulang substansi pertanyaan yang sama.',
                      item: validationResult.pemeriksaan.antiDuplikasi,
                    },
                    {
                      key: 'kesesuaianJumlah',
                      label: '9. Kesesuaian Struktur Butir',
                      desc: 'Kelengkapan komponen opsi dan pertanyaan utuh.',
                      item: validationResult.pemeriksaan.kesesuaianJumlah,
                    },
                    {
                      key: 'konsistensiPaket',
                      label: '10. Konsistensi Paket',
                      desc: 'Kunci, pembahasan, dan stimulus merujuk versi yang tepat.',
                      item: validationResult.pemeriksaan.konsistensiPaket,
                    },
                  ].map((chk) => (
                    <div
                      key={chk.key}
                      className={`p-3 rounded-2xl border text-xs flex items-start gap-3 transition ${
                        chk.item.lolos
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-amber-50/60 border-amber-200'
                      }`}
                    >
                      {chk.item.lolos ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{chk.label}</span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              chk.item.lolos
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {chk.item.lolos ? 'LOLOS' : 'PERHATIAN'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{chk.item.catatan}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggestions if any */}
                {validationResult.saranPerbaikan && validationResult.saranPerbaikan.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-2">
                    <span className="font-bold text-purple-900 block">Saran Rekomendasi AI:</span>
                    <ul className="list-disc list-inside text-purple-800 space-y-1">
                      {validationResult.saranPerbaikan.map((saran, i) => (
                        <li key={i}>{saran}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
