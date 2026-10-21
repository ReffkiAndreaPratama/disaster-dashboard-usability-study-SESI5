import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

describe("study flow", () => {
  it("starts a session and completes the first task against the dashboard target", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: /Studi tugas/ })[0]);
    expect(screen.getByRole("heading", { name: "Studi tugas" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Kode peserta"), "TEST-01");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Mulai sesi studi" }));

    expect(screen.getByText("Tugas 1 dari 4")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mulai tugas" }));
    await user.click(
      screen.getByRole("button", {
        name: "Buka detail: Genangan tinggi di bantaran Sungai Serut",
      }),
    );
    await user.click(screen.getByRole("button", { name: /Periksa & selesaikan/ }));

    expect(await screen.findByText("Tugas 2 dari 4")).toBeInTheDocument();
  });

  it("shows a failure message when the wrong target is selected", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: /Studi tugas/ })[0]);
    await user.type(screen.getByLabelText("Kode peserta"), "TEST-02");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Mulai sesi studi" }));
    await user.click(screen.getByRole("button", { name: "Mulai tugas" }));
    await user.click(screen.getByRole("button", { name: /Periksa & selesaikan/ }));

    expect(await screen.findByText(/Target belum tercapai/)).toBeInTheDocument();
  });

  it("navigates to the methods page", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole("button", { name: /Metode/ })[0]);
    expect(screen.getByRole("heading", { name: "Metode studi usability" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kejujuran data" })).toBeInTheDocument();
    expect(screen.getByText(/Dashboard analisis memakai 24 sesi sintetis/)).toBeInTheDocument();
  });
});
