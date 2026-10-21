import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Session } from "../types";
import { formatPercent, formatSeconds, summariseSessions, toCsv } from "../lib/metrics";
import { downloadText } from "../lib/storage";

interface Props {
  demo: Session[];
  local: Session[];
}

function susHistogram(scores: number[]): { band: string; jumlah: number }[] {
  const bands = ["0–20", "21–40", "41–60", "61–80", "81–100"];
  const counts = new Array(5).fill(0);
  for (const score of scores) {
    const index = Math.min(4, Math.max(0, Math.floor(score / 20)));
    counts[index] += 1;
  }
  return bands.map((band, index) => ({ band, jumlah: counts[index] }));
}

export function AnalysisPage({ demo, local }: Props) {
  const [mode, setMode] = useState<"demo" | "local">(local.length > 0 ? "local" : "demo");
  const sessions = mode === "demo" ? demo : local;
  const summary = useMemo(
    () => (sessions.length > 0 ? summariseSessions(sessions) : null),
    [sessions],
  );

  return (
    <div className="analysis-page">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Analisis deskriptif</p>
          <h1>Hasil studi usability</h1>
          <p className="muted">
            Ringkasan metrik tugas, SUS, UMUX-Lite, dan SEQ. Tidak ada uji signifikansi otomatis.
          </p>
        </div>
        <div className="segmented" role="group" aria-label="Sumber data analisis">
          <button
            type="button"
            className={mode === "demo" ? "active" : ""}
            aria-pressed={mode === "demo"}
            onClick={() => setMode("demo")}
          >
            DEMO sintetis
          </button>
          <button
            type="button"
            className={mode === "local" ? "active" : ""}
            aria-pressed={mode === "local"}
            onClick={() => setMode("local")}
          >
            Sesi lokal ({local.length})
          </button>
        </div>
      </section>

      {mode === "demo" && (
        <div className="synthetic-banner" role="status">
          <strong>DATA SINTETIS.</strong> {demo.length} sesi ini dihasilkan oleh
          <code> scripts/generate-demo-sessions.ts</code>, bukan partisipan nyata. Angka di bawah
          hanya menguji pipeline analisis dan tidak boleh dilaporkan sebagai temuan usability.
        </div>
      )}

      {!summary ? (
        <section className="panel">
          <h2>Belum ada sesi lokal</h2>
          <p>
            Selesaikan satu sesi melalui halaman <b>Studi tugas</b>, lalu kembali ke sini untuk
            melihat ringkasan. Data hanya tersimpan di localStorage browser.
          </p>
        </section>
      ) : (
        <>
          <section className="kpi-grid" aria-label="Ringkasan studi">
            <article className="kpi">
              <span className="kpi-label">Sesi</span>
              <strong>{summary.n}</strong>
              <small>{summary.synthetic ? "sintetis" : "lokal"}</small>
            </article>
            <article className="kpi kpi-teal">
              <span className="kpi-label">Penyelesaian tugas</span>
              <strong>{formatPercent(summary.completionRate)}</strong>
              <small>{formatPercent(summary.participantCompletionRate)} peserta tuntas semua</small>
            </article>
            <article className="kpi kpi-blue">
              <span className="kpi-label">SUS</span>
              <strong>{summary.sus.mean.toFixed(1)}</strong>
              <small>
                95% CI {summary.sus.ci95[0].toFixed(1)}–{summary.sus.ci95[1].toFixed(1)}
              </small>
            </article>
            <article className="kpi kpi-amber">
              <span className="kpi-label">UMUX-Lite</span>
              <strong>{summary.umux.mean.toFixed(1)}</strong>
              <small>
                95% CI {summary.umux.ci95[0].toFixed(1)}–{summary.umux.ci95[1].toFixed(1)}
              </small>
            </article>
          </section>

          <div className="dashboard-grid">
            <section className="panel" aria-labelledby="task-completion-heading">
              <div className="panel-heading">
                <div>
                  <h2 id="task-completion-heading">Penyelesaian per tugas</h2>
                  <p className="muted small">Persentase sesi dengan tugas berhasil.</p>
                </div>
              </div>
              <div className="chart-frame">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={summary.tasks.map((task) => ({
                      name: task.title,
                      completion: Math.round(task.completionRate * 100),
                    }))}
                    layout="vertical"
                    margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid stroke="#26364d" strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" stroke="#8fa3bf" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={170}
                      stroke="#8fa3bf"
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0f1a2a",
                        border: "1px solid #334155",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="completion" name="Penyelesaian (%)" fill="#2dd4bf" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="panel" aria-labelledby="sus-heading">
              <div className="panel-heading">
                <div>
                  <h2 id="sus-heading">Distribusi skor SUS</h2>
                  <p className="muted small">Median {summary.sus.median.toFixed(1)} · SD {summary.sus.sd.toFixed(1)}</p>
                </div>
              </div>
              <div className="chart-frame">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={susHistogram(summary.sus.scores)} margin={{ top: 8, right: 16, left: -16, bottom: 4 }}>
                    <CartesianGrid stroke="#26364d" strokeDasharray="3 3" />
                    <XAxis dataKey="band" stroke="#8fa3bf" />
                    <YAxis allowDecimals={false} stroke="#8fa3bf" />
                    <Tooltip
                      contentStyle={{
                        background: "#0f1a2a",
                        border: "1px solid #334155",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="jumlah" name="Peserta" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <section className="panel" aria-labelledby="task-table-heading">
            <div className="panel-heading">
              <div>
                <h2 id="task-table-heading">Rincian tugas</h2>
                <p className="muted small">
                  Rata-rata percobaan {summary.meanAttempts.toFixed(2)} · error rate{" "}
                  {formatPercent(summary.errorRate)} · SEQ {summary.seqMean.toFixed(1)}
                </p>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() =>
                  downloadText(
                    mode === "demo" ? "synthetic-sessions.csv" : "local-sessions.csv",
                    `${toCsv(sessions)}\n`,
                    "text/csv",
                  )
                }
              >
                Unduh CSV
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tugas</th>
                    <th>n</th>
                    <th>Berhasil</th>
                    <th>95% CI</th>
                    <th>Median waktu</th>
                    <th>Percobaan</th>
                    <th>SEQ</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.tasks.map((task) => (
                    <tr key={task.taskId}>
                      <td>{task.title}</td>
                      <td>{task.n}</td>
                      <td>{formatPercent(task.completionRate)}</td>
                      <td>
                        {formatPercent(task.completionCI[0])}–{formatPercent(task.completionCI[1])}
                      </td>
                      <td>{formatSeconds(task.medianDurationMs)}</td>
                      <td>{task.meanAttempts.toFixed(2)}</td>
                      <td>{task.meanSeq.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>Komposisi peran dan catatan</h2>
            <div className="role-chips">
              {summary.roles.map((role) => (
                <span className="role-chip" key={role.role}>
                  {role.role} · {role.n}
                </span>
              ))}
            </div>
            <p className="small muted">
              {summary.comments} sesi memiliki komentar terbuka. Komentar tidak dianalisis secara
              tematik otomatis; analisis kualitatif harus dilakukan manual dengan kode dan
              persetujuan peneliti kedua.
            </p>
          </section>
        </>
      )}

      <section className="panel caveat">
        <h2>Batasan interpretasi</h2>
        <ul>
          <li>Interval kepercayaan memakai aproksimasi normal/Wilson dan mengasumsikan observasi independen.</li>
          <li>Tidak ada uji hipotesis, koreksi multiple comparisons, atau model campuran.</li>
          <li>Data DEMO sintetis tidak memiliki variasi manusia nyata; hanya untuk uji perangkat lunak.</li>
          <li>Satu sesi lokal bukan sampel penelitian. Jangan menarik kesimpulan populasi.</li>
          <li>SEQ, SUS, dan UMUX-Lite mengukur persepsi, bukan keselamatan atau kinerja operasional.</li>
        </ul>
      </section>
    </div>
  );
}
