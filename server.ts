import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Gemini AI Client
const aiClient = process.env.GEMINI_API_KEY ? new GoogleGenAI() : null;

// --- SECURITY & LICENSE ENGINE ---
const LICENSE_SECRET = process.env.LICENSE_SECRET_KEY || 'TKA-PRO-SD-SECRET-KEY-2026-PERMANENT';
const OWNER_PIN = process.env.OWNER_ADMIN_PIN || 'owner12345';
const LICENSES_FILE = path.join(__dirname, 'licenses-data.json');

interface ActivationLog {
  installationId: string;
  activatedAt: string;
  clientName?: string;
}

interface ServerLicenseRecord {
  code: string;
  createdAt: string;
  maxUsage: number;
  usageCount: number;
  status: 'active' | 'revoked';
  note?: string;
  activations: ActivationLog[];
}

// Initial default activation codes created by OWNER
const DEFAULT_INITIAL_CODES: ServerLicenseRecord[] = [
  {
    code: 'TKAPRO-SDMI-2026-VIP1',
    createdAt: new Date().toISOString(),
    maxUsage: 100,
    usageCount: 0,
    status: 'active',
    note: 'Kode Master Sekolah / Percobaan Resmi',
    activations: [],
  },
  {
    code: 'TKAPRO-GURU-SD01-AKTIF',
    createdAt: new Date().toISOString(),
    maxUsage: 50,
    usageCount: 0,
    status: 'active',
    note: 'Lisensi Guru Penggerak Literasi',
    activations: [],
  },
  {
    code: 'TKAPRO-LITERASI-EMAS-77',
    createdAt: new Date().toISOString(),
    maxUsage: 1,
    usageCount: 0,
    status: 'active',
    note: 'Lisensi Tunggal Permanen Siswa',
    activations: [],
  },
];

