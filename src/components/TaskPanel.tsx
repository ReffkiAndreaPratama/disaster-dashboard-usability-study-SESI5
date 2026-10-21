import { useState } from "react";
import type { DashboardSnapshot, Page } from "../types";
import { TASKS, TASK_BY_ID, taskCondition } from "../data/study";
import type { StudyController } from "../lib/useStudy";

interface Props {
  study: StudyController;
  snapshot: DashboardSnapshot;
  onNavigate: (page: Page) => void;
}

export function TaskPanel({ study, snapshot, onNavigate }: Props) {
  const [code, setCode] = useState("");
  const [role, setRole] = useState("Operator BPBD");
  const [consent, setConsent] = useState(false);
  const [seq, setSeq] = useState(5);
  const [overallSeq, setOverallSeq] = useState(5);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { draft } = study;

  if (!draft) {
    return (
      <section className="panel task-panel" aria-labelledby="briefing-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Mode studi</p>
            <h2 id="briefing-heading">Briefing peserta</h2>
          </div>
          <span className="tag tag-study">4 tugas</span>
        </div>
        <p className="small">
          Anda akan menyelesaikan empat tugas pada dashboard simulasi. Waktu dan jumlah percobaan
          dicatat secara lokal di browser. Jangan memasukkan nama atau data pribadi.
        </p>
        <form
          className="stack-form"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            if (!consent) {
              setError("Persetujuan diperlukan sebelum memulai.");
              return;
            }
            try {
              study.start(code, role);
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Gagal memulai sesi");
            }
          }}
        >
          <label>
            Kode peserta
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="mis. P-01"
              maxLength={24}
              required
            />
          </label>
          <label>
            Peran
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option>Operator BPBD</option>
              <option>Relawan</option>
              <option>Analis GIS</option>
              <option>Koordinator lapangan</option>
              <option>Lainnya</option>
            </select>
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>
              Saya memahami bahwa ini adalah simulasi, data disimpan hanya di browser, dan saya dapat
              berhenti kapan saja.
            </span>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="primary-button" disabled={!code.trim()}>
            Mulai sesi studi
          </button>
        </form>
      </section>
    );
  }

  if (draft.stage === "done") {
    return (
      <section className="panel task-panel">
        <h2>Sesi selesai</h2>
        <p className="small">
          Terima kasih. Sesi lokal tersimpan di browser ini dan dapat diunduh dari halaman Analisis.
        </p>
        <button type="button" className="primary-button" onClick={() => onNavigate("analysis")}>
          Buka analisis
        </button>
        <button type="button" className="ghost-button" onClick={study.reset}>
          Mulai sesi baru
        </button>
      </section>
    );
  }

  if (draft.stage === "seq") {
    return (
      <section className="panel task-panel">
        <p className="eyebrow">Semua tugas selesai</p>
        <h2>Penilaian akhir</h2>
        <p className="small">
          Secara keseluruhan, seberapa mudah rangkaian tugas ini? (1 = sangat sulit, 7 = sangat mudah)
        </p>
        <div className="scale" role="radiogroup" aria-label="SEQ keseluruhan">
          {[1, 2, 3, 4, 5, 6, 7].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={overallSeq === value}
              className={overallSeq === value ? "scale-button active" : "scale-button"}
              onClick={() => setOverallSeq(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            study.saveSeq(overallSeq);
            onNavigate("questionnaire");
          }}
        >
          Lanjut ke kuesioner
        </button>
      </section>
    );
  }

  const task = TASKS[draft.currentTaskIndex];
  if (!task) return null;
  const attempts = draft.attempts[task.id] ?? 0;
  const started = draft.startedTaskAt !== null;

  return (
    <section className="panel task-panel" aria-labelledby="task-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">
            Tugas {draft.currentTaskIndex + 1} dari {TASKS.length}
          </p>
          <h2 id="task-heading">{task.title}</h2>
        </div>
        <span className="tag tag-study">{draft.participantCode}</span>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${(draft.currentTaskIndex / TASKS.length) * 100}%` }} />
      </div>
      <p className="task-instruction">{task.instruction}</p>
      <details className="hint">
        <summary>Petunjuk</summary>
        <p>{task.successHint}</p>
      </details>

      <div className="seq-block">
        <span className="field-label">Setelah mencoba, nilai kemudahan tugas (SEQ)</span>
        <div className="scale" role="radiogroup" aria-label="SEQ tugas">
          {[1, 2, 3, 4, 5, 6, 7].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={seq === value}
              aria-label={`Nilai ${value}`}
              className={seq === value ? "scale-button active" : "scale-button"}
              onClick={() => setSeq(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <small className="muted">1 = sangat sulit · 7 = sangat mudah</small>
      </div>

      <div className="task-actions">
        <button type="button" className="ghost-button" onClick={study.startTask} disabled={started}>
          {started ? "Waktu berjalan…" : "Mulai tugas"}
        </button>
        <button
          type="button"
          className="primary-button"
          disabled={!started}
          onClick={() => {
            setMessage(null);
            const success = taskCondition(task.id, snapshot);
            study.checkTask(success, seq);
            setMessage(
              success
                ? "Tugas selesai. Lanjut ke tugas berikutnya."
                : "Target belum tercapai. Periksa kembali dashboard, lalu coba lagi.",
            );
          }}
        >
          Periksa &amp; selesaikan
        </button>
      </div>
      {attempts > 0 && (
        <p className="small muted">
          Percobaan untuk tugas ini: <strong>{attempts}</strong>
        </p>
      )}
      {message && (
        <p className={message.startsWith("Tugas selesai") ? "form-success" : "form-error"}>
          {message}
        </p>
      )}
      <button
        type="button"
        className="text-button"
        onClick={() => {
          if (window.confirm("Batalkan sesi studi ini? Data yang belum dikirim akan hilang.")) {
            study.reset();
          }
        }}
      >
        Batalkan sesi
      </button>
      <p className="small muted">
        Target saat ini: {TASK_BY_ID[task.id].target}. Jangan menyegarkan halaman saat sesi berjalan.
      </p>
    </section>
  );
}
