import { ButirSoal, HasilPengerjaan, HasilValidasiAI, StimulusBacaan } from '../types/assessment';
import { accessService } from './accessService';

export const apiService = {
  async checkHealth(): Promise<{ status: string; hasApiKey: boolean; model: string }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch {
      return { status: 'offline', hasApiKey: false, model: 'local-fallback' };
    }
  },

  async generateStimulus(params: {
    kelas: number;
    jenisTeks: string;
    topik?: string;
    panjangKata?: number;
    detailTambahan?: string;
  }): Promise<StimulusBacaan> {
    const res = await fetch('/api/generate-stimulus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...accessService.getAuthHeaders(),
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal menghasilkan stimulus bacaan.');
    }

    return await res.json();
  },

  async generateQuestions(params: {
    stimulus: StimulusBacaan;
    kelas: number;
    kompetensiId: string;
    kompetensiNama: string;
    indikatorKode: string;
    indikatorNama: string;
    bentukSoal?: string;
    tingkatKesulitan?: string;
    jumlahSoal?: number;
  }): Promise<ButirSoal[]> {
    const res = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...accessService.getAuthHeaders(),
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal menghasilkan soal asesmen.');
    }

    const data = await res.json();
    return data.questions || [];
  },

  async validateQuestion(params: {
    soal: ButirSoal;
    stimulus: StimulusBacaan;
  }): Promise<HasilValidasiAI> {
    const res = await fetch('/api/validate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal memvalidasi butir soal.');
    }

    return await res.json();
  },

  async evaluateEssay(params: {
    stimulus: StimulusBacaan;
    pertanyaan: string;
    rubrik?: any;
    jawabanSiswa: string;
  }): Promise<any> {
    const res = await fetch('/api/evaluate-essay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal mengevaluasi jawaban uraian.');
    }

    return await res.json();
  },

  async generateRecommendation(params: {
    hasilPengerjaan: HasilPengerjaan;
  }): Promise<{ rekomendasi: string[]; pesanPenyemangat: string }> {
    const res = await fetch('/api/generate-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      return {
        rekomendasi: [
          'Tingkatkan latihan membaca kritis pada teks dengan kosakata baru.',
          'Berlatihlah menghubungkan tindakan tokoh dengan konsekuensi perbuatannya.',
          'Catat ide pokok pada setiap paragraf sebelum menjawab pertanyaan.',
        ],
        pesanPenyemangat: 'Semangat terus belajarnya! Literasi membuka jalan menuju masa depan gemilang!',
      };
    }

    return await res.json();
  },
};
