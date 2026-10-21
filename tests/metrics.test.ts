import { describe, expect, it } from "vitest";
import {
  mean,
  meanCI95,
  median,
  standardDeviation,
  summariseSessions,
  susScore,
  umuxLiteScore,
  validateSession,
  wilsonInterval,
} from "../src/lib/metrics";
import { createDemoSessions } from "../src/data/demoSessions";

describe("SUS and UMUX-Lite", () => {
  it("scores perfectly positive and perfectly negative SUS response patterns", () => {
    expect(susScore([5, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toBe(100);
    expect(susScore([1, 5, 1, 5, 1, 5, 1, 5, 1, 5])).toBe(0);
    expect(susScore(Array(10).fill(3))).toBe(50);
  });

  it("rejects invalid SUS responses", () => {
    expect(() => susScore([1, 2, 3])).toThrow();
    expect(() => susScore([0, 1, 2, 3, 4, 5, 1, 2, 3, 4])).toThrow();
  });

  it("scores UMUX-Lite on a 0–100 scale", () => {
    expect(umuxLiteScore([7, 7])).toBe(100);
    expect(umuxLiteScore([1, 1])).toBe(0);
    expect(umuxLiteScore([4, 4])).toBe(50);
    expect(() => umuxLiteScore([8, 1])).toThrow();
  });
});

describe("descriptive statistics", () => {
  it("computes mean, median, SD, and CI", () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(standardDeviation([2, 2, 2])).toBe(0);
    expect(meanCI95([1, 2, 3])[0]).toBeLessThan(2);
    expect(meanCI95([1, 2, 3])[1]).toBeGreaterThan(2);
  });

  it("bounds Wilson intervals", () => {
    const [low, high] = wilsonInterval(8, 10);
    expect(low).toBeGreaterThan(0.4);
    expect(high).toBeLessThan(1);
    expect(wilsonInterval(0, 0)).toEqual([0, 0]);
    expect(() => wilsonInterval(11, 10)).toThrow();
  });
});

describe("session validation and summary", () => {
  const sessions = createDemoSessions(12, 99);

  it("accepts generated sessions", () => {
    for (const session of sessions) {
      expect(validateSession(session).tasks).toHaveLength(4);
    }
  });

  it("rejects malformed sessions", () => {
    expect(() => validateSession(null)).toThrow();
    expect(() => validateSession({ ...sessions[0], tasks: [] })).toThrow();
    expect(() => validateSession({ ...sessions[0], sus: [1, 2, 3] })).toThrow();
  });

  it("summarises task completion and questionnaires", () => {
    const summary = summariseSessions(sessions);
    expect(summary.n).toBe(12);
    expect(summary.synthetic).toBe(true);
    expect(summary.tasks).toHaveLength(4);
    expect(summary.completionRate).toBeGreaterThan(0);
    expect(summary.completionRate).toBeLessThanOrEqual(1);
    expect(summary.sus.mean).toBeGreaterThan(0);
    expect(summary.umux.mean).toBeGreaterThan(0);
  });

  it("requires at least one session", () => {
    expect(() => summariseSessions([])).toThrow();
  });
});
