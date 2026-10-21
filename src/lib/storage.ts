import type { Session } from "../types";
import { validateSession } from "./metrics";

const STORAGE_KEY = "siganusa.usability.sessions.v1";

export function loadLocalSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      try {
        return [validateSession(item)];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

export function saveLocalSession(session: Session): void {
  const existing = loadLocalSessions().filter((item) => item.id !== session.id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, session]));
}

export function clearLocalSessions(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function downloadText(filename: string, text: string, mime = "application/json"): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
