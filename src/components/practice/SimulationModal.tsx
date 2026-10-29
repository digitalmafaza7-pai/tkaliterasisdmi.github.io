import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  X,
  Sliders,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { KelasSD, PaketLatihan } from '../../types/assessment';
import { storageService } from '../../services/storageService';

import { Lock, KeyRound } from 'lucide-react';

interface SimulationModalProps {
  currentKelas: KelasSD;
  isOpen: boolean;
  isPremium?: boolean;
  onOpenActivation?: () => void;
  onClose: () => void;
  onStart: (paket: PaketLatihan, config: { acakSoal: boolean; durasiMenit: number }) => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  currentKelas,
  isOpen,
  isPremium = false,
  onOpenActivation,
  onClose,
  onStart,
}) => {
  if (!isOpen) return null;

  const paketList = storageService
    .getPaketList()
    .filter((p) => p.tipe === 'simulasi_tka' || p.kelas === currentKelas);

  const [selectedPaketId, setSelectedPaketId] = useState<string>(
    paketList.length > 0 ? paketList[0].id : ''
  );
  const [durasiMenit, setDurasiMenit] = useState<number>(30);
  const [acakSoal, setAcakSoal] = useState<boolean>(false);

  const chosenPaket = paketList.find((p) => p.id === selectedPaketId) || paketList[0];

  const handleStart = () => {
    if (!chosenPaket) return;
    if (!isPremium && chosenPaket.tipe === 'simulasi_tka') {
      if (onOpenActivation) onOpenActivation();
      return;
    }
    onStart(chosenPaket, { acakSoal, durasiMenit });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 leading-tight">
              Konfigurasi Simulasi TKA SD/MI
            </h3>
            <p className="text-xs text-slate-500">
              Latihan Mandiri Literasi Membaca Berbatas Waktu
            </p>
          </div>
        </div>

        {/* Form Controls */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Pilih Paket Ujian:</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Durasi Pengerjaan:</label>
              <select
                value={durasiMenit}
                onChange={(e) => setDurasiMenit(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value={15}>15 Menit (Cepat)</option>
                <option value={30}>30 Menit (Standar)</option>
                <option value={45}>45 Menit (Lengkap)</option>
                <option value={60}>60 Menit (Maksimal)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pengacakan Butir Soal:</label>
              <select
                value={acakSoal ? 'true' : 'false'}
                onChange={(e) => setAcakSoal(e.target.value === 'true')}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="false">Urut Berdasarkan Stimulus</option>
                <option value="true">Acak Butir Pertanyaan</option>
              </select>
            </div>
          </div>

          {/* Guidelines box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Petunjuk Pelaksanaan Simulasi:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Kunci jawaban disembunyikan sampai kamu menekan tombol "Selesai Ujian".</li>
              <li>Timer akan menghitung mundur otomatis dan mengirim jawaban jika waktu habis.</li>
              <li>Gunakan tombol "Ragu-ragu" pada soal yang belum kamu yakini jawabannya.</li>
            </ul>
          </div>

          {/* Official Disclaimer */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Simulasi ini merupakan sarana belajar mandiri dan latihan diagnostik internal siswa SD/MI, bukan penyelenggaraan TKA resmi dari Kementerian.
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            onClick={handleStart}
            disabled={!chosenPaket}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Mulai Simulasi Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
