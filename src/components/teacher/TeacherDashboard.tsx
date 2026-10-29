import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Database,
  TableProperties,
  TrendingDown,
  TrendingUp,
  Download,
  Trash2,
  FileText,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Lock,
} from 'lucide-react';
import { HasilPengerjaan, KelasSD, PaketLatihan } from '../../types/assessment';
import { storageService } from '../../services/storageService';
import { exportService } from '../../services/exportService';

interface TeacherDashboardProps {
  currentKelas: KelasSD;
  isPremium?: boolean;
  onOpenActivation?: () => void;
  onNavigateToPaket?: (paket: PaketLatihan) => void;
  onNavigateToGenerator?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentKelas,
  isPremium = false,
  onOpenActivation,
  onNavigateToPaket,
  onNavigateToGenerator,
}) => {
  const [hasilList, setHasilList] = useState<HasilPengerjaan[]>(storageService.getHasilList());
  const stimulusList = storageService.getStimulusList();
  const soalList = storageService.getSoalList();
  const paketList = storageService.getPaketList();

  const [selectedPaketForExport, setSelectedPaketForExport] = useState<string>(
    paketList.length > 0 ? paketList[0].id : ''
  );

  const activePaketExport = paketList.find((p) => p.id === selectedPaketForExport) || paketList[0];

  // Calculate stats
  const totalSubmissions = hasilList.length;
  const avgScore =
    totalSubmissions > 0
      ? Math.round(hasilList.reduce((acc, h) => acc + h.nilaiAkhir, 0) / totalSubmissions)
      : 0;

  // Weakest indicators analysis based on actual student submissions
  const indicatorStats: Record<string, { total: number; correct: number; name: string }> = {};

  hasilList.forEach((h) => {
    h.analisisIndikator.forEach((ind) => {
      if (!indicatorStats[ind.kode]) {
        indicatorStats[ind.kode] = { total: 0, correct: 0, name: ind.nama };
      }
      indicatorStats[ind.kode].total += ind.totalSoal;
      indicatorStats[ind.kode].correct += ind.benar;
    });
  });

  const rankedIndicators = Object.entries(indicatorStats)
    .map(([kode, data]) => ({
      kode,
      nama: data.name,
      pct: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      total: data.total,
    }))
    .sort((a, b) => a.pct - b.pct);

  const weakest = rankedIndicators.slice(0, 3);

  const handleDeleteHasil = (id: string) => {
    if (confirm('Hapus riwayat hasil pengerjaan siswa ini?')) {
      storageService.deleteHasil(id);
      setHasilList(storageService.getHasilList());
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="max-w-4xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide">
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-300" />
            Panel Pengelolaan Asesmen Guru SD/MI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Dashboard Guru & Analisis Capaian Kelas
          </h1>
          <p className="text-sm text-blue-100">
            Monitoring performa literasi siswa berdasarkan data riil, evaluasi indikator yang masih sulit, dan pencetakan dokumen resmi instrumen asesmen.
          </p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-500 text-xs font-bold flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Bank Stimulus</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stimulusList.length} Teks</div>
          <div className="text-[11px] text-slate-400">Fiksi, Nonfiksi & Praktis</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-500 text-xs font-bold flex items-center gap-1.5">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Bank Soal Aktif</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{soalList.length} Butir</div>
          <div className="text-[11px] text-slate-400">10 Indikator SD/MI</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-500 text-xs font-bold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Siswa Selesai Ujian</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalSubmissions} Sesi</div>
          <div className="text-[11px] text-slate-400">Data pengerjaan aktual</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-slate-500 text-xs font-bold flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>Nilai Rata-Rata</span>
          </div>
          <div className="text-2xl font-black text-purple-700">{avgScore} / 100</div>
          <div className="text-[11px] text-slate-400">Skala asesmen kelas</div>
        </div>
      </div>

      {/* DIAGNOSTIC: Indikator Tersulit di Kelas */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <TrendingDown className="w-5 h-5 text-rose-600" />
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Diagnostik Indikator yang Masih Sulit Dikuasai Siswa
            </h3>
            <p className="text-xs text-slate-500">
              Dihitung secara objektif dari jawaban salah pada sesi pengerjaan aktual.
            </p>
          </div>
        </div>

        {weakest.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            Belum ada data pengerjaan siswa yang tersimpan. Lakukan latihan atau simulasi terlebih dahulu untuk melihat grafik kelemahan siswa.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weakest.map((item, idx) => (
              <div
                key={item.kode}
                className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black px-2 py-0.5 rounded-md bg-rose-200 text-rose-800 text-[10px]">
                    {item.kode}
                  </span>
                  <span className="font-extrabold text-rose-700">
                    Capaian: {item.pct}%
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 leading-snug line-clamp-2">
                  {item.nama}
                </h4>
                <p className="text-[11px] text-slate-600">
                  Total diuji: {item.total} kali respons.
                </p>
                <div className="pt-2 text-[11px] text-rose-800 font-semibold border-t border-rose-100">
                  Rekomendasi Guru: Berikan penguatan bimbingan kontekstual dan stimulus wacana tambahan.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DOCUMENT EXPORT SUITE */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 sm:p-8 rounded-3xl border border-indigo-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-indigo-950 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-700" />
              Pusat Cetak & Ekspor Dokumen Asesmen
            </h3>
            <p className="text-xs text-indigo-700">
              Format siap cetak dan olah untuk guru (Word .doc, Excel CSV, dan JSON).
            </p>
          </div>

          {/* Select Package */}
          <select
            value={selectedPaketForExport}
            onChange={(e) => setSelectedPaketForExport(e.target.value)}
            className="text-xs font-semibold p-2.5 rounded-xl border border-indigo-200 bg-white"
          >
            {paketList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.judul} (Kelas {p.kelas})
              </option>
            ))}
          </select>
        </div>

        {activePaketExport && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => {
                if (!isPremium && onOpenActivation) {
                  onOpenActivation();
                  return;
                }
                exportService.exportNaskahSiswaWord(activePaketExport);
              }}
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white hover:bg-indigo-50/80 border border-indigo-200 text-indigo-900 font-bold text-xs shadow-xs transition"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Naskah Siswa (Tanpa Kunci)</span>
              {!isPremium && <Lock className="w-3.5 h-3.5 text-amber-500" />}
            </button>

            <button
              onClick={() => {
                if (!isPremium && onOpenActivation) {
                  onOpenActivation();
                  return;
                }
                exportService.exportKunciPembahasanWord(activePaketExport);
              }}
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white hover:bg-emerald-50/80 border border-emerald-200 text-emerald-900 font-bold text-xs shadow-xs transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pedoman Kunci & Pembahasan</span>
              {!isPremium && <Lock className="w-3.5 h-3.5 text-amber-500" />}
            </button>

            <button
              onClick={() => {
                if (!isPremium && onOpenActivation) {
                  onOpenActivation();
                  return;
                }
                exportService.exportKisiKisiCSV(
                  activePaketExport.kisiKisi,
                  activePaketExport.judul
                );
              }}
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white hover:bg-amber-50/80 border border-amber-200 text-amber-900 font-bold text-xs shadow-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              <span>Kisi-Kisi Asesmen (Excel)</span>
              {!isPremium && <Lock className="w-3.5 h-3.5 text-amber-500" />}
            </button>
          </div>
        )}
      </div>

      {/* STUDENT SUBMISSION LOG TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Rekapitulasi Hasil Latihan Siswa Aktual ({hasilList.length})
            </h3>
            <p className="text-xs text-slate-500">
              Riwayat pengerjaan siswa yang tersimpan di perangkat.
            </p>
          </div>

          {hasilList.length > 0 && (
            <button
              onClick={() => {
                if (!isPremium && onOpenActivation) {
                  onOpenActivation();
                  return;
                }
                exportService.exportHasilCSV(hasilList);
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Rekap Nilai (CSV)</span>
              {!isPremium && <Lock className="w-3 h-3 text-emerald-200" />}
            </button>
          )}
        </div>

        {hasilList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">
              Belum ada data pengerjaan siswa yang tersimpan.
            </p>
            <p className="text-[11px] text-slate-500">
              Silakan jalankan latihan mandiri atau simulasi TKA untuk mulai mencatat progres belajar siswa.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-2">Kelas</th>
                  <th className="py-2.5 px-3">Paket Asesmen</th>
                  <th className="py-2.5 px-2 text-center">Nilai</th>
                  <th className="py-2.5 px-2 text-center">Benar/Salah</th>
                  <th className="py-2.5 px-2">Durasi</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {hasilList.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">{h.namaPeserta}</td>
                    <td className="py-3 px-2">Kelas {h.kelas}</td>
                    <td className="py-3 px-3 text-slate-800">{h.paketJudul}</td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`font-black px-2 py-0.5 rounded-md text-[11px] ${
                          h.nilaiAkhir >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {h.nilaiAkhir}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-slate-600">
                      {h.jawabanBenar} / {h.jawabanSalah}
                    </td>
                    <td className="py-3 px-2 text-slate-500">
                      {Math.round(h.durasiPengerjaanDetik / 60)} mnt
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(h.waktuSelesai).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleDeleteHasil(h.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                        title="Hapus riwayat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
