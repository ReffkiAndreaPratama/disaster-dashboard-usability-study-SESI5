import { useCallback, useState } from "react";
import type { Session, StudyDraft } from "../types";
import { TASKS } from "../data/study";
import { saveLocalSession } from "./storage";

export interface StudyController {
  draft: StudyDraft | null;
  submitted: Session | null;
  start: (participantCode: string, role: string) => void;
  startTask: () => void;
  checkTask: (success: boolean, seq: number) => void;
  saveSeq: (seq: number) => void;
  submitSurvey: (sus: number[], umux: [number, number], comments: string) => Session;
  reset: () => void;
}

function createId(): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `local-${Date.now()}-${suffix}`;
}

export function useStudy(): StudyController {
  const [draft, setDraft] = useState<StudyDraft | null>(null);
  const [submitted, setSubmitted] = useState<Session | null>(null);

  const start = useCallback((participantCode: string, role: string) => {
    const code = participantCode.trim();
    if (!code) throw new Error("Kode peserta wajib diisi");
    setSubmitted(null);
    setDraft({
      id: createId(),
      participantCode: code,
      role,
      startedAt: new Date().toISOString(),
      currentTaskIndex: 0,
      startedTaskAt: null,
      attempts: {},
      tasks: [],
      seq: null,
      stage: "tasks",
    });
  }, []);

  const startTask = useCallback(() => {
    setDraft((current) => {
      if (!current || current.stage !== "tasks" || current.startedTaskAt !== null) return current;
      return { ...current, startedTaskAt: Date.now() };
    });
  }, []);

  const checkTask = useCallback((success: boolean, seq: number) => {
    if (!Number.isInteger(seq) || seq < 1 || seq > 7) {
      throw new RangeError("SEQ must be an integer within 1–7");
    }
    setDraft((current) => {
      if (!current || current.stage !== "tasks") return current;
      if (current.startedTaskAt === null) {
        return current;
      }
      const task = TASKS[current.currentTaskIndex];
      if (!task) return current;
      const attempts = (current.attempts[task.id] ?? 0) + 1;
      const nextAttempts = { ...current.attempts, [task.id]: attempts };
      if (!success) {
        return { ...current, attempts: nextAttempts };
      }
      const durationMs = Math.max(0, Date.now() - current.startedTaskAt);
      const nextIndex = current.currentTaskIndex + 1;
      const result = {
        taskId: task.id,
        attempts,
        durationMs,
        success: true,
        seq,
      };
      return {
        ...current,
        attempts: nextAttempts,
        tasks: [...current.tasks, result],
        currentTaskIndex: nextIndex,
        startedTaskAt: null,
        stage: nextIndex >= TASKS.length ? "seq" : "tasks",
      };
    });
  }, []);

  const saveSeq = useCallback((seq: number) => {
    setDraft((current) => {
      if (!current || current.stage !== "seq") return current;
      return { ...current, seq };
    });
  }, []);

  const submitSurvey = useCallback(
    (sus: number[], umux: [number, number], comments: string): Session => {
      if (!draft || draft.stage !== "seq" || draft.seq === null) {
        throw new Error("Selesaikan seluruh tugas sebelum mengirim kuesioner");
      }
      const session: Session = {
        id: draft.id,
        participantCode: draft.participantCode,
        role: draft.role,
        startedAt: draft.startedAt,
        completedAt: new Date().toISOString(),
        tasks: draft.tasks.map((task) => ({ ...task })),
        sus: [...sus],
        umux: [...umux] as [number, number],
        seq: draft.seq,
        comments: comments.trim(),
        synthetic: false,
      };
      saveLocalSession(session);
      setSubmitted(session);
      setDraft({ ...draft, stage: "done" });
      return session;
    },
    [draft],
  );

  const reset = useCallback(() => {
    setDraft(null);
    setSubmitted(null);
  }, []);

  return { draft, submitted, start, startTask, checkTask, saveSeq, submitSurvey, reset };
}
