import { IndikatorKode, KelasSD, KompetensiId, TingkatKesulitan } from '../types/assessment';

export interface IndikatorDetail {
  kode: IndikatorKode;
  kompetensiId: KompetensiId;
  kompetensiNama: string;
  nama: string;
  definisi: string;
  cakupanSoal: string[];
  contohKonteks: string[];
  tipsPenyusunan: string;
}

export interface KompetensiDetail {
  id: KompetensiId;
  nama: string;
  definisi: string;
  warnaTema: string;
  indikatorList: IndikatorKode[];
}

export const KOMPETENSI_LIST: Record<KompetensiId, KompetensiDetail> = {
  pemahaman_tekstual: {
    id: 'pemahaman_tekstual',
    nama: 'Pemahaman Tekstual',
    definisi:
      'Kemampuan memahami informasi yang dikemukakan secara eksplisit (tersurat) dalam teks, termasuk mengidentifikasi, mengelompokkan, menyusun ulang, dan menyajikan kembali informasi tanpa mengubah makna dasar.',
    warnaTema: 'blue',
    indikatorList: ['SD-T01', 'SD-T02', 'SD-T03', 'SD-T04'],
  },
  pemahaman_inferensial: {
    id: 'pemahaman_inferensial',
    nama: 'Pemahaman Inferensial',
    definisi:
      'Kemampuan menarik kesimpulan berdasarkan informasi tersirat, menghubungkan berbagai petunjuk dalam teks, serta menjelaskan makna kiasan atau hubungan sebab-akibat yang tidak disampaikan secara langsung.',
    warnaTema: 'emerald',
    indikatorList: ['SD-I01', 'SD-I02', 'SD-I03'],
  },
  evaluasi_apresiasi: {
    id: 'evaluasi_apresiasi',
    nama: 'Evaluasi dan Apresiasi',
    definisi:
      'Kemampuan menilai gagasan, menanggapi isi dan struktur teks, merefleksikan peristiwa dengan kehidupan nyata, serta memahami dan merespons suasana emosional atau nilai estetis dalam bacaan.',
    warnaTema: 'purple',
    indikatorList: ['SD-E01', 'SD-E02', 'SD-E03'],
  },
};

