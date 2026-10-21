import type { Session, TaskDefinition, TaskId, TaskResult } from "../types";

export const TASKS: TaskDefinition[] = [
  {
    id: "highest-alert",
    title: "Prioritaskan peringatan tertinggi",
    instruction:
      "Di Kota Bengkulu, temukan peringatan dengan tingkat bahaya tertinggi dan buka detailnya.",
    successHint: "Pilih kartu peringatan berlevel Awas di Kota Bengkulu.",
    target: "alert-01",
  },
  {
    id: "nearest-shelter",
    title: "Temukan shelter terdekat",
    instruction:
      "Temukan shelter berstatus terbuka yang paling dekat dari pusat Kota Bengkulu, lalu buka detailnya.",
    successHint: "Shelter terbuka terdekat berjarak 1,8 km.",
    target: "shelter-04",
  },
  {
    id: "flood-filter",
    title: "Saring peringatan banjir",
    instruction: "Saring daftar peringatan sehingga hanya kategori Banjir yang ditampilkan.",
    successHint: "Gunakan tombol filter Banjir di panel peringatan.",
    target: "Banjir",
  },
  {
    id: "acknowledge-alert",
    title: "Tindak lanjuti peringatan longsor",
    instruction:
      "Tandai peringatan Siaga Longsor di Kecamatan Selebar sebagai sudah ditindaklanjuti.",
    successHint: "Gunakan tombol “Tandai ditangani” pada peringatan alert-02.",
    target: "alert-02",
  },
];

export const TASK_BY_ID: Record<TaskId, TaskDefinition> = Object.fromEntries(
  TASKS.map((task) => [task.id, task]),
) as Record<TaskId, TaskDefinition>;

export const SEVERITY_ORDER = ["awas", "siaga", "waspada", "normal"] as const;

export function taskCondition(taskId: TaskId, snapshot: {
  selectedAlertId: string | null;
  selectedShelterId: string | null;
  categoryFilter: string;
  acknowledged: string[];
}): boolean {
  switch (taskId) {
    case "highest-alert":
      return snapshot.selectedAlertId === "alert-01";
    case "nearest-shelter":
      return snapshot.selectedShelterId === "shelter-04";
    case "flood-filter":
      return snapshot.categoryFilter === "Banjir";
    case "acknowledge-alert":
      return snapshot.acknowledged.includes("alert-02");
    default:
      return false;
  }
}

export function taskSummary(tasks: TaskResult[]): {
  completed: number;
  successRate: number;
  medianMs: number;
} {
  if (tasks.length === 0) return { completed: 0, successRate: 0, medianMs: 0 };
  const successful = tasks.filter((task) => task.success);
  const durations = tasks.map((task) => task.durationMs).sort((a, b) => a - b);
  const middle = Math.floor(durations.length / 2);
  const median =
    durations.length % 2 === 0
      ? (durations[middle - 1] + durations[middle]) / 2
      : durations[middle];
  return {
    completed: successful.length,
    successRate: successful.length / tasks.length,
    medianMs: median,
  };
}

export function isCompleteSession(session: Session): boolean {
  return (
    session.tasks.length === TASKS.length &&
    session.tasks.every((task) => TASKS.some((definition) => definition.id === task.taskId))
  );
}
