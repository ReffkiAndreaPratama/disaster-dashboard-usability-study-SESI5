import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dashboard } from "../src/components/Dashboard";
import type { DashboardSnapshot } from "../src/types";

const snapshot: DashboardSnapshot = {
  selectedAlertId: null,
  selectedShelterId: null,
  categoryFilter: "Semua",
  acknowledged: [],
  actionCount: 0,
};

function renderDashboard(overrides: Partial<DashboardSnapshot> = {}) {
  const handlers = {
    onSelectAlert: vi.fn(),
    onSelectShelter: vi.fn(),
    onAcknowledge: vi.fn(),
    onFilter: vi.fn(),
  };
  render(<Dashboard snapshot={{ ...snapshot, ...overrides }} {...handlers} />);
  return handlers;
}

describe("Dashboard", () => {
  it("renders the simulated situation and KPIs", () => {
    renderDashboard();
    expect(screen.getByRole("heading", { name: "Situasi bencana Kota Bengkulu" })).toBeInTheDocument();
    expect(screen.getByText("Peringatan aktif")).toBeInTheDocument();
    expect(screen.getByText("Shelter terbuka")).toBeInTheDocument();
    expect(screen.getAllByText(/SIMULASI|DEMO/i).length).toBeGreaterThan(0);
  });

  it("selects an alert and acknowledges it", async () => {
    const user = userEvent.setup();
    const handlers = renderDashboard();
    await user.click(
      screen.getByRole("button", {
        name: "Buka detail: Genangan tinggi di bantaran Sungai Serut",
      }),
    );
    expect(handlers.onSelectAlert).toHaveBeenCalledWith("alert-01");
    await user.click(screen.getAllByRole("button", { name: "Tandai ditangani" })[0]);
    expect(handlers.onAcknowledge).toHaveBeenCalledWith("alert-01");
  });

  it("filters the alert list by category", async () => {
    const user = userEvent.setup();
    const handlers = renderDashboard();
    await user.click(screen.getByRole("button", { name: "Banjir" }));
    expect(handlers.onFilter).toHaveBeenCalledWith("Banjir");
  });

  it("opens shelter details", async () => {
    const user = userEvent.setup();
    const handlers = renderDashboard();
    await user.click(
      screen.getByRole("button", { name: "Lihat detail Gedung Serbaguna Ratu Agung" }),
    );
    expect(handlers.onSelectShelter).toHaveBeenCalledWith("shelter-04");
  });

  it("shows the selected alert detail", () => {
    renderDashboard({ selectedAlertId: "alert-02" });
    expect(screen.getByText("Detail peringatan")).toBeInTheDocument();
    expect(screen.getAllByText("Retakan lereng di kawasan perbukitan").length).toBeGreaterThan(0);
  });
});