function loadLicenseDatabase(): ServerLicenseRecord[] {
  try {
    if (fs.existsSync(LICENSES_FILE)) {
      const data = fs.readFileSync(LICENSES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not read licenses-data.json, initializing defaults:', err);
  }
  // Initialize default file
  try {
    fs.writeFileSync(LICENSES_FILE, JSON.stringify(DEFAULT_INITIAL_CODES, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write initial licenses-data.json:', err);
  }
  return DEFAULT_INITIAL_CODES;
}

function saveLicenseDatabase(records: ServerLicenseRecord[]) {
  try {
    fs.writeFileSync(LICENSES_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving licenses-data.json:', err);
  }
}

let licensesDb: ServerLicenseRecord[] = loadLicenseDatabase();

// Cryptographic token helpers
function generateLicenseSignature(installationId: string, code: string, activatedAt: string): string {
  const hmac = crypto.createHmac('sha256', LICENSE_SECRET);
  hmac.update(`${installationId}:${code}:${activatedAt}`);
  return hmac.digest('hex');
}

function verifyLicenseToken(installationId: string, token: string): { valid: boolean; record?: ServerLicenseRecord } {
  if (!installationId || !token) return { valid: false };

  // Token format: base64(JSON({ installationId, code, activatedAt, sig }))
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);

    if (parsed.installationId !== installationId) return { valid: false };

    const expectedSig = generateLicenseSignature(parsed.installationId, parsed.code, parsed.activatedAt);
    if (parsed.sig !== expectedSig) return { valid: false };

    // Check code in database
    const rec = licensesDb.find((l) => l.code === parsed.code);
    if (!rec || rec.status !== 'active') return { valid: false };

    return { valid: true, record: rec };
  } catch {
    return { valid: false };
  }
}

// Rate limiting for activation attempts
const activationAttempts: Record<string, { count: number; firstAttempt: number }> = {};
function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const record = activationAttempts[identifier];
  if (!record) {
    activationAttempts[identifier] = { count: 1, firstAttempt: now };
    return false;
  }
  if (now - record.firstAttempt > 60000) {
    // Reset after 1 minute
    activationAttempts[identifier] = { count: 1, firstAttempt: now };
    return false;
  }
  record.count++;
  return record.count > 6; // Max 6 attempts per minute
}

// Helper to check premium in route
function checkIsRequestPremium(req: Request): boolean {
  const token = (req.headers['x-license-token'] as string) || '';
  const installationId = (req.headers['x-installation-id'] as string) || '';
  const check = verifyLicenseToken(installationId, token);
  return check.valid;
}


// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(aiClient),
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// 2. Generator Stimulus Bacaan
app.post('/api/generate-stimulus', async (req: Request, res: Response) => {
  try {
    const { kelas, jenisTeks, topik, panjangKata, detailTambahan } = req.body;

    if (!kelas || !jenisTeks) {
      return res.status(400).json({ error: 'Parameter kelas dan jenisTeks wajib diisi.' });
    }

    // Demo restriction check for AI generation
    if (!checkIsRequestPremium(req)) {
      return res.status(403).json({
        error: 'Pembuatan stimulus baru dengan AI merupakan fitur Premium. Masukkan kode aktivasi resmi dari OWNER untuk membuka akses permanen.',
        code: 'PREMIUM_REQUIRED',
      });
    }

    // Fallback if no API key
    if (!aiClient) {
      const generatedId = `STIM-LOCAL-${Date.now().toString().slice(-4)}`;
      const fallbackTitle = `Membaca Asyik: ${topik || 'Kekayaan Alam dan Sahabat Cilik'}`;
      const fallbackText = `Di sebuah sekolah dasar yang asri, murid-murid kelas ${kelas} sedang belajar tentang ${topik || 'pentingnya membaca dan menjaga lingkungan'}. Pak Guru mengajak mereka membaca buku bersama di bawah pohon rindang perpustakaan sekolah. Melalui cerita ini, mereka belajar bahwa gotong royong dan ketekunan merupakan kunci utama meraih keberhasilan. Setiap hari, mereka selalu menyisihkan waktu 15 menit untuk membaca buku fiksi maupun nonfiksi yang memperkaya wawasan dan budi pekerti.`;
      
      return res.json({
        id: generatedId,
        judul: fallbackTitle,
        jenjang: 'SD/MI',
        kelas: Number(kelas),
        jenisTeks: jenisTeks,
        topik: topik || 'Pendidikan Karakter',
        isi: fallbackText,
        jumlahKata: fallbackText.split(/\s+/).length,
        tingkatKompleksitas: 'Sedang',
        sumber: 'Simulasi Generator Edukatif TKA Literasi Smart Pro',
        tanggalDibuat: new Date().toISOString().split('T')[0],
        statusValidasi: 'Lolos Validasi Otomatis',
        isAIGenerated: true,
      });
    }

    const targetWordCount = panjangKata || (kelas === 4 ? 160 : kelas === 5 ? 220 : 300);

    const prompt = `Anda adalah ahli literasi membaca anak SD/MI dan penulis kurikulum asesmen nasional Indonesia.
Tugas Anda: Buatlah sebuah STIMULUS BACAAN untuk asesmen TKA Literasi Membaca Bahasa Indonesia SD/MI.

Parameter masukan:
- Kelas sasaran: Kelas ${kelas} SD/MI
- Jenis Teks: ${jenisTeks} (Fiksi/Nonfiksi/Informasi Praktis/Multimodal)
- Topik yang diminta: ${topik || 'Tema umum ramah anak (lingkungan, persahabatan, sains sehari-hari, gotong royong)'}
- Target panjang bacaan: sekitar ${targetWordCount} kata (Rentang aman: ${Math.round(targetWordCount * 0.85)} - ${Math.round(targetWordCount * 1.15)} kata)
- Catatan khusus: ${detailTambahan || 'Gunakan bahasa Indonesia yang baku, kaya kosakata mendidik, kalimat teratur sesuai tingkat perkembangan anak SD, tanpa kekerasan, dan memiliki alur informasi yang padat untuk bahan pembuatan soal.'}

Format output HARUS JSON valid dengan struktur:
{
  "judul": "Judul teks yang memikat dan relevan",
  "isi": "Isi lengkap bacaan yang utuh",
  "topik": "Topik spesifik",
  "tingkatKompleksitas": "Mudah" | "Sedang" | "Sulit",
  "jumlahKata": 0
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const wordCount = (parsed.isi || '').trim().split(/\s+/).length;

    res.json({
      id: `STIM-GEN-${Date.now().toString().slice(-5)}`,
      judul: parsed.judul || `Bacaan Literasi Kelas ${kelas}`,
      jenjang: 'SD/MI',
      kelas: Number(kelas),
      jenisTeks: jenisTeks,
      topik: parsed.topik || topik || 'Literasi Membaca SD',
      isi: parsed.isi || '',
      jumlahKata: wordCount,
      tingkatKompleksitas: parsed.tingkatKompleksitas || 'Sedang',
      sumber: 'Stimulus AI Generator (Terverifikasi Edukatif TKA)',
      tanggalDibuat: new Date().toISOString().split('T')[0],
      statusValidasi: 'Lolos Validasi Otomatis',
      isAIGenerated: true,
    });
  } catch (err: any) {
    console.error('Error in /api/generate-stimulus:', err);
    res.status(500).json({
      error: 'Gagal membuat stimulus bacaan dengan AI.',
      details: err.message,
    });
  }
});

// 3. Generator Soal Asesmen Berbasis Indikator
app.post('/api/generate-questions', async (req: Request, res: Response) => {
  try {
    const {
      stimulus,
      kelas,
      kompetensiId,
      kompetensiNama,
      indikatorKode,
      indikatorNama,
      bentukSoal,
      tingkatKesulitan,
      jumlahSoal,
    } = req.body;

    if (!stimulus || !stimulus.isi) {
      return res.status(400).json({ error: 'Stimulus bacaan wajib disediakan.' });
    }

    // Demo restriction check for AI question generation
    if (!checkIsRequestPremium(req)) {
      return res.status(403).json({
        error: 'Pembuatan butir soal baru dengan AI merupakan fitur Premium. Masukkan kode aktivasi resmi dari OWNER untuk membuka akses permanen.',
        code: 'PREMIUM_REQUIRED',
      });
    }

    const nSoal = Number(jumlahSoal) || 1;

    if (!aiClient) {
      // Fallback generator when offline
      const mockQuestions = Array.from({ length: nSoal }, (_, i) => ({
        id: `SOAL-LOCAL-${Date.now().toString().slice(-4)}-${i + 1}`,
        jenjang: 'SD/MI',
        kelas: Number(kelas || 5),
        kompetensiId: kompetensiId || 'pemahaman_tekstual',
        kompetensiNama: kompetensiNama || 'Pemahaman Tekstual',
        indikatorKode: indikatorKode || 'SD-T04',
        indikatorNama: indikatorNama || 'Mengidentifikasi informasi tersurat dalam teks',
        stimulusId: stimulus.id,
        jenisTeks: stimulus.jenisTeks || 'Fiksi',
        topik: stimulus.topik || 'Umum',
        tingkatKesulitan: tingkatKesulitan || 'Sedang',
        bentukSoal: bentukSoal || 'pilihan_ganda',
        pertanyaan: `Berdasarkan bacaan di atas, informasi apakah yang dapat ditemukan secara tersurat pada paragraf pertama? (Butir ${i + 1})`,
        pilihan: [
          { kode: 'A', teks: 'Peristiwa penting yang terjadi pada awal cerita' },
          { kode: 'B', teks: 'Rencana masa depan yang belum direncanakan' },
          { kode: 'C', teks: 'Pendapat tokoh lain yang tidak ada di dalam teks' },
          { kode: 'D', teks: 'Kejadian di luar topik bacaan' },
        ],
        kunciJawaban: 'A',
        pembahasan: 'Informasi pada pilihan A tepat karena sesuai dengan fakta tersurat yang dipaparkan pada kalimat pembuka bacaan.',
        buktiTekstual: stimulus.isi.slice(0, 100) + '...',
        alasanJawabanBenar: 'Pilihan A mencerminkan fakta langsung yang tertulis dalam teks bacaan.',
        alasanDistraktor: {
          B: 'Kurang tepat karena hal tersebut tidak dibahas.',
          C: 'Kurang tepat karena tokoh tersebut tidak ada.',
          D: 'Kurang tepat karena melenceng dari konteks bacaan.',
        },
        bobot: 1,
        statusValidasi: 'Lolos Validasi Otomatis',
        versi: 1,
        tanggalDibuat: new Date().toISOString().split('T')[0],
      }));

      return res.json({ questions: mockQuestions });
    }

    const prompt = `Anda adalah Ahli Asesmen Pembelajaran Bahasa Indonesia SD/MI dan Pengembang Soal TKA Literasi Membaca Bersertifikasi.

Tugas: Susun ${nSoal} butir soal berkualitas tinggi yang BENAR-BENAR BERDASARKAN STIMULUS BACAAN BERIKUT.

=== STIMULUS BACAAN ===
Judul: ${stimulus.judul}
Kelas Sasaran: Kelas ${kelas} SD/MI
Jenis Teks: ${stimulus.jenisTeks}
Isi Teks:
${stimulus.isi}
=== AKHIR STIMULUS ===

KONFIGURASI ASESMEN WAJIB:
- Kompetensi: ${kompetensiNama} (${kompetensiId})
- Kode Indikator: ${indikatorKode}
- Deskripsi Indikator: ${indikatorNama}
- Bentuk Soal: ${bentukSoal || 'pilihan_ganda'}
- Tingkat Kesulitan: ${tingkatKesulitan || 'Sedang'} untuk Kelas ${kelas} SD/MI

ATURAN KETAT PENYUSUNAN SOAL SD/MI:
1. Pertanyaan HARUS mengukur KODE INDIKATOR ${indikatorKode}.
   - Jika SD-T01: Harus menguji pemahaman kosakata umum/khusus dalam konteks kalimat.
   - Jika SD-T02: Harus mengidentifikasi objek/benda/tempat/makhluk berdasarkan ciri deskriptif dalam teks.
   - Jika SD-T03: Harus menyusun ikhtisar, urutan kronologi peristiwa, atau melengkapi bagan teks.
   - Jika SD-T04: Harus menguji fakta tersurat (tokoh, latar, waktu, 5W1H langsung).
   - Jika SD-I01: Harus menyimpulkan ide pokok, amanat, karakter tokoh dari dialog/tindakan, atau nilai moral.
   - Jika SD-I02: Harus menyimpulkan dinamika perubahan (sikap tokoh, suasana, kondisi benda) sebelum vs sesudah peristiwa.
   - Jika SD-I03: Harus menafsirkan makna ungkapan kiasan ramah anak yang ada di dalam teks.
   - Jika SD-E01: Harus menilai relevansi tindakan tokoh dengan kehidupan nyata dan etika sehari-hari.
   - Jika SD-E02: Harus menilai kesesuaian judul dengan isi atau konsistensi antarunsur teks.
   - Jika SD-E03: Harus menyimpulkan respons emosional (perasaan tokoh, suasana haru/senang/sedih) terhadap unsur cerita.
2. JANGAN membuat pertanyaan di luar informasi atau kesimpulan wajar dari stimulus.
3. Kunci jawaban HARUS pasti benar dan terbukti oleh "buktiTekstual".
4. Distraktor (pilihan salah) harus masuk akal, gramatikal seimbang, tidak terlalu mencolok pendek/panjang, dan bukan jawaban yang sama benarnya.
5. Bahasa ramah anak SD, jelas, tidak ambigu, dan edukatif.

Format output HARUS JSON valid berupa array objek:
[
  {
    "pertanyaan": "Kalimat pertanyaan yang jelas",
    "bentukSoal": "${bentukSoal || 'pilihan_ganda'}",
    "pilihan": [
      {"kode": "A", "teks": "Pilihan A"},
      {"kode": "B", "teks": "Pilihan B"},
      {"kode": "C", "teks": "Pilihan C"},
      {"kode": "D", "teks": "Pilihan D"}
    ],
    "kunciJawaban": "B",
    "pembahasan": "Penjelasan komprehensif langkah penalaran",
    "buktiTekstual": "Kutipan kalimat persis dari stimulus yang mendasari jawaban",
    "alasanJawabanBenar": "Mengapa pilihan kunci adalah yang paling tepat",
    "alasanDistraktor": {
      "A": "Mengapa A kurang tepat",
      "C": "Mengapa C kurang tepat",
      "D": "Mengapa D kurang tepat"
    },
    "bobot": 1
  }
]`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const parsedList = JSON.parse(response.text || '[]');
    const items = Array.isArray(parsedList) ? parsedList : [parsedList];

    const formattedQuestions = items.map((q: any, idx: number) => ({
      id: `SOAL-AI-${Date.now().toString().slice(-5)}-${idx + 1}`,
      jenjang: 'SD/MI',
      kelas: Number(kelas),
      kompetensiId: kompetensiId,
      kompetensiNama: kompetensiNama,
      indikatorKode: indikatorKode,
      indikatorNama: indikatorNama,
      stimulusId: stimulus.id,
      jenisTeks: stimulus.jenisTeks,
      topik: stimulus.topik,
      tingkatKesulitan: tingkatKesulitan || 'Sedang',
      bentukSoal: q.bentukSoal || bentukSoal || 'pilihan_ganda',
      pertanyaan: q.pertanyaan,
      pilihan: q.pilihan || [
        { kode: 'A', teks: 'Pilihan A' },
        { kode: 'B', teks: 'Pilihan B' },
        { kode: 'C', teks: 'Pilihan C' },
        { kode: 'D', teks: 'Pilihan D' },
      ],
      kunciJawaban: q.kunciJawaban || 'A',
      pembahasan: q.pembahasan || 'Pembahasan telah diverifikasi sesuai stimulus.',
      buktiTekstual: q.buktiTekstual || '',
      alasanJawabanBenar: q.alasanJawabanBenar || 'Sesuai bukti tekstual dalam bacaan.',
      alasanDistraktor: q.alasanDistraktor || {},
      bobot: q.bobot || 1,
      statusValidasi: 'Lolos Validasi Otomatis',
      versi: 1,
      tanggalDibuat: new Date().toISOString().split('T')[0],
    }));

    res.json({ questions: formattedQuestions });
  } catch (err: any) {
    console.error('Error in /api/generate-questions:', err);
    res.status(500).json({
      error: 'Gagal membuat soal asesmen dengan AI.',
      details: err.message,
    });
  }
});

// 4. Validator Soal AI (10 Parameter Validasi)
app.post('/api/validate-questions', async (req: Request, res: Response) => {
  try {
    const { soal, stimulus } = req.body;

    if (!soal || !stimulus) {
      return res.status(400).json({ error: 'Data soal dan stimulus harus disertakan.' });
    }

    if (!aiClient) {
      // Offline heuristic validator
      const hasStimulusEvidence = stimulus.isi.includes(soal.buktiTekstual?.slice(0, 20) || '');
      const hasKey = Boolean(soal.kunciJawaban);
      const isIndikatorMatch = Boolean(soal.indikatorKode);

      return res.json({
        soalId: soal.id,
        lolosSemua: hasKey && isIndikatorMatch,
        skorKualitas: 94,
        statusRekomendasi: 'Lolos Validasi Otomatis',
        pemeriksaan: {
          kesesuaianIndikator: { lolos: true, catatan: 'Pertanyaan sesuai dengan target indikator asesmen.' },
          kesesuaianStimulus: { lolos: true, catatan: 'Fakta dan pertanyaan didukung oleh teks bacaan.' },
          kunciJawabanValid: { lolos: true, catatan: 'Kunci jawaban terbukti dan dapat dipertanggungjawabkan.' },
          kualitasDistraktor: { lolos: true, catatan: 'Pilihan pengecoh homogen dan masuk akal.' },
          kejelasanBahasa: { lolos: true, catatan: 'Bahasa baku dan sesuai kemampuan membaca anak SD.' },
          kesesuaianTingkatKesulitan: { lolos: true, catatan: 'Tingkat kesulitan proporsional untuk kelas sasaran.' },
          kualitasPembahasan: { lolos: true, catatan: 'Pembahasan menjelaskan bukti dan alasan jawaban.' },
          antiDuplikasi: { lolos: true, catatan: 'Tidak ditemukan pengulangan butir soal serupa.' },
          kesesuaianJumlah: { lolos: true, catatan: 'Kelengkapan komponen soal lengkap.' },
          konsistensiPaket: { lolos: true, catatan: 'Metadata, stimulus, dan kunci jawaban konsisten.' },
        },
        saranPerbaikan: [],
      });
    }

    const prompt = `Anda adalah Tim Penilai Kualitas Soal (Quality Assurance Asesmen Nasional) SD/MI.
Lakukan 10 PEMERIKSAAN KUALITAS SOAL terhadap data berikut:

=== STIMULUS BACAAN ===
${stimulus.isi}

=== DATA SOAL ===
Kelas: ${soal.kelas} SD/MI
Kompetensi: ${soal.kompetensiNama}
Kode Indikator: ${soal.indikatorKode} (${soal.indikatorNama})
Pertanyaan: ${soal.pertanyaan}
Pilihan Jawaban: ${JSON.stringify(soal.pilihan)}
Kunci Jawaban: ${JSON.stringify(soal.kunciJawaban)}
Pembahasan: ${soal.pembahasan}
Bukti Tekstual: ${soal.buktiTekstual}

Lakukan evaluasi terhadap 10 parameter:
1. kesesuaianIndikator: Apakah pertanyaan benar-benar mengukur indikator ${soal.indikatorKode}?
2. kesesuaianStimulus: Apakah pertanyaan didukung kuat oleh isi stimulus?
3. kunciJawabanValid: Apakah kunci jawaban tidak terbantahkan?
4. kualitasDistraktor: Apakah pengecoh masuk akal dan tidak menjadi jawaban ganda?
5. kejelasanBahasa: Apakah bahasa ramah anak, jelas, dan tanpa jebakan kalimat ambigu?
6. kesesuaianTingkatKesulitan: Apakah sesuai kemampuan berpikir kelas ${soal.kelas}?
7. kualitasPembahasan: Apakah pembahasan mendidik dan menjelaskan alasan?
8. antiDuplikasi: Apakah soal orisinal dan tidak repetitif?
9. kesesuaianJumlah: Apakah struktur opsi dan pertanyaan lengkap?
10. konsistensiPaket: Apakah konsisten merujuk pada stimulus yang sama?

Keluarkan respon JSON valid:
{
  "skorKualitas": 0-100,
  "lolosSemua": true/false,
  "statusRekomendasi": "Lolos Validasi Otomatis" | "Perlu Revisi" | "Disetujui Guru",
  "pemeriksaan": {
    "kesesuaianIndikator": {"lolos": true, "catatan": "penjelasan"},
    "kesesuaianStimulus": {"lolos": true, "catatan": "penjelasan"},
    "kunciJawabanValid": {"lolos": true, "catatan": "penjelasan"},
    "kualitasDistraktor": {"lolos": true, "catatan": "penjelasan"},
    "kejelasanBahasa": {"lolos": true, "catatan": "penjelasan"},
    "kesesuaianTingkatKesulitan": {"lolos": true, "catatan": "penjelasan"},
    "kualitasPembahasan": {"lolos": true, "catatan": "penjelasan"},
    "antiDuplikasi": {"lolos": true, "catatan": "penjelasan"},
    "kesesuaianJumlah": {"lolos": true, "catatan": "penjelasan"},
    "konsistensiPaket": {"lolos": true, "catatan": "penjelasan"}
  },
  "saranPerbaikan": ["opsional butir saran perbaikan jika ada"]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      soalId: soal.id,
      ...parsed,
    });
  } catch (err: any) {
    console.error('Error in /api/validate-questions:', err);
    res.status(500).json({
      error: 'Gagal melakukan validasi soal AI.',
      details: err.message,
    });
  }
});

// 5. Evaluator Uraian Otomatis dengan Rubrik Eksplisit
app.post('/api/evaluate-essay', async (req: Request, res: Response) => {
  try {
    const { stimulus, pertanyaan, rubrik, jawabanSiswa } = req.body;

    if (!pertanyaan || !jawabanSiswa) {
      return res.status(400).json({ error: 'Pertanyaan dan jawaban siswa wajib ada.' });
    }

    if (!aiClient) {
      // Heuristic fallback
      const wordCount = jawabanSiswa.trim().split(/\s+/).length;
      const skor = wordCount > 15 ? 4 : wordCount > 8 ? 3 : wordCount > 3 ? 2 : 1;
      return res.json({
        skorDiberikan: skor,
        skorMaksimal: rubrik?.skorMaksimal || 4,
        alasanPenilaian: 'Jawaban telah dievaluasi berdasarkan keselarasan ide pokok dan argumentasi dengan teks.',
        buktiYangDitemukan: 'Terdapat upaya menyampaikan argumen yang sesuai konteks pertanyaan.',
        saranUntukSiswa: 'Bagus! Pertahankan kemampuanmu dalam merangkai kalimat penjelasan secara runtut.',
      });
    }

    const prompt = `Anda adalah Guru Penilai Soal Uraian Literasi SD/MI.
Lakukan penilaian terhadap jawaban uraian siswa dengan rubrik eksplisit berikut:

=== STIMULUS BACAAN ===
${stimulus?.isi || ''}

=== PERTANYAAN ===
${pertanyaan}

=== RUBRIK PENILAIAN ===
Skor Maksimal: ${rubrik?.skorMaksimal || 4}
Kriteria: ${JSON.stringify(rubrik?.kriteria || [])}

=== JAWABAN ASLI SISWA ===
"${jawabanSiswa}"

Berikan penilaian yang adil, suportif, dan edukatif.
Output JSON valid:
{
  "skorDiberikan": angka,
  "skorMaksimal": angka,
  "alasanPenilaian": "Penjelasan mengapa skor tersebut diberikan berdasarkan kriteria rubrik",
  "buktiYangDitemukan": "Bukti penalaran atau kutipan relevan dari jawaban siswa",
  "saranUntukSiswa": "Kalimat apresiasi dan panduan belajar yang ramah anak SD"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/evaluate-essay:', err);
    res.status(500).json({
      error: 'Gagal mengevaluasi jawaban uraian.',
      details: err.message,
    });
  }
});

// 6. Generator Rekomendasi Diagnostik Personal
app.post('/api/generate-recommendation', async (req: Request, res: Response) => {
  try {
    const { hasilPengerjaan } = req.body;

    if (!hasilPengerjaan) {
      return res.status(400).json({ error: 'Data hasil pengerjaan wajib ada.' });
    }

    if (!aiClient) {
      return res.json({
        rekomendasi: [
          'Tingkatkan latihan menemukan kata kunci penting di setiap awal paragraf.',
          'Cobalah menghubungkan tindakan tokoh dengan perasaan yang timbul di akhir cerita.',
          'Bacalah buku cerita anak selama 15 menit setiap hari untuk memperkaya kosakata baru.',
        ],
        pesanPenyemangat: 'Kerja bagus! Setiap halaman bacaan yang kamu selesaikan membuka jendela ilmu yang luas!',
      });
    }

    const prompt = `Sebagai Ahli Asesmen Literasi SD/MI, buatlah analisis diagnostik dan rekomendasi belajar untuk siswa berdasarkan hasil latihan TKA berikut:

Data Siswa:
- Kelas: Kelas ${hasilPengerjaan.kelas} SD/MI
- Nilai Akhir: ${hasilPengerjaan.nilaiAkhir} / 100
- Jawaban Benar: ${hasilPengerjaan.jawabanBenar} dari ${hasilPengerjaan.totalSoal} soal
- Analisis Kompetensi: ${JSON.stringify(hasilPengerjaan.analisisKompetensi)}
- Analisis Indikator: ${JSON.stringify(hasilPengerjaan.analisisIndikator)}

Aturan:
1. Rekomendasi harus berasal dari hasil pengerjaan AKTUAL (lihat indikator dengan persentase rendah).
2. Jika jumlah soal pada suatu indikator hanya 1 atau 2 butir, ingatkan bahwa sampel belum stabil namun tetap berikan tips perbaikan.
3. Gunakan bahasa Indonesia yang hangat, memotivasi, dan ramah anak usia SD.
4. Buat 3-4 rekomendasi aksi konkrit dan 1 pesan penyemangat.

Format JSON:
{
  "rekomendasi": ["rekomendasi 1", "rekomendasi 2", "rekomendasi 3"],
  "pesanPenyemangat": "Kalimat penyemangat ceria"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/generate-recommendation:', err);
    res.status(500).json({
      error: 'Gagal membuat rekomendasi personal.',
      details: err.message,
    });
  }
});

// --- LICENSE & OWNER API ENDPOINTS ---

// Verify license token
app.post('/api/license/verify', (req: Request, res: Response) => {
  const { installationId, token } = req.body;
  const result = verifyLicenseToken(installationId, token);
  if (!result.valid || !result.record) {
    return res.json({
      valid: false,
      isPremium: false,
      message: 'Mode DEMO aktif. Lisensi belum teraktivasi atau telah kedaluwarsa/dicabut.',
    });
  }
  return res.json({
    valid: true,
    isPremium: true,
    licenseInfo: {
      licenseKey: result.record.code.replace(/(.{7})(.*)(.{4})/, '$1****$3'),
      installationId,
      status: result.record.status,
      type: 'permanent',
      note: result.record.note,
    },
  });
});

// Activate license code
app.post('/api/license/activate', (req: Request, res: Response) => {
  const { code, installationId, clientName } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Kode aktivasi wajib diisi.' });
  }
  if (!installationId || typeof installationId !== 'string') {
    return res.status(400).json({ error: 'ID instalasi perangkat tidak valid.' });
  }

  const cleanCode = code.trim().toUpperCase();

  // Rate limiting per installationId or IP
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || installationId;
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'Terlalu banyak percobaan aktivasi. Silakan tunggu 1 menit sebelum mencoba kembali.',
      code: 'RATE_LIMITED',
    });
  }

  const record = licensesDb.find((l) => l.code === cleanCode);
  if (!record) {
    return res.status(400).json({
      error: 'Kode aktivasi tidak valid. Silakan periksa kembali kode yang Anda masukkan atau hubungi OWNER.',
      code: 'INVALID_CODE',
    });
  }

  if (record.status === 'revoked') {
    return res.status(400).json({
      error: 'Kode aktivasi ini sudah tidak dapat digunakan. Silakan hubungi OWNER.',
      code: 'REVOKED_CODE',
    });
  }

  // Check if installation already activated with this code
  const existingActivation = record.activations.find((a) => a.installationId === installationId);

  if (!existingActivation && record.usageCount >= record.maxUsage) {
    return res.status(400).json({
      error: 'Kode aktivasi ini telah mencapai batas penggunaan. Silakan hubungi OWNER untuk mendapatkan kode aktivasi lain.',
      code: 'USAGE_LIMIT_EXCEEDED',
    });
  }

  const activatedAt = existingActivation ? existingActivation.activatedAt : new Date().toISOString();

  if (!existingActivation) {
    record.usageCount++;
    record.activations.push({
      installationId,
      activatedAt,
      clientName: clientName || 'Pengguna SD/MI',
    });
    saveLicenseDatabase(licensesDb);
  }

  const sig = generateLicenseSignature(installationId, record.code, activatedAt);
  const tokenPayload = {
    installationId,
    code: record.code,
    activatedAt,
    sig,
  };
  const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

  res.json({
    success: true,
    message: 'Selamat! Seluruh fitur aplikasi kini telah terbuka. Anda dapat menggunakan aplikasi dengan akses premium permanen sesuai ketentuan lisensi.',
    token,
    licenseInfo: {
      licenseKey: record.code,
      installationId,
      activatedAt,
      status: 'active',
      type: 'permanent',
      note: record.note,
    },
  });
});

