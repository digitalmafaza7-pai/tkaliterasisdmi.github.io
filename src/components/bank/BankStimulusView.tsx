import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Eye,
  Layers,
  Sparkles,
} from 'lucide-react';
import { JenisTeks, KelasSD, StimulusBacaan } from '../../types/assessment';
import { storageService } from '../../services/storageService';

interface BankStimulusViewProps {
  currentKelas: KelasSD;
  onSelectForGenerator?: (stimulus: StimulusBacaan) => void;
  onOpenCreateStimulus?: () => void;
}

export const BankStimulusView: React.FC<BankStimulusViewProps> = ({
  currentKelas,
  onSelectForGenerator,
  onOpenCreateStimulus,
}) => {
  const [stimulusList, setStimulusList] = useState<StimulusBacaan[]>(storageService.getStimulusList());
  const [selectedJenis, setSelectedJenis] = useState<string>('semua');
  const [selectedKelas, setSelectedKelas] = useState<number>(0); // 0 = all
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalStimulus, setActiveModalStimulus] = useState<StimulusBacaan | null>(null);

  const filtered = stimulusList.filter((s) => {
    if (selectedJenis !== 'semua' && s.jenisTeks !== selectedJenis) return false;
    if (selectedKelas !== 0 && s.kelas !== selectedKelas) return false;
    if (
      searchQuery.trim() &&
      !s.judul.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.topik.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus stimulus bacaan ini?')) {
      storageService.deleteStimulus(id);
      setStimulusList(storageService.getStimulusList());
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-cyan-700 to-indigo-700 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="max-w-4xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide">
            <BookOpen className="w-3.5 h-3.5 text-cyan-200" />
            Repositori Teks Asesmen
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Bank Stimulus Bacaan SD/MI</h1>
          <p className="text-sm text-cyan-100">
            Kumpulan wacana fiksi, nonfiksi, teks informasi praktis, dan multimodal berjenjang yang aman dan memikat untuk asesmen literasi siswa SD/MI.
          </p>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Action */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul atau topik bacaan..."
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(Number(e.target.value))}
            className="text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
          >
            <option value={0}>Semua Kelas</option>
            <option value={4}>Kelas 4</option>
            <option value={5}>Kelas 5</option>
            <option value={6}>Kelas 6</option>
          </select>

          <select
            value={selectedJenis}
            onChange={(e) => setSelectedJenis(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
          >
            <option value="semua">Semua Jenis Teks</option>
            <option value="Fiksi">Fiksi</option>
            <option value="Nonfiksi">Nonfiksi</option>
            <option value="Informasi Praktis">Informasi Praktis</option>
            <option value="Multimodal">Multimodal</option>
          </select>

          {onOpenCreateStimulus && (
            <button
              onClick={onOpenCreateStimulus}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition ml-auto md:ml-0"
            >
              <Plus className="w-4 h-4" />
              Buat Stimulus Baru
            </button>
          )}
        </div>
      </div>

      {/* Stimulus Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold">Tidak ada stimulus yang cocok dengan filter pencarian.</p>
          </div>
        ) : (
          filtered.map((stim) => {
            const allSoal = storageService.getSoalByStimulusId(stim.id);

            return (
              <div
                key={stim.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs px-2.5 py-1 rounded-md bg-blue-100 text-blue-800">
                      Kelas {stim.kelas} SD/MI
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {stim.jenisTeks} • {stim.jumlahKata} kata
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 leading-snug line-clamp-1">
                    {stim.judul}
                  </h3>

                  <div className="text-xs text-indigo-700 font-semibold">
                    Topik: {stim.topik}
                  </div>

                  <p className="text-xs text-slate-600 font-serif leading-relaxed line-clamp-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {stim.isi}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">
                    {allSoal.length} Soal Terkait
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveModalStimulus(stim)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold px-3 py-1.5 rounded-lg bg-blue-50 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Baca Lengkap
                    </button>

                    <button
                      onClick={() => handleDelete(stim.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Hapus stimulus"
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

      {/* Read Full Modal */}
      {activeModalStimulus && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600">
                  Kelas {activeModalStimulus.kelas} • {activeModalStimulus.jenisTeks}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {activeModalStimulus.judul}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalStimulus(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1"
              >
                Tutup ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 font-serif text-sm leading-relaxed text-slate-800 whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {activeModalStimulus.isi}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Sumber: {activeModalStimulus.sumber}</span>
              <span className="font-semibold text-emerald-600">
                {activeModalStimulus.jumlahKata} kata
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
