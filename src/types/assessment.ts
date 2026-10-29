export type KelasSD = 4 | 5 | 6;

export type KompetensiId = 'pemahaman_tekstual' | 'pemahaman_inferensial' | 'evaluasi_apresiasi';

export type IndikatorKode =
  | 'SD-T01'
  | 'SD-T02'
  | 'SD-T03'
  | 'SD-T04'
  | 'SD-I01'
  | 'SD-I02'
  | 'SD-I03'
  | 'SD-E01'
  | 'SD-E02'
  | 'SD-E03';

export type JenisTeks = 'Fiksi' | 'Nonfiksi' | 'Informasi Praktis' | 'Multimodal';

export type TingkatKesulitan = 'Mudah' | 'Sedang' | 'Sulit';

export type BentukSoal =
  | 'pilihan_ganda'
  | 'pilihan_ganda_kompleks'
  | 'benar_salah'
  | 'menjodohkan'
  | 'isian_singkat'
  | 'uraian_singkat';

export type StatusValidasi =
  | 'Draf'
  | 'Perlu Ditinjau'
  | 'Lolos Validasi Otomatis'
  | 'Disetujui Guru'
  | 'Perlu Revisi';

export interface PilihanOpsi {
  kode: string; // "A", "B", "C", "D"
  teks: string;
}

export interface BenarSalahItem {
  id: string;
  pernyataan: string;
  kunci: boolean; // true = Benar, false = Salah
}

export interface MenjodohkanItem {
  id: string;
  kiri: string;
  kanan: string; // Jawaban benar di sisi kanan
}

export interface RubrikUraian {
  skorMaksimal: number;
  kriteria: {
    skor: number;
    deskripsi: string;
  }[];
}

export interface StimulusBacaan {
  id: string;
  judul: string;
  jenjang: 'SD/MI';
  kelas: KelasSD;
  jenisTeks: JenisTeks;
  topik: string;
  isi: string;
  jumlahKata: number;
  tingkatKompleksitas: TingkatKesulitan;
  sumber: string; // e.g., "Simulasi Edukatif TKA" atau judul buku/penulis
  tanggalDibuat: string;
  statusValidasi: StatusValidasi;
  daftarSoalTerkait?: string[]; // array ID soal
  elemenMultimodal?: {
    tipe: 'tabel' | 'bagan' | 'catatan';
    judul?: string;
    data: any;
  };
}

export interface ButirSoal {
  id: string;
  jenjang: 'SD/MI';
  kelas: KelasSD;
  kompetensiId: KompetensiId;
  kompetensiNama: string;
  indikatorKode: IndikatorKode;
  indikatorNama: string;
  stimulusId: string;
  jenisTeks: JenisTeks;
  topik: string;
  tingkatKesulitan: TingkatKesulitan;
  bentukSoal: BentukSoal;
  pertanyaan: string;
  
  // Pilihan Ganda Tunggal & Pilihan Ganda Kompleks
  pilihan?: PilihanOpsi[];
  kunciJawaban: string | string[]; // "B" atau ["A", "C"] untuk PG Kompleks
  
  // Benar / Salah
  daftarBenarSalah?: BenarSalahItem[];

  // Menjodohkan
  daftarMenjodohkan?: MenjodohkanItem[];

  // Isian Singkat
  kunciIsian?: string[]; // alternatif kata kunci yang diterima

  // Uraian
  rubrikUraian?: RubrikUraian;
  contohJawabanUraian?: string;

  // Analisis Pembahasan & Bukti
  pembahasan: string;
  buktiTekstual: string;
  alasanJawabanBenar: string;
  alasanDistraktor?: Record<string, string>; // e.g., {"A": "Kurang tepat karena...", "C": "..."}

  bobot: number;
  statusValidasi: StatusValidasi;
  catatanValidasi?: string;
  versi: number;
  tanggalDibuat: string;
}

export interface HasilValidasiAI {
  soalId: string;
  lolosSemua: boolean;
  skorKualitas: number; // 0 - 100
  statusRekomendasi: StatusValidasi;
  pemeriksaan: {
    kesesuaianIndikator: { lolos: boolean; catatan: string };
    kesesuaianStimulus: { lolos: boolean; catatan: string };
    kunciJawabanValid: { lolos: boolean; catatan: string };
    kualitasDistraktor: { lolos: boolean; catatan: string };
    kejelasanBahasa: { lolos: boolean; catatan: string };
    kesesuaianTingkatKesulitan: { lolos: boolean; catatan: string };
    kualitasPembahasan: { lolos: boolean; catatan: string };
    antiDuplikasi: { lolos: boolean; catatan: string };
    kesesuaianJumlah: { lolos: boolean; catatan: string };
    konsistensiPaket: { lolos: boolean; catatan: string };
  };
  saranPerbaikan?: string[];
}

export interface ButirKisiKisi {
  nomor: number;
  kelas: KelasSD;
  kompetensiNama: string;
  indikatorKode: IndikatorKode;
  indikatorNama: string;
  jenisTeks: JenisTeks;
  topik: string;
  tingkatKesulitan: TingkatKesulitan;
  bentukSoal: BentukSoal;
  stimulusId: string;
  bobot: number;
  soalId?: string;
}

export interface PaketLatihan {
  id: string;
  judul: string;
  deskripsi: string;
  kelas: KelasSD;
  tipe: 'latihan_mandiri' | 'simulasi_tka' | 'diagnostik';
  modePengerjaanDefault: 'belajar' | 'ujian';
  durasiMenit: number;
  stimulusList: StimulusBacaan[];
  soalList: ButirSoal[];
  kisiKisi: ButirKisiKisi[];
  acakSoal: boolean;
  acakPilihan: boolean;
  tanggalDibuat: string;
}

export interface JawabanSiswaItem {
  soalId: string;
  jawaban: any; // "B", ["A", "C"], { [itemId]: boolean }, { [kiri]: string }, string
  raguRagu?: boolean;
  waktuDetik?: number;
}

export interface EvaluasiUraianAI {
  skorDiberikan: number;
  skorMaksimal: number;
  alasanPenilaian: string;
  buktiYangDitemukan: string;
  saranUntukSiswa: string;
}

export interface HasilPengerjaan {
  id: string;
  paketId: string;
  paketJudul: string;
  namaPeserta: string;
  kelas: KelasSD;
  mode: 'belajar' | 'ujian';
  tipe: 'latihan_mandiri' | 'simulasi_tka' | 'diagnostik';
  waktuMulai: string;
  waktuSelesai: string;
  durasiPengerjaanDetik: number;

  totalSoal: number;
  jawabanBenar: number;
  jawabanSalah: number;
  jawabanKosong: number;
  nilaiAkhir: number; // skala 0 - 100

  // Per Kompetensi
  analisisKompetensi: {
    kompetensiId: KompetensiId;
    nama: string;
    totalSoal: number;
    benar: number;
    persentase: number;
  }[];

  // Per Indikator
  analisisIndikator: {
    kode: IndikatorKode;
    nama: string;
    totalSoal: number;
    benar: number;
    persentase: number;
    status: 'Sangat Baik' | 'Cukup' | 'Perlu Bimbingan';
    stabil: boolean; // false jika totalSoal < 3
  }[];

  evaluasiUraian?: Record<string, EvaluasiUraianAI>;
  rekomendasiDiagnostik: string[];
  pesanPenyemangat: string;
  rekomendasiPaketLatihanLanjutan?: string;

  detailJawaban: {
    soalId: string;
    jawabanSiswa: any;
    kunciJawaban: any;
    apakahBenar: boolean;
    skor: number;
    skorMaks: number;
  }[];
}
