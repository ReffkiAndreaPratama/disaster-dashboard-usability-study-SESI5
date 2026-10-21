export type Severity = "awas" | "siaga" | "waspada" | "normal";
export type Category = "Banjir" | "Longsor" | "Cuaca";
export type ShelterStatus = "open" | "full" | "closed";
export type Page = "dashboard" | "study" | "questionnaire" | "analysis" | "methods";

export interface Alert {
  id: string;
  title: string;
  district: string;
  category: Category;
  severity: Severity;
  issuedAt: string;
  description: string;
  action: string;
  status: "baru" | "dipantau" | "ditangani";
}

export interface Shelter {
  id: string;
  name: string;
  district: string;
  status: ShelterStatus;
  capacity: number;
  occupancy: number;
  distanceKm: number;
  medical: boolean;
  generator: boolean;
}

export interface TrendPoint {
  time: string;
  rainfallMm: number;
  waterLevelCm: number;
}

export interface TaskDefinition {
  id: TaskId;
  title: string;
  instruction: string;
  successHint: string;
  target: string;
}

export type TaskId = "highest-alert" | "nearest-shelter" | "flood-filter" | "acknowledge-alert";

export interface TaskResult {
  taskId: TaskId;
  attempts: number;
  durationMs: number;
  success: boolean;
  seq: number;
}

export interface Session {
  id: string;
  participantCode: string;
  role: string;
  startedAt: string;
  completedAt: string;
  tasks: TaskResult[];
  sus: number[];
  umux: [number, number];
  seq: number;
  comments: string;
  synthetic: boolean;
}

export interface DashboardSnapshot {
  selectedAlertId: string | null;
  selectedShelterId: string | null;
  categoryFilter: Category | "Semua";
  acknowledged: string[];
  actionCount: number;
}

export interface StudyDraft {
  id: string;
  participantCode: string;
  role: string;
  startedAt: string;
  currentTaskIndex: number;
  startedTaskAt: number | null;
  attempts: Record<string, number>;
  tasks: TaskResult[];
  seq: number | null;
  stage: "tasks" | "seq" | "done";
}
