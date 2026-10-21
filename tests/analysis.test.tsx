import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnalysisPage } from "../src/components/AnalysisPage";
import { demoSessions } from "../src/data/demoSessions";
import { Questionnaire } from "../src/components/Questionnaire";
import type { StudyController } from "../src/lib/useStudy";

const emptyController: StudyController = {
  draft: null,
  submitted: null,
  start: () => {},
  startTask: () => {},
  checkTask: () => {},
  saveSeq: () => {},
  submitSurvey: () => {
    throw new Error("not implemented");
  },
  reset: () => {},
};

describe("AnalysisPage", () => {
  it("labels synthetic demo sessions honestly", () => {
    render(<AnalysisPage demo={demoSessions} local={[]} />);
    expect(screen.getByText(/DATA SINTETIS/i)).toBeInTheDocument();
    expect(screen.getByText(/bukan partisipan nyata/i)).toBeInTheDocument();
    expect(screen.getAllByText("24").length).toBeGreaterThan(0);
    expect(screen.getByText("Penyelesaian per tugas")).toBeInTheDocument();
  });

  it("offers the local-session tab and explains when it is empty", async () => {
    const user = userEvent.setup();
    render(<AnalysisPage demo={demoSessions} local={[]} />);
    await user.click(screen.getByRole("button", { name: "Sesi lokal (0)" }));
    expect(screen.getByText("Belum ada sesi lokal")).toBeInTheDocument();
  });
});

describe("Questionnaire", () => {
  it("requires a completed study session", () => {
    render(<Questionnaire study={emptyController} />);
    expect(screen.getByRole("heading", { name: "Kuesioner" })).toBeInTheDocument();
    expect(screen.getByText(/setelah seluruh tugas/i)).toBeInTheDocument();
  });
});
