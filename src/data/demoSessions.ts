import type { Session, TaskId } from "../types";
import { TASKS } from "./study";

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random: () => number): number {
  const u = Math.max(random(), Number.EPSILON);
  const v = Math.max(random(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(value: number, lower: number, upper: number): number {
  return Math.min(upper, Math.max(lower, value));
}

const ROLES = ["Operator BPBD", "Relawan", "Analis GIS", "Koordinator lapangan"];
const COMMENTS = [
  "Peta membantu, tetapi legenda tingkat bahaya bisa lebih jelas.",
  "Tombol filter mudah ditemukan; detail shelter agak jauh di bawah.",
  "Saya butuh waktu untuk memahami warna peringatan.",
  "Alur tugas terasa masuk akal untuk situasi simulasi.",
  "Ringkasan angka membantu, namun grafik perlu satuan yang lebih eksplisit.",
  "Kontras teks kecil di panel kanan kurang nyaman.",
];

const BASE_SECONDS: Record<TaskId, number> = {
  "highest-alert": 38,
  "nearest-shelter": 52,
  "flood-filter": 31,
  "acknowledge-alert": 44,
};

const BASE_SUCCESS: Record<TaskId, number> = {
  "highest-alert": 0.86,
  "nearest-shelter": 0.76,
  "flood-filter": 0.82,
  "acknowledge-alert": 0.73,
};

/**
 * Create clearly-labelled synthetic sessions for demonstrating the analysis UI.
 * These are not observations from real participants and must not be reported as
 * usability findings.
 */
export function createDemoSessions(count = 24, seed = 2026): Session[] {
  if (count < 4) throw new RangeError("Need at least four synthetic sessions");
  const random = mulberry32(seed);
  const start = Date.parse("2026-02-02T09:00:00+07:00");

  return Array.from({ length: count }, (_, index) => {
    const usability = gaussian(random);
    const role = ROLES[index % ROLES.length];
    let offsetMs = index * 26 * 60 * 1000 + Math.floor(random() * 5 * 60 * 1000);
    const startedAt = new Date(start + offsetMs).toISOString();
    const perTaskSeq: number[] = [];

    const tasks = TASKS.map((task) => {
      const probability = clamp(BASE_SUCCESS[task.id] + usability * 0.07, 0.35, 0.97);
      const success = random() < probability;
      const attempts = success ? (random() < 0.24 ? 2 : 1) : 2 + Math.floor(random() * 2);
      const noise = Math.exp(gaussian(random) * 0.22);
      const slowdown = success ? 1 : 1.28;
      const durationMs = Math.round(BASE_SECONDS[task.id] * 1000 * noise * slowdown);
      offsetMs += durationMs + 8000;
      const seq = Math.round(clamp(4.1 + usability * 0.9 + gaussian(random) * 0.7, 1, 7));
      perTaskSeq.push(seq);
      return { taskId: task.id, attempts, durationMs, success, seq };
    });

    const latent = clamp(3.35 + usability * 0.42, 1.4, 4.7);
    const sus = Array.from({ length: 10 }, (_, itemIndex) => {
      const isOdd = itemIndex % 2 === 0;
      const base = isOdd ? latent : 6 - latent;
      return Math.round(clamp(base + gaussian(random) * 0.35, 1, 5));
    });
    const umux: [number, number] = [
      Math.round(clamp(3.1 + usability * 0.9 + gaussian(random) * 0.5, 1, 7)),
      Math.round(clamp(3.0 + usability * 0.85 + gaussian(random) * 0.5, 1, 7)),
    ];
    const completedAt = new Date(start + offsetMs + 4 * 60 * 1000).toISOString();

    return {
      id: `DEMO-S${String(index + 1).padStart(2, "0")}`,
      participantCode: `DEMO-P${String(index + 1).padStart(2, "0")}`,
      role,
      startedAt,
      completedAt,
      tasks,
      sus,
      umux,
      seq: Math.round(clamp(4.0 + usability * 0.8, 1, 7)),
      comments: random() < 0.55 ? COMMENTS[Math.floor(random() * COMMENTS.length)] : "",
      synthetic: true,
    };
  });
}

export const demoSessions: Session[] = createDemoSessions();
