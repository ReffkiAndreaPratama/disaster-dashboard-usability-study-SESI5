import { describe, expect, it } from "vitest";
import { createDemoSessions, demoSessions } from "../src/data/demoSessions";
import { TASKS } from "../src/data/study";
import { alerts, shelters, trend } from "../src/data/demoData";

describe("synthetic demo sessions", () => {
  it("is deterministic for a seed", () => {
    expect(createDemoSessions(8, 42)).toEqual(createDemoSessions(8, 42));
  });

  it("contains the full task protocol", () => {
    for (const session of demoSessions) {
      expect(session.tasks.map((task) => task.taskId)).toEqual(TASKS.map((task) => task.id));
      expect(session.synthetic).toBe(true);
      expect(session.id.startsWith("DEMO-S")).toBe(true);
    }
  });

  it("does not use real participant identifiers", () => {
    for (const session of demoSessions) {
      expect(session.participantCode.startsWith("DEMO-P")).toBe(true);
      expect(session.synthetic).toBe(true);
    }
  });

  it("rejects impossible sample sizes", () => {
    expect(() => createDemoSessions(2)).toThrow();
  });
});

describe("simulated dashboard data", () => {
  it("has a unique highest-severity alert in Kota Bengkulu", () => {
    const cityAlerts = alerts.filter((alert) => alert.district === "Kota Bengkulu");
    const awas = cityAlerts.filter((alert) => alert.severity === "awas");
    expect(awas).toHaveLength(1);
    expect(awas[0].id).toBe("alert-01");
  });

  it("has a unique nearest open shelter", () => {
    const open = shelters.filter((shelter) => shelter.status === "open");
    const nearest = [...open].sort((a, b) => a.distanceKm - b.distanceKm)[0];
    expect(nearest.id).toBe("shelter-04");
  });

  it("contains an 18-hour trend ending at the latest water level", () => {
    expect(trend).toHaveLength(18);
    expect(trend[trend.length - 1].waterLevelCm).toBe(212);
  });
});
