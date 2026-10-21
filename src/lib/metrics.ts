import type { Session, TaskId, TaskResult } from "../types";
import { TASKS } from "../data/study";

export function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const average = mean(values);
  const variance =
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Normal-approximation 95% confidence interval for a mean. */
export function meanCI95(values: number[]): [number, number] {
  if (values.length === 0) return [0, 0];
  if (values.length === 1) return [values[0], values[0]];
  const average = mean(values);
  const margin = (1.96 * standardDeviation(values)) / Math.sqrt(values.length);
  return [average - margin, average + margin];
}

/** Wilson score interval for a binomial proportion. */
export function wilsonInterval(successes: number, n: number, z = 1.96): [number, number] {
  if (n <= 0) return [0, 0];
  if (successes < 0 || successes > n) throw new RangeError("successes must be within [0, n]");
  const p = successes / n;
  const denominator = 1 + (z ** 2) / n;
  const centre = p + (z ** 2) / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p)) / n + (z ** 2) / (4 * n ** 2));
  return [Math.max(0, (centre - spread) / denominator), Math.min(1, (centre + spread) / denominator)];
}

export function susScore(responses: number[]): number {
  if (responses.length !== 10) throw new RangeError("SUS requires exactly 10 responses");
  if (responses.some((value) => !Number.isFinite(value) || value < 1 || value > 5)) {
    throw new RangeError("SUS responses must be integers within 1–5");
  }
  const total = responses.reduce((sum, value, index) => {
    const isOddItem = index % 2 === 0;
    return sum + (isOddItem ? value - 1 : 5 - value);
  }, 0);
  return total * 2.5;
}

export function umuxLiteScore(responses: [number, number]): number {
  if (responses.some((value) => !Number.isFinite(value) || value < 1 || value > 7)) {
    throw new RangeError("UMUX-Lite responses must be within 1–7");
  }
  return ((responses[0] - 1 + (responses[1] - 1)) / 12) * 100;
}

export function validateSession(input: unknown): Session {
  if (typeof input !== "object" || input === null) throw new TypeError("Session must be an object");
  const session = input as Partial<Session>;
  if (!session.id || !session.participantCode) throw new Error("Session id and participant code are required");
  if (!Array.isArray(session.tasks) || session.tasks.length !== TASKS.length) {
    throw new Error("Session must contain exactly four task results");
  }
  const ids = new Set(session.tasks.map((task) => task.taskId));
  if (ids.size !== TASKS.length || TASKS.some((task) => !ids.has(task.id))) {
    throw new Error("Session task ids do not match the protocol");
  }
  for (const task of session.tasks) {
    if (task.attempts < 1 || task.durationMs < 0) throw new Error("Invalid task attempt or duration");
    if (!Number.isFinite(task.seq) || task.seq < 1 || task.seq > 7) {
      throw new Error("SEQ must be within 1–7");
    }
  }
  if (!Array.isArray(session.sus) || session.sus.length !== 10) throw new Error("SUS requires 10 items");
  susScore(session.sus);
  if (!Array.isArray(session.umux) || session.umux.length !== 2) throw new Error("UMUX-Lite requires 2 items");
  umuxLiteScore(session.umux as [number, number]);
  if (typeof session.seq !== "number" || !Number.isFinite(session.seq) || session.seq < 1 || session.seq > 7) {
    throw new Error("Session SEQ must be within 1–7");
  }
  return {
    ...(session as Session),
    tasks: session.tasks.map((task) => ({ ...task })) as TaskResult[],
    sus: [...session.sus],
    umux: [...(session.umux as [number, number])],
    synthetic: Boolean(session.synthetic),
  };
}

export interface TaskAnalysis {
  taskId: TaskId;
  title: string;
  n: number;
  successes: number;
  completionRate: number;
  completionCI: [number, number];
  medianDurationMs: number;
  meanAttempts: number;
  meanSeq: number;
}

