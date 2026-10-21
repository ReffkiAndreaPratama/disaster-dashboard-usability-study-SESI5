import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Alert, Category, DashboardSnapshot, Shelter } from "../types";
import { alerts, districts, severityLabels, shelters, trend } from "../data/demoData";

interface Props {
  snapshot: DashboardSnapshot;
  onSelectAlert: (id: string) => void;
  onSelectShelter: (id: string) => void;
  onAcknowledge: (id: string) => void;
  onFilter: (category: Category | "Semua") => void;
  compact?: boolean;
}

const categories: (Category | "Semua")[] = ["Semua", "Banjir", "Longsor", "Cuaca"];

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

function shelterStatusLabel(status: Shelter["status"]): string {
  return status === "open" ? "Terbuka" : status === "full" ? "Penuh" : "Tutup";
}

export function Dashboard({
  snapshot,
  onSelectAlert,
  onSelectShelter,
  onAcknowledge,
  onFilter,
  compact = false,
}: Props) {
  const visibleAlerts = alerts.filter(
    (alert) => snapshot.categoryFilter === "Semua" || alert.category === snapshot.categoryFilter,
  );
  const activeAlerts = alerts.filter((alert) => alert.severity !== "normal");
  const openShelters = shelters.filter((shelter) => shelter.status === "open");
  const occupancy = shelters.reduce((sum, shelter) => sum + shelter.occupancy, 0);
  const latest = trend[trend.length - 1];
  const selectedAlert = alerts.find((alert) => alert.id === snapshot.selectedAlertId) ?? null;
  const selectedShelter = shelters.find((shelter) => shelter.id === snapshot.selectedShelterId) ?? null;
  const acknowledged = new Set(snapshot.acknowledged);

  return (
    <div className={compact ? "dashboard dashboard-compact" : "dashboard"}>
      {!compact && (
        <section className="page-intro">
          <div>
            <p className="eyebrow">Ruang kendali simulasi · 14 Maret 2026</p>
            <h1>Situasi bencana Kota Bengkulu</h1>
            <p className="muted">
              Prototipe untuk studi usability. Seluruh angka dan lokasi bersifat fiktif.
            </p>
          </div>
          <div className="live-pill">
            <span className="live-dot" /> Simulasi aktif
          </div>
        </section>
      )}

      <section className="kpi-grid" aria-label="Indikator utama">
        <article className="kpi kpi-danger">
          <span className="kpi-label">Peringatan aktif</span>
          <strong>{activeAlerts.length}</strong>
          <small>1 Awas · 2 Siaga · 2 Waspada</small>
        </article>
        <article className="kpi kpi-teal">
          <span className="kpi-label">Shelter terbuka</span>
          <strong>{openShelters.length}</strong>
          <small>dari {shelters.length} lokasi terdaftar</small>
        </article>
        <article className="kpi kpi-amber">
          <span className="kpi-label">Pengungsi tercatat</span>
          <strong>{occupancy.toLocaleString("id-ID")}</strong>
          <small>kapasitas total 1.100 orang</small>
        </article>
        <article className="kpi kpi-blue">
          <span className="kpi-label">Muka air terakhir</span>
          <strong>{latest.waterLevelCm} cm</strong>
          <small>puncak simulasi 221 cm</small>
        </article>
      </section>

      <div className="dashboard-grid">
        <section className="panel panel-map" aria-labelledby="map-heading">
          <div className="panel-heading">
            <div>
              <h2 id="map-heading">Peta situasi</h2>
              <p className="muted small">Klik penanda untuk membuka detail peringatan.</p>
            </div>
            <span className="tag">DEMO</span>
          </div>
          <div className="dashboard-map-grid">
            <DisasterMapLazy selectedAlertId={snapshot.selectedAlertId} onSelectAlert={onSelectAlert} />
            <aside className="detail-card" aria-live="polite">
              <h3>{selectedAlert ? "Detail peringatan" : "Belum ada peringatan dipilih"}</h3>
              {selectedAlert ? (
                <>
                  <span className={`severity severity-${selectedAlert.severity}`}>
                    {severityLabels[selectedAlert.severity]}
                  </span>
                  <strong>{selectedAlert.title}</strong>
                  <p className="small muted">
                    {selectedAlert.district} · {formatTime(selectedAlert.issuedAt)} WIB
                  </p>
                  <p className="small">{selectedAlert.description}</p>
                  <p className="small">
                    <b>Tindakan:</b> {selectedAlert.action}
                  </p>
                </>
              ) : (
                <p className="small muted">
                  Pilih kartu peringatan atau penanda pada peta untuk melihat ringkasan dan tindakan
                  yang disarankan.
                </p>
              )}
            </aside>
          </div>
        </section>

        <section className="panel" aria-labelledby="alerts-heading">
          <div className="panel-heading">
            <div>
              <h2 id="alerts-heading">Peringatan</h2>
              <p className="muted small">{visibleAlerts.length} peringatan ditampilkan</p>
            </div>
          </div>
          <div className="filter-row" role="group" aria-label="Filter kategori peringatan">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={snapshot.categoryFilter === category ? "filter active" : "filter"}
                aria-pressed={snapshot.categoryFilter === category}
                onClick={() => onFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="alert-list">
            {visibleAlerts.map((alert: Alert) => {
              const handled = acknowledged.has(alert.id) || alert.status === "ditangani";
              return (
                <article
                  key={alert.id}
                  className={
                    snapshot.selectedAlertId === alert.id ? "alert-card selected" : "alert-card"
                  }
                >
                  <button
                    type="button"
                    className="alert-main"
                    onClick={() => onSelectAlert(alert.id)}
                    aria-label={`Buka detail: ${alert.title}`}
                  >
                    <span className={`severity severity-${alert.severity}`}>
                      {severityLabels[alert.severity]}
                    </span>
                    <span className="alert-copy">
                      <strong>{alert.title}</strong>
                      <small>
                        {alert.district} · {alert.category} · {formatTime(alert.issuedAt)}
                      </small>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="ghost-button small-button"
                    disabled={handled}
                    onClick={() => onAcknowledge(alert.id)}
                  >
                    {handled ? "Ditangani" : "Tandai ditangani"}
                  </button>
                </article>
              );
            })}
            {visibleAlerts.length === 0 && (
              <p className="empty-state">Tidak ada peringatan untuk kategori ini.</p>
            )}
          </div>
        </section>
      </div>

      <div className="dashboard-grid lower-grid">
        <section className="panel" aria-labelledby="trend-heading">
          <div className="panel-heading">
            <div>
              <h2 id="trend-heading">Tren 18 jam</h2>
              <p className="muted small">Curah hujan per jam dan muka air sungai (simulasi).</p>
            </div>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trend} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="#26364d" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#8fa3bf" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="rain" stroke="#38bdf8" tick={{ fontSize: 11 }} unit=" mm" />
                <YAxis
                  yAxisId="water"
                  orientation="right"
                  stroke="#fbbf24"
                  tick={{ fontSize: 11 }}
                  unit=" cm"
                />
                <Tooltip
                  contentStyle={{ background: "#0f1a2a", border: "1px solid #334155", borderRadius: 8 }}
                />
                <Legend />
                <Line
                  yAxisId="rain"
                  type="monotone"
                  dataKey="rainfallMm"
                  name="Hujan (mm)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="water"
                  type="monotone"
                  dataKey="waterLevelCm"
                  name="Muka air (cm)"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel" aria-labelledby="shelters-heading">
          <div className="panel-heading">
            <div>
              <h2 id="shelters-heading">Shelter</h2>
              <p className="muted small">Urutan sesuai daftar; jarak dari pusat kota.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Lokasi</th>
                  <th>Status</th>
                  <th>Huni</th>
                  <th>Jarak</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shelters.map((shelter) => (
                  <tr
                    key={shelter.id}
                    className={snapshot.selectedShelterId === shelter.id ? "selected-row" : ""}
                  >
                    <td>
                      <strong>{shelter.name}</strong>
                      <small>{shelter.district}</small>
                    </td>
                    <td>
                      <span className={`shelter-status status-${shelter.status}`}>
                        {shelterStatusLabel(shelter.status)}
                      </span>
                    </td>
                    <td>
                      {shelter.occupancy}/{shelter.capacity}
                    </td>
                    <td>{shelter.distanceKm.toLocaleString("id-ID")} km</td>
                    <td>
                      <button
                        type="button"
                        className="ghost-button small-button"
                        onClick={() => onSelectShelter(shelter.id)}
                        aria-label={`Lihat detail ${shelter.name}`}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedShelter && (
            <div className="shelter-detail" aria-live="polite">
              <strong>{selectedShelter.name}</strong>
              <span>
                {shelterStatusLabel(selectedShelter.status)} · sisa kapasitas{" "}
                {selectedShelter.capacity - selectedShelter.occupancy} orang
              </span>
              <span>
                Fasilitas: {selectedShelter.medical ? "medis" : "tanpa medis"} ·{" "}
                {selectedShelter.generator ? "genset" : "tanpa genset"}
              </span>
            </div>
          )}
        </section>
      </div>

      {!compact && (
        <section className="panel" aria-labelledby="districts-heading">
          <div className="panel-heading">
            <div>
              <h2 id="districts-heading">Ringkasan kecamatan</h2>
              <p className="muted small">Indeks risiko simulasi, bukan skor resmi.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kecamatan</th>
                  <th>Populasi</th>
                  <th>Indeks risiko</th>
                  <th>Peringatan</th>
                  <th>Shelter</th>
                </tr>
              </thead>
              <tbody>
                {districts.map((district) => (
                  <tr key={district.name}>
                    <td>{district.name}</td>
                    <td>{district.population.toLocaleString("id-ID")}</td>
                    <td>
                      <span className="risk-bar" aria-label={`Indeks risiko ${district.risk}`}>
                        <span style={{ width: `${district.risk}%` }} />
                      </span>
                      {district.risk}
                    </td>
                    <td>{district.alerts}</td>
                    <td>{district.shelters}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

// Kept as a small wrapper so the map import stays isolated from chart imports in tests.
import { DisasterMap as DisasterMapLazy } from "./DisasterMap";