export const INDIKATOR_MATRIKS: Record<IndikatorKode, IndikatorDetail> = {
  'SD-T01': {
    kode: 'SD-T01',
    kompetensiId: 'pemahaman_tekstual',
    kompetensiNama: 'Pemahaman Tekstual',
    nama: 'Mengidentifikasi penggunaan kosakata umum dan khusus dalam berbagai bidang',
    definisi:
      'Mengidentifikasi dan menentukan arti kata umum maupun istilah teknis/khusus (lingkungan, kesehatan, teknologi sederhana, budaya, dsb.) sesuai konteks pemakaian dalam kalimat atau paragraf.',
    cakupanSoal: [
      'Mengenali kosakata umum',
      'Mengenali kosakata khusus (istilah bidang)',
      'Memahami penggunaan kosakata dalam konteks kalimat',
      'Membedakan kosakata umum dan khusus berdasarkan penggunaannya',
      'Menentukan makna kosakata berdasarkan kalimat atau paragraf',
    ],
    contohKonteks: [
      'Lingkungan hidup & ekosistem',
      'Flora dan fauna Nusantara',
      'Kesehatan tubuh & gizi',
      'Pendidikan & sekolah',
      'Teknologi sederhana sehari-hari',
      'Kehidupan sosial dan gotong royong',
      'Keragaman budaya Indonesia',
    ],
    tipsPenyusunan:
      'Pastikan kata yang diujikan berada dalam kalimat stimulus. Pilihan jawaban harus berupa definisi kontekstual yang wajar bagi siswa SD.',
  },
  'SD-T02': {
    kode: 'SD-T02',
    kompetensiId: 'pemahaman_tekstual',
    kompetensiNama: 'Pemahaman Tekstual',
    nama: 'Mengidentifikasi objek berdasarkan kosakata yang digunakan dalam teks fiksi atau nonfiksi',
    definisi:
      'Menentukan benda, hewan, tumbuhan, tempat, atau fenomena alam yang dideskripsikan secara eksplisit melalui ciri-ciri dan frasa deskriptif dalam teks.',
    cakupanSoal: [
      'Mengidentifikasi objek yang dideskripsikan',
      'Menentukan benda, hewan, tempat, atau fenomena berdasarkan petunjuk ciri',
      'Menghubungkan kata atau frasa deskriptif dengan objek yang tepat',
      'Mengenali ciri objek yang disebutkan secara eksplisit',
    ],
    contohKonteks: [
      'Ciri fisik hewan langka',
      'Alat transportasi tradisional',
      'Bagian-bagian tumbuhan dan fungsinya',
      'Benda bersejarah / museum',
      'Karakteristik tempat wisata alam',
    ],
    tipsPenyusunan:
      'Gunakan petunjuk ciri spesifik dari bacaan sehingga hanya ada satu objek yang tepat sesuai teks.',
  },
  'SD-T03': {
    kode: 'SD-T03',
    kompetensiId: 'pemahaman_tekstual',
    kompetensiNama: 'Pemahaman Tekstual',
    nama: 'Menyusun kembali informasi dari teks dalam bentuk ikhtisar atau bagan',
    definisi:
      'Menyajikan ulang urutan kejadian, melengkapi bagan alur, membuat ringkasan yang akurat, atau mengelompokkan fakta-fakta tanpa mengubah makna aslinya.',
    cakupanSoal: [
      'Memilih ringkasan / ikhtisar yang paling sesuai',
      'Mengurutkan kronologi peristiwa atau langkah kegiatan',
      'Mengelompokkan informasi berdasarkan kategori tabel/bagan',
      'Menentukan informasi utama untuk melengkapi bagan rumpang',
      'Menyajikan kembali informasi tersurat tanpa bias makna',
    ],
    contohKonteks: [
      'Langkah pembuatan pupuk kompos / kerajinan',
      'Kronologi perjalanan wisata atau peristiwa sejarah anak',
      'Bagan siklus hidup kupu-kupu atau metamorfosis',
      'Ringkasan laporan kunjungan ke kebun raya',
    ],
    tipsPenyusunan:
      'Pilihan ringkasan yang benar harus mencakup gagasan penting secara berurutan dan tidak memuat opini luar teks.',
  },
  'SD-T04': {
    kode: 'SD-T04',
    kompetensiId: 'pemahaman_tekstual',
    kompetensiNama: 'Pemahaman Tekstual',
    nama: 'Mengidentifikasi informasi tersurat dalam teks (5W1H eksplisit)',
    definisi:
      'Menemukan fakta eksplisit mengenai tokoh, latar tempat, waktu, tindakan, peristiwa utama, atau pernyataan yang sesuai langsung dengan kalimat bacaan.',
    cakupanSoal: [
      'Menentukan siapa tokoh yang terlibat',
      'Menentukan di mana lokasi peristiwa terjadi',
      'Menentukan kapan peristiwa berlangsung',
      'Menemukan peristiwa yang terjadi secara langsung',
      'Menentukan pernyataan yang benar/sesuai dengan isi bacaan',
    ],
    contohKonteks: [
      'Kegiatan kerja bakti di desa',
      'Jadwal pertandingan olahraga antarkelas',
      'Pengumuman karya wisata sekolah',
      'Percakapan fabel tentang tolong-menolong',
    ],
    tipsPenyusunan:
      'Jawaban harus dapat ditunjukkan langsung dengan kutipan kalimat pada teks (kata kunci eksplisit).',
  },
  'SD-I01': {
    kode: 'SD-I01',
    kompetensiId: 'pemahaman_inferensial',
    kompetensiNama: 'Pemahaman Inferensial',
    nama: 'Menyimpulkan ide pokok, gagasan pendukung, amanat, tokoh, atau nilai teks',
    definisi:
      'Menyimpulkan pesan moral, ide pokok paragraf, karakter tokoh dari tindakannya, atau nilai kebaikan yang tersirat di balik jalinan narasi atau paparan.',
    cakupanSoal: [
      'Menyimpulkan ide pokok / gagasan utama paragraf',
      'Menentukan gagasan pendukung yang relevan',
      'Menyimpulkan sifat dan watak tokoh berdasarkan dialog atau perbuatannya',
      'Menyimpulkan amanat / pesan moral cerita',
      'Menemukan nilai positif kejujuran, disiplin, kerja keras',
      'Menjelaskan alasan logis suatu tindakan',
    ],
    contohKonteks: [
      'Cerita inspiratif persahabatan anak sekolah',
      'Fabel tentang kesabaran dan kecerdikan kancil/burung gagak',
      'Artikel tentang kepedulian menghemat air bersih',
    ],
    tipsPenyusunan:
      'Hindari pertanyaan hafalan teori ("apakah pengertian ide pokok?"). Langsung aplikasikan pada stimulus cerita.',
  },
  'SD-I02': {
    kode: 'SD-I02',
    kompetensiId: 'pemahaman_inferensial',
    kompetensiNama: 'Pemahaman Inferensial',
    nama: 'Menyimpulkan perubahan sederhana pada objek, karakter, atau latar',
    definisi:
      'Menyimpulkan dinamika perubahan keadaan (misal: tokoh yang awalnya sombong menjadi rendah hati, sungai yang kotor menjadi asri) dan sebab-sebab perubahannya.',
    cakupanSoal: [
      'Menentukan perubahan sifat/sikap tokoh sebelum dan sesudah peristiwa',
      'Menyimpulkan perubahan keadaan suatu lingkungan atau benda',
      'Mengidentifikasi pergeseran latar suasana atau waktu',
      'Menjelaskan penyebab terjadinya perubahan berdasarkan bukti',
      'Membandingkan kondisi sebelum vs setelah kejadian',
    ],
    contohKonteks: [
      'Sikap tokoh yang berubah setelah menerima nasihat sahabat',
      'Kondisi taman sekolah sebelum dan sesudah kegiatan penghijauan',
      'Perubahan cuaca mendung menjadi hujan lebat dalam petualangan',
    ],
    tipsPenyusunan:
      'Pertanyaan harus menuntut siswa menghubungkan bagian awal dan bagian akhir teks untuk melihat transformasi keadaan.',
  },
  'SD-I03': {
    kode: 'SD-I03',
    kompetensiId: 'pemahaman_inferensial',
    kompetensiNama: 'Pemahaman Inferensial',
    nama: 'Menjelaskan makna ungkapan atau kiasan yang digunakan dalam teks',
    definisi:
      'Menafsirkan ungkapan bahasa Indonesia (misal: besar kepala, buah tangan, berlapang dada, banting tulang, rendah hati) sesuai konteks penggunaannya.',
    cakupanSoal: [
      'Menentukan makna ungkapan berdasarkan alur cerita',
      'Menafsirkan ungkapan kiasan sederhana yang ramah anak',
      'Menentukan maksud ungkapan dalam percakapan tokoh',
      'Membedakan makna harfiah dengan makna kontekstual kiasan',
    ],
    contohKonteks: [
      'Ungkapan "ringan tangan" dalam konteks suka membantu',
      'Ungkapan "lapang dada" saat menerima kekalahan perlombaan',
      'Ungkapan "kutu buku" untuk anak yang rajin membaca di perpustakaan',
    ],
    tipsPenyusunan:
      'Hindari ungkapan arkais yang sudah tidak wajar bagi siswa SD modern. Gunakan ungkapan umum dan relevan dengan etika anak.',
  },
  'SD-E01': {
    kode: 'SD-E01',
    kompetensiId: 'evaluasi_apresiasi',
    kompetensiNama: 'Evaluasi dan Apresiasi',
    nama: 'Menilai relevansi peristiwa dalam teks dengan kehidupan sehari-hari',
    definisi:
      'Menilai apakah tindakan tokoh patut dicontoh atau relevan dengan situasi nyata di rumah, sekolah, atau masyarakat, serta menentukan tindakan yang tepat.',
    cakupanSoal: [
      'Menilai kesesuaian tindakan tokoh dalam menyelesaikan masalah',
      'Menghubungkan peristiwa bacaan dengan pengalaman nyata siswa',
      'Menilai manfaat sikap bijaksana tokoh bagi lingkungan',
      'Menentukan tindakan teladan yang sebaiknya dilakukan jika berada di posisi tokoh',
      'Merefleksikan penerapan nilai kebaikan dalam kehidupan sehari-hari',
    ],
    contohKonteks: [
      'Menemukan barang hilang di sekolah lalu mengembalikannya ke guru',
      'Mengajak teman bergotong royong membersihkan selokan',
      'Menggunakan gawai secara bijak dan membatasi waktu main gim',
    ],
    tipsPenyusunan:
      'Soal harus memiliki satu jawaban terbaik yang jelas didukung penalaran moral yang sehat dan bukti dalam teks.',
  },
  'SD-E02': {
    kode: 'SD-E02',
    kompetensiId: 'evaluasi_apresiasi',
    kompetensiNama: 'Evaluasi dan Apresiasi',
    nama: 'Menilai kesesuaian antarunsur dan antarinformasi dalam teks',
    definisi:
      'Memeriksa konsistensi informasi bacaan, menilai ketepatan judul, menemukan bagian yang bertentangan atau tidak padu, serta menilai kelogisan argumen.',
    cakupanSoal: [
      'Memeriksa konsistensi antara judul dan isi teks',
      'Mengidentifikasi kalimat yang tidak padu (sumbang) dalam paragraf',
      'Menilai kesesuaian tindakan tokoh dengan karakter yang telah digambarkan',
      'Menilai hubungan logis antarpernyataan sebab-akibat',
      'Menilai kelengkapan informasi dalam teks petunjuk / prosedur',
    ],
    contohKonteks: [
      'Menentukan apakah judul "Manfaat Jamu Tradisional" cocok dengan paragraf yang disajikan',
      'Menemukan kalimat yang melenceng dari topik pelestarian komodo',
      'Menilai apakah langkah membuat layang-layang sudah runtut atau ada langkah yang terbalik',
    ],
    tipsPenyusunan:
      'Gunakan dasar bukti yang objektif di dalam teks agar siswa tidak terjebak dalam spekulasi liar.',
  },
  'SD-E03': {
    kode: 'SD-E03',
    kompetensiId: 'evaluasi_apresiasi',
    kompetensiNama: 'Evaluasi dan Apresiasi',
    nama: 'Menyimpulkan respons emosional dan suasana terhadap unsur teks fiksi',
    definisi:
      'Mengidentifikasi perasaan tokoh (senang, cemas, haru, bangga), suasana cerita (menegangkan, damai, riang), serta dampak emosional alur cerita terhadap pembaca.',
    cakupanSoal: [
      'Menyimpulkan perasaan tokoh pada peristiwa tertentu',
      'Menentukan suasana (mood) cerita pada babak tertentu',
      'Mengidentifikasi bagian kalimat yang membangkitkan rasa haru atau bangga',
      'Menilai respons emosional pembaca setelah membaca akhir cerita',
      'Menjelaskan alasan perubahan perasaan tokoh berdasarkan dialog atau gerak-gerik',
    ],
    contohKonteks: [
      'Perasaan gembira anak saat melihat bibit pohon yang dirawatnya mulai berbuah',
      'Suasana haru ketika dua sahabat yang sempat berselisih saling memaafkan',
      'Ketegangan saat seekor kancil berusaha lolos dari kepungan pemburu',
    ],
    tipsPenyusunan:
      'Gunakan kata-kata emosi yang jelas (haru, gembira, cemas, lega, bangga) dan sertakan petunjuk bahasa tubuh tokoh dalam bukti tekstual.',
  },
};

