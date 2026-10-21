import { useEffect, useState } from "react";
import type { Category, DashboardSnapshot, Page, Session } from "./types";
import { demoSessions } from "./data/demoSessions";
import { DEMO_BANNER } from "./data/demoData";
import { Dashboard } from "./components/Dashboard";
import { TaskPanel } from "./components/TaskPanel";
import { Questionnaire } from "./components/Questionnaire";
import { AnalysisPage } from "./components/AnalysisPage";
import { MethodsPage } from "./components/MethodsPage";
import { useStudy } from "./lib/useStudy";
import { loadLocalSessions } from "./lib/storage";

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>({
    selectedAlertId: null,
    selectedShelterId: null,
    categoryFilter: "Semua",
    acknowledged: [],
    actionCount: 0,
  });
  const [localSessions, setLocalSessions] = useState<Session[]>(() => loadLocalSessions());
  const study = useStudy();

  useEffect(() => {
    if (study.submitted) {
      setLocalSessions(loadLocalSessions());
    }
  }, [study.submitted]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const update = (patch: Partial<DashboardSnapshot>) => {
    setSnapshot((current) => ({ ...current, ...patch, actionCount: current.actionCount + 1 }));
  };

  const selectAlert = (id: string) => update({ selectedAlertId: id });
  const selectShelter = (id: string) => update({ selectedShelterId: id });
  const acknowledge = (id: string) =>
    update({ acknowledged: [...new Set([...snapshot.acknowledged, id])] });
  const filter = (category: Category | "Semua") => update({ categoryFilter: category });

  const navItems: { id: Page; label: string; hint: string }[] = [
    { id: "dashboard", label: "Dashboard", hint: "Situasi" },
    { id: "study", label: "Studi tugas", hint: "Protokol" },
    { id: "questionnaire", label: "Kuesioner", hint: "SUS & UMUX" },
    { id: "analysis", label: "Analisis", hint: "Hasil" },
    { id: "methods", label: "Metode", hint: "Rancangan" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            SN
          </div>
          <div>
            <strong>SiagaNusa</strong>
            <span>Dashboard studi</span>
          </div>
        </div>

        <nav aria-label="Navigasi utama">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={page === item.id ? "nav-item active" : "nav-item"}
              aria-current={page === item.id ? "page" : undefined}
              onClick={() => setPage(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.hint}</small>
            </button>
          ))}
        </nav>

        <div className="sidebar-note">
          <span className="tag">SIMULASI</span>
          <p>{DEMO_BANNER}</p>
        </div>
        <p className="sidebar-footer">Prototipe penelitian · v0.1.0</p>
      </aside>

      <main className="main-content">
        <div className="mobile-nav" role="navigation" aria-label="Navigasi seluler">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={page === item.id ? "active" : ""}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {page === "dashboard" && (
          <Dashboard
            snapshot={snapshot}
            onSelectAlert={selectAlert}
            onSelectShelter={selectShelter}
            onAcknowledge={acknowledge}
            onFilter={filter}
          />
        )}

        {page === "study" && (
          <div className="study-page">
            <section className="page-intro">
              <div>
                <p className="eyebrow">Sesi terpandu</p>
                <h1>Studi tugas</h1>
                <p className="muted">
                  Selesaikan instruksi di panel kiri menggunakan dashboard di kanan. Data tetap di
                  browser Anda.
                </p>
              </div>
              <span className="tag tag-study">{snapshot.actionCount} aksi tercatat</span>
            </section>
            <div className="study-layout">
              <TaskPanel study={study} snapshot={snapshot} onNavigate={setPage} />
              <Dashboard
                compact
                snapshot={snapshot}
                onSelectAlert={selectAlert}
                onSelectShelter={selectShelter}
                onAcknowledge={acknowledge}
                onFilter={filter}
              />
            </div>
          </div>
        )}

        {page === "questionnaire" && <Questionnaire study={study} />}

        {page === "analysis" && <AnalysisPage demo={demoSessions} local={localSessions} />}

        {page === "methods" && <MethodsPage onNavigate={setPage} />}

        <footer className="site-footer">
          <span>SiagaNusa · prototipe penelitian</span>
          <span>Data dashboard dan sesi DEMO sepenuhnya sintetis.</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