export interface SessionAnalysis {
  n: number;
  synthetic: boolean;
  tasks: TaskAnalysis[];
  completionRate: number;
  participantCompletionRate: number;
  medianTaskMs: number;
  meanAttempts: number;
  errorRate: number;
  sus: { mean: number; median: number; sd: number; ci95: [number, number]; scores: number[] };
  umux: { mean: number; median: number; sd: number; ci95: [number, number]; scores: number[] };
  seqMean: number;
  comments: number;
  roles: { role: string; n: number }[];
}

export function summariseSessions(input: Session[]): SessionAnalysis {
  const sessions = input.map(validateSession);
  if (sessions.length === 0) throw new Error("At least one session is required");
  const allTasks = sessions.flatMap((session) => session.tasks);
  const susScores = sessions.map((session) => susScore(session.sus));
  const umuxScores = sessions.map((session) => umuxLiteScore(session.umux));
  const completeParticipants = sessions.filter((session) => session.tasks.every((task) => task.success));

  const tasks = TASKS.map((definition) => {
    const results = allTasks.filter((task) => task.taskId === definition.id);
    const successes = results.filter((task) => task.success).length;
    return {
      taskId: definition.id,
      title: definition.title,
      n: results.length,
      successes,
      completionRate: results.length ? successes / results.length : 0,
      completionCI: wilsonInterval(successes, results.length),
      medianDurationMs: median(results.map((task) => task.durationMs)),
      meanAttempts: mean(results.map((task) => task.attempts)),
      meanSeq: mean(results.map((task) => task.seq)),
    };
  });

  const roles = Object.entries(
    sessions.reduce<Record<string, number>>((counts, session) => {
      counts[session.role] = (counts[session.role] ?? 0) + 1;
      return counts;
    }, {}),
  ).map(([role, n]) => ({ role, n }));

  return {
    n: sessions.length,
    synthetic: sessions.every((session) => session.synthetic),
    tasks,
    completionRate: allTasks.length
      ? allTasks.filter((task) => task.success).length / allTasks.length
      : 0,
    participantCompletionRate: completeParticipants.length / sessions.length,
    medianTaskMs: median(allTasks.map((task) => task.durationMs)),
    meanAttempts: mean(allTasks.map((task) => task.attempts)),
    errorRate: allTasks.length
      ? allTasks.reduce((sum, task) => sum + Math.max(0, task.attempts - 1), 0) / allTasks.length
      : 0,
    sus: {
      mean: mean(susScores),
      median: median(susScores),
      sd: standardDeviation(susScores),
      ci95: meanCI95(susScores),
      scores: susScores,
    },
    umux: {
      mean: mean(umuxScores),
      median: median(umuxScores),
      sd: standardDeviation(umuxScores),
      ci95: meanCI95(umuxScores),
      scores: umuxScores,
    },
    seqMean: mean(sessions.map((session) => session.seq)),
    comments: sessions.filter((session) => session.comments.trim().length > 0).length,
    roles,
  };
}

export function formatPercent(value: number, digits = 1): string {
  return `${round(value * 100, digits)}%`;
}

export function formatSeconds(ms: number): string {
  return `${round(ms / 1000, 1)} s`;
}

export function toCsv(sessions: Session[]): string {
  const header = [
    "id",
    "participant_code",
    "role",
    "synthetic",
    "completed_at",
    "sus",
    "umux_lite",
    "seq",
    "overall_success",
    "total_attempts",
    "total_duration_ms",
  ];
  const rows = sessions.map((session) => {
    const sus = susScore(session.sus);
    const umux = umuxLiteScore(session.umux);
    return [
      session.id,
      session.participantCode,
      session.role,
      session.synthetic ? "true" : "false",
      session.completedAt,
      round(sus, 1),
      round(umux, 1),
      session.seq,
      session.tasks.every((task) => task.success) ? "true" : "false",
      session.tasks.reduce((sum, task) => sum + task.attempts, 0),
      session.tasks.reduce((sum, task) => sum + task.durationMs, 0),
    ].join(",");
  });
  return [header.join(","), ...rows].join("\n");
}
