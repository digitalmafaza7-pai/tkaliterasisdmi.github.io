import { SEED_PAKET, SEED_SOAL, SEED_STIMULUS } from '../data/seedData';
import { ButirSoal, HasilPengerjaan, KelasSD, PaketLatihan, StimulusBacaan } from '../types/assessment';

const STIMULUS_KEY = 'tka_literasi_stimulus_v1';
const SOAL_KEY = 'tka_literasi_soal_v1';
const PAKET_KEY = 'tka_literasi_paket_v1';
const HASIL_KEY = 'tka_literasi_hasil_v1';
const SETTINGS_KEY = 'tka_literasi_settings_v1';

export interface AppSettings {
  peran: 'siswa' | 'guru';
  kelasAktif: KelasSD;
  namaPengguna: string;
}

export const storageService = {
  // --- SETTINGS & USER STATE ---
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return {
      peran: 'siswa',
      kelasAktif: 5,
      namaPengguna: 'Siswa Cerdas SD',
    };
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  // --- STIMULUS BACAAN ---
  getStimulusList(): StimulusBacaan[] {
    try {
      const data = localStorage.getItem(STIMULUS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    // Initialize with seeds
    localStorage.setItem(STIMULUS_KEY, JSON.stringify(SEED_STIMULUS));
    return SEED_STIMULUS;
  },

  saveStimulus(stimulus: StimulusBacaan): void {
    const list = this.getStimulusList();
    const index = list.findIndex((s) => s.id === stimulus.id);
    if (index >= 0) {
      list[index] = stimulus;
    } else {
      list.unshift(stimulus);
    }
    localStorage.setItem(STIMULUS_KEY, JSON.stringify(list));
  },

  deleteStimulus(id: string): void {
    const list = this.getStimulusList().filter((s) => s.id !== id);
    localStorage.setItem(STIMULUS_KEY, JSON.stringify(list));
  },

  getStimulusById(id: string): StimulusBacaan | undefined {
    return this.getStimulusList().find((s) => s.id === id);
  },

  // --- BANK SOAL ---
  getSoalList(): ButirSoal[] {
    try {
      const data = localStorage.getItem(SOAL_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    localStorage.setItem(SOAL_KEY, JSON.stringify(SEED_SOAL));
    return SEED_SOAL;
  },

  saveSoal(soal: ButirSoal): void {
    const list = this.getSoalList();
    const index = list.findIndex((q) => q.id === soal.id);
    if (index >= 0) {
      list[index] = soal;
    } else {
      list.unshift(soal);
    }
    localStorage.setItem(SOAL_KEY, JSON.stringify(list));
  },

  saveBatchSoal(newSoalList: ButirSoal[]): void {
    const list = this.getSoalList();
    for (const newSoal of newSoalList) {
      const idx = list.findIndex((q) => q.id === newSoal.id);
      if (idx >= 0) {
        list[idx] = newSoal;
      } else {
        list.unshift(newSoal);
      }
    }
    localStorage.setItem(SOAL_KEY, JSON.stringify(list));
  },

  deleteSoal(id: string): void {
    const list = this.getSoalList().filter((q) => q.id !== id);
    localStorage.setItem(SOAL_KEY, JSON.stringify(list));
  },

  getSoalById(id: string): ButirSoal | undefined {
    return this.getSoalList().find((q) => q.id === id);
  },

  getSoalByStimulusId(stimulusId: string): ButirSoal[] {
    return this.getSoalList().filter((q) => q.stimulusId === stimulusId);
  },

  // --- PAKET LATIHAN ---
  getPaketList(): PaketLatihan[] {
    try {
      const data = localStorage.getItem(PAKET_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    localStorage.setItem(PAKET_KEY, JSON.stringify(SEED_PAKET));
    return SEED_PAKET;
  },

  savePaket(paket: PaketLatihan): void {
    const list = this.getPaketList();
    const index = list.findIndex((p) => p.id === paket.id);
    if (index >= 0) {
      list[index] = paket;
    } else {
      list.unshift(paket);
    }
    localStorage.setItem(PAKET_KEY, JSON.stringify(list));
  },

  deletePaket(id: string): void {
    const list = this.getPaketList().filter((p) => p.id !== id);
    localStorage.setItem(PAKET_KEY, JSON.stringify(list));
  },

  getPaketById(id: string): PaketLatihan | undefined {
    return this.getPaketList().find((p) => p.id === id);
  },

  // --- RIWAYAT HASIL PENGERJAAN ---
  getHasilList(): HasilPengerjaan[] {
    try {
      const data = localStorage.getItem(HASIL_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  },

  saveHasil(hasil: HasilPengerjaan): void {
    const list = this.getHasilList();
    list.unshift(hasil);
    localStorage.setItem(HASIL_KEY, JSON.stringify(list));
  },

  deleteHasil(id: string): void {
    const list = this.getHasilList().filter((h) => h.id !== id);
    localStorage.setItem(HASIL_KEY, JSON.stringify(list));
  },

  getHasilById(id: string): HasilPengerjaan | undefined {
    return this.getHasilList().find((h) => h.id === id);
  },

  // Reset all to seed data
  resetAllData(): void {
    localStorage.setItem(STIMULUS_KEY, JSON.stringify(SEED_STIMULUS));
    localStorage.setItem(SOAL_KEY, JSON.stringify(SEED_SOAL));
    localStorage.setItem(PAKET_KEY, JSON.stringify(SEED_PAKET));
    localStorage.removeItem(HASIL_KEY);
  },
};
