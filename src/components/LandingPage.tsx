import React from 'react';
import {
  BookOpen,
  Sparkles,
  Clock,
  CheckCircle2,
  TableProperties,
  ArrowRight,
  Target,
  Brain,
  HeartHandshake,
  Lightbulb,
  Award,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { INDIKATOR_MATRIKS, KOMPETENSI_LIST, STANDAR_KELAS_SD } from '../data/assessmentFramework';
import { KelasSD } from '../types/assessment';
import { NavTab } from './Navbar';

interface LandingPageProps {
  currentKelas: KelasSD;
  setCurrentKelas: (kelas: KelasSD) => void;
  setActiveTab: (tab: NavTab) => void;
  onStartSimulation: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentKelas,
  setCurrentKelas,
  setActiveTab,
  onStartSimulation,
}) => {
  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-indigo-50/40 to-white pt-10 pb-16 px-4 sm:px-6 rounded-3xl border border-blue-100 shadow-sm mt-4">
        {/* Decorative background blurs */}
        <div className="absolute top-0 right-10 -mt-12 -mr-12 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-12 -ml-12 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/90 border border-blue-200 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-blue-800 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Platform Cerdas Asesmen Literasi Membaca SD/MI Berbasis AI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            TKA LITERASI <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">SMART PRO</span> SD/MI
          </h1>

          <p className="text-lg sm:text-2xl font-bold text-indigo-700 italic">
            "Latihan Cerdas, Pahami Bacaan, Siap Hadapi TKA!"
          </p>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
            Membantu siswa SD/MI menguasai kemampuan literasi membaca secara terarah melalui stimulus bacaan kontekstual, latihan bergradasi, pembahasan edukatif mendalam, kisi-kisi otomatis, dan analisis capaian 10 indikator asesmen nasional.
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('latihan')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition transform hover:-translate-y-0.5"
            >
              <BookOpen className="w-5 h-5" />
              Mulai Latihan Mandiri
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStartSimulation}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition transform hover:-translate-y-0.5"
            >
              <Clock className="w-5 h-5" />
              Simulasi Ujian TKA (Timer)
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-700 font-bold px-5 py-3.5 rounded-2xl border-2 border-indigo-200 shadow-xs transition"
            >
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Buat Soal dengan AI
            </button>
          </div>

          {/* Disclaimer note */}
          <div className="text-xs text-slate-500 pt-2 flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Simulasi mandiri untuk penguatan literasi belajar siswa SD/MI, bukan penyelenggaraan TKA resmi negara.</span>
          </div>
        </div>
      </section>

      {/* GRADE SELECTION (KELAS 4, 5, 6) */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Pilih Jenjang Kelas Sasaran</h2>
          <p className="text-sm text-slate-600">
            Setiap kelas memiliki adaptasi kosakata, panjang wacana, dan kompleksitas penalaran yang disesuaikan dengan psikologi perkembangan siswa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {([4, 5, 6] as KelasSD[]).map((k) => {
            const std = STANDAR_KELAS_SD[k];
            const isSelected = currentKelas === k;

            return (
              <div
                key={k}
                onClick={() => setCurrentKelas(k)}
                className={`relative rounded-3xl p-6 cursor-pointer transition-all border-2 ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 shadow-md ring-4 ring-blue-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                      isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {k}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Kelas {k} SD/MI</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded-md">
                      Panjang: ~{std.panjangKataMin}–{std.panjangKataMax} kata
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {std.kompleksitasBahasa}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Fokus Bacaan:
                  </span>
                  <p className="text-xs font-medium text-slate-700">{std.karakteristikBacaan}</p>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600">
                    {isSelected ? 'Sedang Aktif Digunakan' : 'Klik untuk Memilih'}
                  </span>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 CORE COMPETENCIES */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">3 Pilar Kompetensi Asesmen Literasi</h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Fondasi baku pengujian literasi membaca Bahasa Indonesia SD/MI yang membagi penalaran dari tataran tersurat hingga refleksi moral.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kompetensi 1 */}
          <div className="bg-white rounded-3xl p-6 border border-blue-200 shadow-xs hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                Kompetensi 1
              </span>
              <h3 className="text-lg font-bold text-slate-900">Pemahaman Tekstual</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Memahami fakta, kosakata, ciri objek, dan informasi yang dikemukakan secara eksplisit (tersurat) dalam teks serta menyusunnya kembali menjadi ikhtisar atau bagan.
            </p>
            <div className="bg-blue-50/70 rounded-xl p-3 text-xs text-blue-900 font-medium space-y-1">
              <div className="font-bold">4 Indikator Pengukuran:</div>
              <div>• SD-T01: Kosakata umum & khusus</div>
              <div>• SD-T02: Identifikasi objek deskriptif</div>
              <div>• SD-T03: Ikhtisar & bagan alur</div>
              <div>• SD-T04: Informasi tersurat (5W1H)</div>
            </div>
          </div>

          {/* Kompetensi 2 */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-xs hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
                Kompetensi 2
              </span>
              <h3 className="text-lg font-bold text-slate-900">Pemahaman Inferensial</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Menghubungkan petunjuk tersirat untuk menyimpulkan ide pokok, amanat, karakter tokoh, transformasi keadaan, serta menafsirkan ungkapan kiasan bahasa.
            </p>
            <div className="bg-emerald-50/70 rounded-xl p-3 text-xs text-emerald-900 font-medium space-y-1">
              <div className="font-bold">3 Indikator Pengukuran:</div>
              <div>• SD-I01: Ide pokok, amanat, tokoh & nilai</div>
              <div>• SD-I02: Perubahan objek/karakter/latar</div>
              <div>• SD-I03: Makna ungkapan kontekstual</div>
            </div>
          </div>

          {/* Kompetensi 3 */}
          <div className="bg-white rounded-3xl p-6 border border-purple-200 shadow-xs hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600">
                Kompetensi 3
              </span>
              <h3 className="text-lg font-bold text-slate-900">Evaluasi dan Apresiasi</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Menilai relevansi tindakan tokoh dengan kehidupan nyata, memeriksa kesesuaian judul/informasi, serta menyimpulkan respons emosional dan suasana cerita.
            </p>
            <div className="bg-purple-50/70 rounded-xl p-3 text-xs text-purple-900 font-medium space-y-1">
              <div className="font-bold">3 Indikator Pengukuran:</div>
              <div>• SD-E01: Relevansi dengan kehidupan sehari-hari</div>
              <div>• SD-E02: Kesesuaian antarunsur teks & judul</div>
              <div>• SD-E03: Respons emosional unsur fiksi</div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 INDIKATOR MATRIKS ASESMEN SD/MI */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Matriks 10 Indikator Asesmen Wajib SD/MI
            </h2>
            <p className="text-sm text-slate-600">
              Setiap butir soal dijamin terikat pada salah satu dari kode indikator operasional berikut.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('generator')}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-xl transition self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            Buka Generator Indikator
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(INDIKATOR_MATRIKS).map((ind) => (
            <div
              key={ind.kode}
              className="p-4 rounded-2xl border border-slate-200/90 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-xs px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 tracking-wide">
                  {ind.kode}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {ind.kompetensiNama}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 leading-snug">{ind.nama}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{ind.definisi}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE SPOTLIGHT */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => setActiveTab('generator')}
          className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-3xl border border-indigo-100 hover:border-indigo-300 cursor-pointer shadow-xs transition"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-base text-slate-900 mb-1">Generator Soal AI</h4>
          <p className="text-xs text-slate-600">
            Hasilkan stimulus dan soal sesuai kisi-kisi, lengkap dengan bukti kalimat langsung dari teks.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('validator')}
          className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-3xl border border-purple-100 hover:border-purple-300 cursor-pointer shadow-xs transition"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-base text-slate-900 mb-1">Validator 10 Parameter</h4>
          <p className="text-xs text-slate-600">
            Pemeriksaan otomatis kesesuaian indikator, distraktor, kunci jawaban, dan kejelasan bahasa anak.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('kisi-kisi')}
          className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-3xl border border-amber-100 hover:border-amber-300 cursor-pointer shadow-xs transition"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3">
            <TableProperties className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-base text-slate-900 mb-1">Kisi-Kisi Otomatis</h4>
          <p className="text-xs text-slate-600">
            Distribusi seimbang 3 kompetensi dan ekspor langsung dalam format Word, Excel, maupun PDF.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('bank-soal')}
          className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-3xl border border-emerald-100 hover:border-emerald-300 cursor-pointer shadow-xs transition"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-base text-slate-900 mb-1">Bank Soal & Stimulus</h4>
          <p className="text-xs text-slate-600">
            Penyimpanan terpadu teks fiksi, nonfiksi, informasi praktis, dan multimodal yang siap dirakit.
          </p>
        </div>
      </section>
    </div>
  );
};
