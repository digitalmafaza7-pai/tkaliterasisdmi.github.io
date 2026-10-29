import React, { useState } from 'react';
import {
  TableProperties,
  Download,
  Filter,
  FileSpreadsheet,
  FileText,
  PieChart,
  CheckCircle2,
  Plus,
  Lock,
} from 'lucide-react';
import { ButirKisiKisi, KelasSD, KompetensiId, PaketLatihan } from '../../types/assessment';
import { exportService } from '../../services/exportService';
import { storageService } from '../../services/storageService';

interface KisiKisiViewProps {
  currentKelas: KelasSD;
  isPremium?: boolean;
  onOpenActivation?: () => void;
}

export const KisiKisiView: React.FC<KisiKisiViewProps> = ({
  currentKelas,
  isPremium = false,
  onOpenActivation,
}) => {
  const paketList = storageService.getPaketList();
  const [selectedPaketId, setSelectedPaketId] = useState<string>(
    paketList.length > 0 ? paketList[0].id : ''
  );

  const activePaket = paketList.find((p) => p.id === selectedPaketId) || paketList[0] || null;
  const kisiKisiList: ButirKisiKisi[] = activePaket ? activePaket.kisiKisi : [];

  // Filter state
  const [kompetensiFilter, setKompetensiFilter] = useState<string>('semua');

  const filteredKisi = kisiKisiList.filter((k) => {
    if (kompetensiFilter !== 'semua' && k.kompetensiNama !== kompetensiFilter) return false;
    return true;
  });

  // Calculate distribution
  const countTekstual = kisiKisiList.filter((k) => k.kompetensiNama.includes('Tekstual')).length;
  const countInferensial = kisiKisiList.filter((k) => k.kompetensiNama.includes('Inferensial')).length;
  const countEvaluasi = kisiKisiList.filter((k) => k.kompetensiNama.includes('Evaluasi')).length;
  const total = kisiKisiList.length || 1;

  const pctTekstual = Math.round((countTekstual / total) * 100);
  const pctInferensial = Math.round((countInferensial / total) * 100);
  const pctEvaluasi = Math.round((countEvaluasi / total) * 100);

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="max-w-4xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide">
            <TableProperties className="w-3.5 h-3.5 text-amber-200" />
            Matriks Blueprint Asesmen Literasi
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Kisi-Kisi Instrumen Asesmen TKA SD/MI
          </h1>
          <p className="text-sm text-amber-100">
            Pemetaan menyeluruh butir soal terhadap indikator asesmen, ragam wacana, distribusi kognitif, dan bobot penilaian.
          </p>
        </div>
      </div>

      {/* Package Selector & Actions */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto flex-1 space-y-1">
          <label className="text-xs font-bold text-slate-700">Pilih Paket Asesmen:</label>
          <select
            value={selectedPaketId}
            onChange={(e) => setSelectedPaketId(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50"
          >
            {paketList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.judul} (Kelas {p.kelas} - {p.soalList.length} Soal)
              </option>
            ))}
          </select>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-end">
          <button
            onClick={() => {
              if (!isPremium && onOpenActivation) {
                onOpenActivation();
                return;
              }
              if (activePaket) exportService.exportKisiKisiCSV(activePaket.kisiKisi, activePaket.judul);
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (CSV)</span>
            {!isPremium && <Lock className="w-3.5 h-3.5 text-emerald-200" />}
          </button>

          <button
            onClick={() => {
              if (!isPremium && onOpenActivation) {
                onOpenActivation();
                return;
              }
              if (activePaket) exportService.exportJSON(activePaket.kisiKisi, `Kisi-Kisi_${activePaket.judul}`);
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor JSON</span>
            {!isPremium && <Lock className="w-3.5 h-3.5 text-amber-300" />}
          </button>
        </div>
      </div>

      {/* Distribution Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-blue-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-blue-700">
            <span>Pemahaman Tekstual</span>
            <span className="text-base font-black">{pctTekstual}%</span>
          </div>
          <div className="w-full bg-blue-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${pctTekstual}%` }} />
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {countTekstual} dari {total} butir soal
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Pemahaman Inferensial</span>
            <span className="text-base font-black">{pctInferensial}%</span>
          </div>
          <div className="w-full bg-emerald-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${pctInferensial}%` }} />
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {countInferensial} dari {total} butir soal
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-purple-700">
            <span>Evaluasi dan Apresiasi</span>
            <span className="text-base font-black">{pctEvaluasi}%</span>
          </div>
          <div className="w-full bg-purple-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${pctEvaluasi}%` }} />
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {countEvaluasi} dari {total} butir soal
          </div>
        </div>
      </div>

      {/* Interactive Kisi-Kisi Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">
              Matriks Kisi-Kisi: {activePaket?.judul}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-slate-600">Filter:</span>
            <select
              value={kompetensiFilter}
              onChange={(e) => setKompetensiFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold"
            >
              <option value="semua">Semua Kompetensi</option>
              <option value="Pemahaman Tekstual">Pemahaman Tekstual</option>
              <option value="Pemahaman Inferensial">Pemahaman Inferensial</option>
              <option value="Evaluasi dan Apresiasi">Evaluasi dan Apresiasi</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-4">Kompetensi</th>
                <th className="py-3 px-3">Kode</th>
                <th className="py-3 px-4">Indikator Asesmen</th>
                <th className="py-3 px-3">Jenis Teks</th>
                <th className="py-3 px-3">Topik</th>
                <th className="py-3 px-3">Kesulitan</th>
                <th className="py-3 px-3">Bentuk</th>
                <th className="py-3 px-2 text-center">Bobot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredKisi.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tidak ada butir kisi-kisi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredKisi.map((k, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition">
                    <td className="py-3 px-3 text-center font-bold text-slate-900">{k.nomor}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        Kelas {k.kelas}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          k.kompetensiNama.includes('Tekstual')
                            ? 'text-blue-700'
                            : k.kompetensiNama.includes('Inferensial')
                            ? 'text-emerald-700'
                            : 'text-purple-700'
                        }`}
                      >
                        {k.kompetensiNama}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-black text-[10px]">
                        {k.indikatorKode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-normal text-slate-800 max-w-xs">{k.indikatorNama}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {k.jenisTeks}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{k.topik}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          k.tingkatKesulitan === 'Mudah'
                            ? 'bg-emerald-100 text-emerald-800'
                            : k.tingkatKesulitan === 'Sedang'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {k.tingkatKesulitan}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 capitalize">
                      {k.bentukSoal.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-900">{k.bobot}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
