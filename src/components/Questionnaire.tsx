import { useState } from "react";
import { susScore, umuxLiteScore } from "../lib/metrics";
import type { StudyController } from "../lib/useStudy";
import { downloadText } from "../lib/storage";

const SUS_ITEMS = [
  "Saya ingin sering menggunakan dashboard ini.",
  "Saya merasa dashboard ini terlalu rumit.",
  "Saya merasa dashboard ini mudah digunakan.",
  "Saya membutuhkan bantuan teknis untuk dapat menggunakan dashboard ini.",
  "Saya merasa berbagai fungsi dalam dashboard ini terintegrasi dengan baik.",
  "Saya merasa terlalu banyak ketidakkonsistenan dalam dashboard ini.",
  "Saya membayangkan sebagian besar orang akan cepat belajar menggunakan dashboard ini.",
  "Saya merasa dashboard ini sangat canggung untuk digunakan.",
  "Saya merasa percaya diri saat menggunakan dashboard ini.",
  "Saya perlu belajar banyak hal sebelum bisa mulai menggunakan dashboard ini.",
];

const UMUX_ITEMS = [
  "Kemampuan dashboard ini memenuhi kebutuhan saya.",
  "Dashboard ini mudah digunakan.",
];

interface Props {
  study: StudyController;
}

export function Questionnaire({ study }: Props) {
  const [sus, setSus] = useState<number[]>(Array(10).fill(0));
  const [umux, setUmux] = useState<[number, number]>([0, 0]);
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (study.submitted) {
    const score = susScore(study.submitted.sus);
    const ux = umuxLiteScore(study.submitted.umux);
    return (
      <div className="narrow-page">
        <section className="panel">
          <p className="eyebrow">Kuesioner terkirim</p>
          <h1>Terima kasih</h1>
          <p>
            Respons tersimpan hanya di browser ini. Tidak ada data yang dikirim ke server.
          </p>
          <div className="result-grid">
            <article className="kpi kpi-blue">
              <span className="kpi-label">Skor SUS</span>
              <strong>{score.toFixed(1)}</strong>
              <small>skala 0–100</small>
            </article>
            <article className="kpi kpi-teal">
              <span className="kpi-label">UMUX-Lite</span>
              <strong>{ux.toFixed(1)}</strong>
              <small>skala 0–100</small>
            </article>
          </div>
          <p className="small muted">
            Skor ini adalah skor satu peserta, bukan temuan agregat. Jangan menafsirkan tanpa data
            peserta lain dan analisis pra-registrasi.
          </p>
          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              downloadText(
                `${study.submitted?.participantCode ?? "session"}.json`,
                JSON.stringify(study.submitted, null, 2),
              )
            }
          >
            Unduh sesi JSON
          </button>
        </section>
      </div>
    );
  }

  if (!study.draft || study.draft.stage !== "seq" || study.draft.seq === null) {
    return (
      <div className="narrow-page">
        <section className="panel">
          <h1>Kuesioner</h1>
          <p>Kuesioner tersedia setelah seluruh tugas dan penilaian SEQ selesai.</p>
          <p className="small muted">
            Buka halaman <b>Studi tugas</b> untuk memulai atau melanjutkan sesi.
          </p>
        </section>
      </div>
    );
  }

  const complete = sus.every((value) => value > 0) && umux.every((value) => value > 0);

  return (
    <div className="narrow-page questionnaire">
      <section className="panel">
        <p className="eyebrow">Bagian akhir</p>
        <h1>Kuesioner pengalaman pengguna</h1>
        <p className="small muted">
          Instrumen: System Usability Scale (10 item) dan UMUX-Lite (2 item). Terjemahan bahasa
          Indonesia belum diuji validitas psikometriknya; laporkan hal ini bersama hasil.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            if (!complete) {
              setError("Lengkapi semua item sebelum mengirim.");
              return;
            }
            try {
              study.submitSurvey(sus, umux, comments);
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Gagal mengirim kuesioner");
            }
          }}
        >
          <fieldset className="survey-block">
            <legend>System Usability Scale</legend>
            <p className="small muted">1 = sangat tidak setuju · 5 = sangat setuju</p>
            {SUS_ITEMS.map((item, index) => (
              <div className="survey-row" key={item}>
                <span>
                  {index + 1}. {item}
                </span>
                <div className="likert" role="radiogroup" aria-label={`SUS item ${index + 1}`}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name={`sus-${index}`}
                        value={value}
                        checked={sus[index] === value}
                        onChange={() =>
                          setSus((current) =>
                            current.map((existing, itemIndex) =>
                              itemIndex === index ? value : existing,
                            ),
                          )
                        }
                      />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </fieldset>

          <fieldset className="survey-block">
            <legend>UMUX-Lite</legend>
            <p className="small muted">1 = sangat tidak setuju · 7 = sangat setuju</p>
            {UMUX_ITEMS.map((item, index) => (
              <div className="survey-row" key={item}>
                <span>{item}</span>
                <div className="likert" role="radiogroup" aria-label={`UMUX item ${index + 1}`}>
                  {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name={`umux-${index}`}
                        value={value}
                        checked={umux[index] === value}
                        onChange={() =>
                          setUmux((current) => {
                            const next: [number, number] = [...current];
                            next[index] = value;
                            return next;
                          })
                        }
                      />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </fieldset>

          <label className="stack-label">
            Komentar terbuka (opsional)
            <textarea
              rows={4}
              value={comments}
              maxLength={2000}
              onChange={(event) => setComments(event.target.value)}
              placeholder="Apa yang membantu atau menghambat Anda?"
            />
          </label>

          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="primary-button" disabled={!complete}>
            Kirim kuesioner
          </button>
          <p className="small muted">
            Dengan mengirim, Anda menyetujui penyimpanan respons anonim di localStorage browser ini.
          </p>
        </form>
      </section>
    </div>
  );
}