export interface StandarKelas {
  kelas: KelasSD;
  panjangKataMin: number;
  panjangKataMax: number;
  kompleksitasBahasa: string;
  karakteristikBacaan: string;
  contohTopik: string[];
}

export const STANDAR_KELAS_SD: Record<KelasSD, StandarKelas> = {
  4: {
    kelas: 4,
    panjangKataMin: 120,
    panjangKataMax: 220,
    kompleksitasBahasa:
      'Kosakata familiar dan konkret, struktur kalimat tunggal dan majemuk setara sederhana, ungkapan umum sehari-hari.',
    karakteristikBacaan:
      'Cerita fabel, persahabatan di sekolah, hewan peliharaan, teks deskripsi tempat dan benda di sekitar.',
    contohTopik: [
      'Sahabat di Taman Sekolah',
      'Kucing Kesayangan Dio',
      'Mengenal Lebah Madu yang Rajin',
      'Piknik Keluarga ke Pantai',
      'Menjaga Kebersihan Kelas',
    ],
  },
  5: {
    kelas: 5,
    panjangKataMin: 180,
    panjangKataMax: 300,
    kompleksitasBahasa:
      'Kosakata mulai memuat istilah lingkungan dan sains sederhana, kalimat majemuk bertingkat dengan kata penghubung sebab-akibat.',
    karakteristikBacaan:
      'Cerita realistis anak, teks eksplanasi sederhana fenomena alam, laporan pengamatan sains, budaya daerah.',
    contohTopik: [
      'Rahasia Sungai Citarum yang Kembali Jernih',
      'Petualangan Wayang Kulit di Desa Karang',
      'Mengapa Daun Berubah Warna?',
      'Kantin Sehat Bebas Plastik',
      'Semangat Gotong Royong Panen Padi',
    ],
  },
  6: {
    kelas: 6,
    panjangKataMin: 250,
    panjangKataMax: 400,
    kompleksitasBahasa:
      'Kosakata bidang teknis & keilmuan sederhana, hubungan antarkalimat lebih padat, penalaran kritis, wacana multimodal/tabel.',
    karakteristikBacaan:
      'Artikel populer sejarah/sains, biografi tokoh inspiratif cilik, masalah lingkungan global, teks prosedur kompleks, poster informatif.',
    contohTopik: [
      'Inovasi Sepeda Bambu Ramah Lingkungan',
      'Biografi Tokoh: B.J. Habibie dan Cinta Dirgantara',
      'Konservasi Badak Jawa di Ujung Kulon',
      'Pengaruh Sampah Elektronik dan Solusinya',
      'Menelaah Fakta Nutrisi Susu Kedelai',
    ],
  },
};
