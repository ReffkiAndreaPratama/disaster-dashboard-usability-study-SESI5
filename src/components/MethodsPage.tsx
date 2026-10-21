interface Props {
  onNavigate: (page: "dashboard" | "study") => void;
}

export function MethodsPage({ onNavigate }: Props) {
  return (
    <div className="methods-page">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Protokol penelitian</p>
          <h1>Metode studi usability</h1>
          <p className="muted">
            Studi formatif mixed-methods untuk dashboard situasi bencana. Protokol lengkap tersedia
            di <code>docs/study-protocol.md</code>.
          </p>
        </div>
      </section>

      <div className="method-grid">
        <section className="panel">
          <h2>Pertanyaan penelitian</h2>
          <ol>
            <li>
              Seberapa tinggi tingkat penyelesaian empat tugas inti pada prototipe dashboard?
            </li>
            <li>
              Hambatan apa yang muncul ketika peserta memprioritaskan peringatan, mencari shelter,
              menyaring informasi, dan menindaklanjuti peringatan?
            </li>
            <li>
              Bagaimana persepsi kegunaan diukur dengan SUS dan UMUX-Lite, dan bagaimana kaitannya
              dengan komentar kualitatif?
            </li>
            <li>
              Apakah perbedaan waktu dan percobaan antar tugas menunjukkan area desain yang perlu
              diiterasi?
            </li>
          </ol>
          <p className="small muted">
            Hipotesis diarahkan eksploratif: tugas pencarian shelter dan tindak lanjut peringatan
            diperkirakan lebih lambat karena informasi tersebar di beberapa panel.
          </p>
        </section>

        <section className="panel">
          <h2>Desain</h2>
          <ul>
            <li>Within-subject, satu kondisi prototipe, urutan tugas tetap.</li>
            <li>Sesi individu ±25–35 menit, dijalankan dengan moderator dan think-aloud.</li>
            <li>Tugas dinilai berhasil jika kondisi target terpenuhi, bukan berdasarkan self-report.</li>
            <li>Waktu dihitung dari tombol “Mulai tugas” hingga target terpenuhi.</li>
            <li>Setiap percobaan gagal dicatat; peserta boleh mencoba lagi.</li>
          </ul>
        </section>

        <section className="panel">
          <h2>Tugas</h2>
          <table>
            <thead>
              <tr>
                <th>Tugas</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Prioritaskan peringatan</td>
                <td>Membuka peringatan level Awas di Kota Bengkulu</td>
              </tr>
              <tr>
                <td>Temukan shelter</td>
                <td>Membuka shelter terbuka terdekat (1,8 km)</td>
              </tr>
              <tr>
                <td>Saring banjir</td>
                <td>Filter kategori Banjir aktif</td>
              </tr>
              <tr>
                <td>Tindak lanjuti</td>
                <td>Menandai peringatan longsor Selebar sebagai ditangani</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h2>Instrumen dan metrik</h2>
          <ul>
            <li>Completion rate per tugas dengan Wilson 95% CI.</li>
            <li>Median waktu tugas dan rata-rata jumlah percobaan.</li>
            <li>Single Ease Question (SEQ, 1–7) setelah setiap tugas dan di akhir sesi.</li>
            <li>System Usability Scale (10 item, skor 0–100).</li>
            <li>UMUX-Lite (2 item, skor 0–100).</li>
            <li>Komentar terbuka dan catatan moderator untuk analisis tematik.</li>
          </ul>
          <p className="small muted">
            Terjemahan bahasa Indonesia untuk SUS/UMUX-Lite belum divalidasi secara psikometrik
            dalam proyek ini. Hal ini harus dilaporkan sebagai keterbatasan.
          </p>
        </section>

        <section className="panel">
          <h2>Rencana analisis</h2>
          <ul>
            <li>Statistik deskriptif dan interval kepercayaan; tidak ada uji signifikansi otomatis.</li>
            <li>Perbandingan tugas secara deskriptif, bukan uji hipotesis eksploratif tanpa koreksi.</li>
            <li>Analisis tematik komentar oleh dua pengkode, dengan diskusi perbedaan kode.</li>
            <li>Semua keputusan pra-analisis dicatat sebelum data dikumpulkan.</li>
            <li>Data mentah dianonimkan; kode peserta tidak dipetakan ke identitas di repositori.</li>
          </ul>
        </section>

        <section className="panel">
          <h2>Rekrutmen dan etika</h2>
          <ul>
            <li>
              Peserta: orang dewasa yang terlibat atau tertarik pada respons bencana (operator,
              relawan, analis, koordinator). Tidak harus ahli GIS.
            </li>
            <li>
              Target formatif 12–20 peserta; jumlah akhir dilaporkan apa adanya, bukan sebagai
              estimasi presisi populasi.
            </li>
            <li>Persetujuan tertulis/lisan, hak berhenti, dan larangan memasukkan data pribadi.</li>
            <li>Data sesi prototipe ini disimpan lokal di browser dan tidak dikirim ke server.</li>
            <li>Studi nyata memerlukan persetujuan etik institusi sebelum rekrutmen.</li>
          </ul>
        </section>
      </div>

      <section className="panel">
        <h2>Kejujuran data</h2>
        <p>
          Repositori ini <b>tidak</b> melaporkan hasil partisipan nyata. Dashboard analisis memakai
          24 sesi sintetis yang dihasilkan secara deterministik untuk menguji perhitungan, tampilan,
          dan ekspor. Angka sintetis tidak boleh dikutip sebagai temuan kegunaan, perbandingan dengan
          sistem lain, atau bukti dampak operasional.
        </p>
        <p className="small muted">
          Protokol lengkap, termasuk skrip moderator dan lembar informasi, ada di{" "}
          <code>docs/study-protocol.md</code>.
        </p>
        <div className="button-row">
          <button type="button" className="primary-button" onClick={() => onNavigate("study")}>
            Coba prototipe
          </button>
          <button type="button" className="ghost-button" onClick={() => onNavigate("dashboard")}>
            Buka dashboard
          </button>
        </div>
      </section>
    </div>
  );
}