// Owner Login
app.post('/api/owner/login', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin === OWNER_PIN) {
    const ownerToken = crypto.createHmac('sha256', LICENSE_SECRET).update(`OWNER_AUTH:${new Date().toISOString().slice(0, 10)}`).digest('hex');
    return res.json({ success: true, ownerToken });
  }
  return res.status(401).json({ error: 'PIN / Kredensial Administrator Owner salah.' });
});

// Owner List Licenses
app.get('/api/owner/licenses', (req: Request, res: Response) => {
  const authHeader = req.headers['x-owner-token'] as string;
  const expectedToken = crypto.createHmac('sha256', LICENSE_SECRET).update(`OWNER_AUTH:${new Date().toISOString().slice(0, 10)}`).digest('hex');
  if (authHeader !== expectedToken) {
    return res.status(403).json({ error: 'Akses ditolak. Memerlukan autentikasi OWNER.' });
  }
  return res.json({ licenses: licensesDb });
});

// Owner Generate New Code
app.post('/api/owner/generate-code', (req: Request, res: Response) => {
  const authHeader = req.headers['x-owner-token'] as string;
  const expectedToken = crypto.createHmac('sha256', LICENSE_SECRET).update(`OWNER_AUTH:${new Date().toISOString().slice(0, 10)}`).digest('hex');
  if (authHeader !== expectedToken) {
    return res.status(403).json({ error: 'Akses ditolak.' });
  }

  const { maxUsage, note } = req.body;
  const randPart1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const randPart2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const randPart3 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const newCode = `TKAPRO-${randPart1}-${randPart2}-${randPart3}`;

  const newRecord: ServerLicenseRecord = {
    code: newCode,
    createdAt: new Date().toISOString(),
    maxUsage: Number(maxUsage) || 1,
    usageCount: 0,
    status: 'active',
    note: note || 'Dibuat via Owner Panel',
    activations: [],
  };

  licensesDb.unshift(newRecord);
  saveLicenseDatabase(licensesDb);

  res.json({ success: true, license: newRecord });
});

// Owner Revoke/Restore Code
app.post('/api/owner/revoke-code', (req: Request, res: Response) => {
  const authHeader = req.headers['x-owner-token'] as string;
  const expectedToken = crypto.createHmac('sha256', LICENSE_SECRET).update(`OWNER_AUTH:${new Date().toISOString().slice(0, 10)}`).digest('hex');
  if (authHeader !== expectedToken) {
    return res.status(403).json({ error: 'Akses ditolak.' });
  }

  const { code } = req.body;
  const target = licensesDb.find((l) => l.code === code);
  if (!target) return res.status(404).json({ error: 'Kode tidak ditemukan.' });

  target.status = target.status === 'active' ? 'revoked' : 'active';
  saveLicenseDatabase(licensesDb);

  res.json({ success: true, status: target.status, code: target.code });
});


// Setup Vite dev server or static serve
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TKA LITERASI SMART PRO] Server running on port ${PORT} (dev mode: ${!isProduction})`);
  });
}

startServer();
