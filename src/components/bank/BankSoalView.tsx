import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Trash2,
  Copy,
  Download,
  Plus,
  ShieldCheck,
  Eye,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  ButirSoal,
  IndikatorKode,
  KelasSD,
  KompetensiId,
  StatusValidasi,
  TingkatKesulitan,
} from '../../types/assessment';
import { storageService } from '../../services/storageService';
import { exportService } from '../../services/exportService';

interface BankSoalViewProps {
  currentKelas: KelasSD;
  onNavigateToValidator?: (soal: ButirSoal) => void;
  onNavigateToGenerator?: () => void;
}

export const BankSoalView: React.FC<BankSoalViewProps> = ({
  currentKelas,
  onNavigateToValidator,
  onNavigateToGenerator,
}) => {
  const [soalList, setSoalList] = useState<ButirSoal[]>(storageService.getSoalList());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState<number>(0);
  const [selectedKompetensi, setSelectedKompetensi] = useState<string>('semua');
  const [selectedIndikator, setSelectedIndikator] = useState<string>('semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [detailModalSoal, setDetailModalSoal] = useState<ButirSoal | null>(null);

  const filtered = soalList.filter((q) => {
    if (selectedKelas !== 0 && q.kelas !== selectedKelas) return false;
    if (selectedKompetensi !== 'semua' && q.kompetensiId !== selectedKompetensi) return false;
    if (selectedIndikator !== 'semua' && q.indikatorKode !== selectedIndikator) return false;
    if (selectedStatus !== 'semua' && q.statusValidasi !== selectedStatus) return false;
    if (
      searchQuery.trim() &&
      !q.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !q.topik.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleDelete = (id: string) => {
    if (confirm('Hapus butir soal ini dari bank data?')) {
      storageService.deleteSoal(id);
      setSoalList(storageService.getSoalList());
    }
  };

  const handleDuplicate = (soal: ButirSoal) => {
    const duplicated: ButirSoal = {
      ...soal,
      id: `SOAL-DUP-${Date.now().toString().slice(-4)}`,
      versi: soal.versi + 1,
      statusValidasi: 'Draf',
      tanggalDibuat: new Date().toISOString().split('T')[0],
    };
    storageService.saveSoal(duplicated);
    setSoalList(storageService.getSoalList());
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="max-w-4xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide">
            <Database className="w-3.5 h-3.5 text-blue-300" />
            Bank Butir Soal Terstandardisasi
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Bank Soal Asesmen SD/MI</h1>
          <p className="text-sm text-slate-300">
            Koleksi butir soal terikat indikator asesmen (SD-T01 s.d. SD-E03) lengkap dengan kunci, bukti tekstual kutipan kalimat, dan analisis distraktor.
          </p>
        </div>
      </div>

      {/* Toolbar: Search, Multi Filters, Export */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pertanyaan atau kata kunci..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {onNavigateToGenerator && (
              <button
                onClick={onNavigateToGenerator}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                Buat Soal AI
              </button>
            )}

            <button
              onClick={() => exportService.exportJSON(soalList, `Bank_Soal_SD_${Date.now()}`)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2.5 rounded-xl text-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              Ekspor JSON
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(Number(e.target.value))}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
          >
            <option value={0}>Semua Kelas</option>
            <option value={4}>Kelas 4 SD</option>
            <option value={5}>Kelas 5 SD</option>
            <option value={6}>Kelas 6 SD</option>
          </select>

          <select
            value={selectedKompetensi}
            onChange={(e) => setSelectedKompetensi(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
          >
            <option value="semua">Semua Kompetensi</option>
            <option value="pemahaman_tekstual">Pemahaman Tekstual</option>
            <option value="pemahaman_inferensial">Pemahaman Inferensial</option>
            <option value="evaluasi_apresiasi">Evaluasi & Apresiasi</option>
          </select>

          <select
            value={selectedIndikator}
            onChange={(e) => setSelectedIndikator(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
          >
            <option value="semua">Semua Indikator</option>
            <option value="SD-T01">SD-T01 (Kosakata Umum/Khusus)</option>
            <option value="SD-T02">SD-T02 (Identifikasi Objek)</option>
            <option value="SD-T03">SD-T03 (Ikhtisar / Bagan)</option>
            <option value="SD-T04">SD-T04 (Fakta Tersurat)</option>
            <option value="SD-I01">SD-I01 (Ide Pokok & Amanat)</option>
            <option value="SD-I02">SD-I02 (Perubahan Objek/Latar)</option>
            <option value="SD-I03">SD-I03 (Makna Ungkapan)</option>
            <option value="SD-E01">SD-E01 (Relevansi Nyata)</option>
            <option value="SD-E02">SD-E02 (Kesesuaian Teks/Judul)</option>
            <option value="SD-E03">SD-E03 (Respons Emosional)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
          >
            <option value="semua">Semua Status Validasi</option>
            <option value="Disetujui Guru">Disetujui Guru</option>
            <option value="Lolos Validasi Otomatis">Lolos Otomatis</option>
            <option value="Perlu Ditinjau">Perlu Ditinjau</option>
            <option value="Perlu Revisi">Perlu Revisi</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            <Database className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold">Tidak ada butir soal yang sesuai dengan filter.</p>
          </div>
        ) : (
          filtered.map((q, idx) => {
            const stim = storageService.getStimulusById(q.stimulusId);

            return (
              <div
                key={q.id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-300 transition space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                      {q.indikatorKode}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      Kelas {q.kelas} SD
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-medium text-slate-600">
                      {q.kompetensiNama}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {q.tingkatKesulitan}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      q.statusValidasi === 'Disetujui Guru'
                        ? 'bg-emerald-100 text-emerald-800'
                        : q.statusValidasi === 'Lolos Validasi Otomatis'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {q.statusValidasi}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                    {q.pertanyaan}
                  </h4>
                  {stim && (
                    <div className="text-xs text-indigo-700 font-medium">
                      Stimulus: "{stim.judul}" ({stim.jenisTeks})
                    </div>
                  )}
                </div>

                {/* Options snippet */}
                {q.pilihan && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.pilihan.map((p) => {
                      const isKey = p.kode === q.kunciJawaban;
                      return (
                        <div
                          key={p.kode}
                          className={`p-2 rounded-xl border flex items-center gap-2 ${
                            isKey
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                              : 'bg-slate-50 border-slate-200/60 text-slate-700'
                          }`}
                        >
                          <span className="w-4 h-4 rounded bg-slate-200 text-[10px] font-bold flex items-center justify-center">
                            {p.kode}
                          </span>
                          <span className="truncate">{p.teks}</span>
                          {isKey && (
                            <span className="ml-auto text-[9px] bg-emerald-200 text-emerald-800 px-1 rounded">
                              KUNCI
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setDetailModalSoal(q)}
                    className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat Pembahasan & Bukti
                  </button>

                  <div className="flex items-center gap-2">
                    {onNavigateToValidator && (
                      <button
                        onClick={() => onNavigateToValidator(q)}
                        className="flex items-center gap-1 text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg font-bold transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Validasi AI
                      </button>
                    )}

                    <button
                      onClick={() => handleDuplicate(q)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                      title="Duplikasi soal"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Hapus soal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {detailModalSoal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600">
                  {detailModalSoal.indikatorKode} • Kelas {detailModalSoal.kelas} SD
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Detail Soal & Pembahasan Lengkap
                </h3>
              </div>
              <button
                onClick={() => setDetailModalSoal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1"
              >
                Tutup ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px]">Pertanyaan:</span>
                <p className="font-bold text-sm text-slate-900 mt-1">
                  {detailModalSoal.pertanyaan}
                </p>
              </div>

              {detailModalSoal.buktiTekstual && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block text-amber-800 text-[10px] uppercase">
                    Bukti Tekstual:
                  </span>
                  <span className="italic">"{detailModalSoal.buktiTekstual}"</span>
                </div>
              )}

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-900 space-y-1">
                <span className="font-bold block text-blue-800 text-[10px] uppercase">
                  Pembahasan:
                </span>
                <p className="leading-relaxed">{detailModalSoal.pembahasan}</p>
              </div>

              {detailModalSoal.alasanDistraktor &&
                Object.keys(detailModalSoal.alasanDistraktor).length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 space-y-1">
                    <span className="font-bold block text-slate-800 text-[10px] uppercase">
                      Analisis Pilihan Pengecoh (Distraktor):
                    </span>
                    {Object.entries(detailModalSoal.alasanDistraktor).map(([k, text]) => (
                      <div key={k} className="text-[11px]">
                        <strong>Pilihan {k}:</strong> {text}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
