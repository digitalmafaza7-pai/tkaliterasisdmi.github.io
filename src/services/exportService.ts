import { ButirKisiKisi, ButirSoal, HasilPengerjaan, PaketLatihan, StimulusBacaan } from '../types/assessment';

export const exportService = {
  // Helper to trigger browser download
  downloadFile(content: string, fileName: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // 1. Ekspor JSON (Paket / Soal / Kisi-kisi)
  exportJSON(data: any, fileName: string) {
    const jsonStr = JSON.stringify(data, null, 2);
    this.downloadFile(jsonStr, `${fileName}.json`, 'application/json');
  },

  // 2. Ekspor Kisi-Kisi CSV (Excel compatible)
  exportKisiKisiCSV(kisiKisi: ButirKisiKisi[], paketJudul: string) {
    const headers = [
      'No',
      'Kelas',
      'Kompetensi',
      'Kode Indikator',
      'Indikator Asesmen',
      'Jenis Teks',
      'Topik',
      'Tingkat Kesulitan',
      'Bentuk Soal',
      'ID Stimulus',
      'Bobot',
    ];

    const rows = kisiKisi.map((k) => [
      k.nomor,
      `Kelas ${k.kelas}`,
      `"${k.kompetensiNama.replace(/"/g, '""')}"`,
      `"${k.indikatorKode}"`,
      `"${k.indikatorNama.replace(/"/g, '""')}"`,
      `"${k.jenisTeks}"`,
      `"${k.topik.replace(/"/g, '""')}"`,
      `"${k.tingkatKesulitan}"`,
      `"${k.bentukSoal}"`,
      `"${k.stimulusId}"`,
      k.bobot,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadFile(csvContent, `Kisi-Kisi_${paketJudul.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
  },

  // 3. Ekspor Naskah Soal Siswa (Word .doc HTML format)
  exportNaskahSiswaWord(paket: PaketLatihan) {
    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${paket.judul}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 2cm; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 20px; }
          .header h2 { margin: 0; font-size: 14pt; }
          .header h3 { margin: 4px 0; font-size: 12pt; font-weight: normal; }
          .info-box { border: 1px solid #999; padding: 10px; margin-bottom: 20px; }
          .stimulus-card { background: #f9f9f9; border-left: 4px solid #2563eb; padding: 12px; margin: 15px 0; }
          .question-item { margin-bottom: 18px; }
          .options { margin-left: 20px; }
          .options div { margin-bottom: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>TKA LITERASI MEMBACA BAHASA INDONESIA SD/MI</h2>
          <h3>NASKAH SOAL ASESMEN SISWA</h3>
          <p><strong>${paket.judul}</strong></p>
        </div>

        <div class="info-box">
          <table style="width: 100%;">
            <tr><td style="width: 20%;">Nama Siswa</td><td>: ....................................................</td></tr>
            <tr><td>Kelas</td><td>: Kelas ${paket.kelas} SD/MI</td></tr>
            <tr><td>Waktu Pengerjaan</td><td>: ${paket.durasiMenit} Menit</td></tr>
            <tr><td>Petunjuk</td><td>: Bacalah setiap stimulus bacaan dengan seksama, lalu pilihlah atau jawablah pertanyaan dengan tepat!</td></tr>
          </table>
        </div>
    `;

    // Render stimuli & questions
    paket.stimulusList.forEach((stim, sIdx) => {
      html += `
        <div class="stimulus-card">
          <h4>BACALAH TEKS BERIKUT UNTUK MENJAWAB SOAL NOMOR TERKAIT!</h4>
          <h3 style="text-align: center; text-decoration: underline;">${stim.judul}</h3>
          <p style="text-align: justify; white-space: pre-line;">${stim.isi}</p>
          <p style="font-size: 10pt; color: #555; text-align: right;"><em>Sumber: ${stim.sumber} (${stim.jumlahKata} kata)</em></p>
        </div>
      `;

      const questions = paket.soalList.filter((q) => q.stimulusId === stim.id);
      questions.forEach((q, qIdx) => {
        const no = qIdx + 1;
        html += `
          <div class="question-item">
            <p><strong>${no}. ${q.pertanyaan}</strong></p>
        `;

        if (q.pilihan && q.pilihan.length > 0) {
          html += `<div class="options">`;
          q.pilihan.forEach((p) => {
            html += `<div><strong>${p.kode}.</strong> ${p.teks}</div>`;
          });
          html += `</div>`;
        } else if (q.bentukSoal === 'uraian_singkat') {
          html += `
            <div style="border: 1px dashed #777; height: 100px; padding: 5px; margin-top: 5px; color: #aaa;">
              <em>Lembar Jawaban Uraian:</em>
            </div>
          `;
        }

        html += `</div>`;
      });
    });

    html += `
        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px;">
          <p><em>--- Selamat Mengerjakan, Junjung Tinggi Kejujuran! ---</em></p>
        </div>
      </body>
      </html>
    `;

    this.downloadFile(html, `Naskah_Soal_${paket.judul.replace(/\s+/g, '_')}.doc`, 'application/msword');
  },

  // 4. Ekspor Kunci Jawaban & Pembahasan Guru (Word)
  exportKunciPembahasanWord(paket: PaketLatihan) {
    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Kunci & Pembahasan - ${paket.judul}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; margin: 2cm; }
          .header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 8px; margin-bottom: 20px; color: #047857; }
          .soal-card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 20px; background: #fafafa; }
          .badge { display: inline-block; padding: 3px 8px; background: #e0f2fe; color: #0369a1; font-size: 9pt; border-radius: 4px; font-weight: bold; margin-right: 5px; }
          .kunci-box { background: #dcfce7; border-left: 4px solid #16a34a; padding: 10px; margin: 10px 0; color: #166534; }
          .bukti-box { background: #fef3c7; border-left: 4px solid #d97706; padding: 10px; margin: 10px 0; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>PEDOMAN KUNCI JAWABAN & PEMBAHASAN GURU</h2>
          <h3>TKA LITERASI MEMBACA SD/MI</h3>
          <p><strong>${paket.judul} (Kelas ${paket.kelas})</strong></p>
        </div>
    `;

    paket.soalList.forEach((q, idx) => {
      html += `
        <div class="soal-card">
          <div>
            <span class="badge">Nomor ${idx + 1}</span>
            <span class="badge">${q.kompetensiNama}</span>
            <span class="badge">${q.indikatorKode}</span>
            <span class="badge">Kesulitan: ${q.tingkatKesulitan}</span>
          </div>
          <p><strong>Pertanyaan:</strong> ${q.pertanyaan}</p>
      `;

      if (q.pilihan && q.pilihan.length > 0) {
        html += `<ul>`;
        q.pilihan.forEach((p) => {
          const isKey = p.kode === q.kunciJawaban || (Array.isArray(q.kunciJawaban) && q.kunciJawaban.includes(p.kode));
          html += `<li><strong>${p.kode}.</strong> ${p.teks} ${isKey ? '<em>(KUNCI JAWABAN BENAR)</em>' : ''}</li>`;
        });
        html += `</ul>`;
      }

      html += `
        <div class="kunci-box">
          <strong>KUNCI JAWABAN:</strong> ${Array.isArray(q.kunciJawaban) ? q.kunciJawaban.join(', ') : q.kunciJawaban}
          <br>
          <strong>Alasan Kunci Benar:</strong> ${q.alasanJawabanBenar}
        </div>

        <div class="bukti-box">
          <strong>BUKTI TEKSTUAL DALAM STIMULUS:</strong><br>
          <em>"${q.buktiTekstual}"</em>
        </div>

        <div>
          <strong>PEMBAHASAN LENGKAP:</strong><br>
          <p>${q.pembahasan}</p>
        </div>
      `;

      if (q.rubrikUraian) {
        html += `
          <div style="background: #f1f5f9; padding: 10px; margin-top: 10px;">
            <strong>RUBRIK PENILAIAN URAIAN (Skor Maksimal: ${q.rubrikUraian.skorMaksimal}):</strong>
            <ul>
        `;
        q.rubrikUraian.kriteria.forEach((k) => {
          html += `<li><strong>Skor ${k.skor}:</strong> ${k.deskripsi}</li>`;
        });
        html += `</ul></div>`;
      }

      html += `</div>`;
    });

    html += `</body></html>`;
    this.downloadFile(html, `Kunci_Pembahasan_${paket.judul.replace(/\s+/g, '_')}.doc`, 'application/msword');
  },

  // 5. Ekspor Rekap Hasil Siswa CSV
  exportHasilCSV(hasilList: HasilPengerjaan[]) {
    const headers = [
      'ID Hasil',
      'Nama Siswa',
      'Kelas',
      'Paket Ujian',
      'Nilai Akhir',
      'Benar',
      'Salah',
      'Kosong',
      'Total Soal',
      'Durasi (Menit)',
      'Waktu Selesai',
    ];

    const rows = hasilList.map((h) => [
      `"${h.id}"`,
      `"${h.namaPeserta.replace(/"/g, '""')}"`,
      `"Kelas ${h.kelas}"`,
      `"${h.paketJudul.replace(/"/g, '""')}"`,
      h.nilaiAkhir,
      h.jawabanBenar,
      h.jawabanSalah,
      h.jawabanKosong,
      h.totalSoal,
      Math.round(h.durasiPengerjaanDetik / 60),
      `"${new Date(h.waktuSelesai).toLocaleString('id-ID')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadFile(csvContent, `Rekapitulasi_Hasil_TKA_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  },
};
