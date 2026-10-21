import type { Alert } from "../types";
import { alerts, severityLabels } from "../data/demoData";

interface Props {
  selectedAlertId: string | null;
  onSelectAlert: (id: string) => void;
}

const positions: Record<string, { x: number; y: number }> = {
  "alert-01": { x: 235, y: 218 },
  "alert-02": { x: 372, y: 262 },
  "alert-03": { x: 312, y: 154 },
  "alert-04": { x: 188, y: 122 },
  "alert-05": { x: 412, y: 190 },
  "alert-06": { x: 136, y: 258 },
};

export function DisasterMap({ selectedAlertId, onSelectAlert }: Props) {
  return (
    <div className="map-shell">
      <div className="map-toolbar">
        <span className="map-chip">Peta skematik</span>
        <span className="map-chip map-chip-muted">Tanpa tile eksternal</span>
      </div>
      <svg
        className="disaster-map"
        viewBox="0 0 560 340"
        role="img"
        aria-label="Peta skematik Kota Bengkulu dengan lokasi peringatan bencana simulasi"
      >
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#243247" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="560" height="340" fill="#111c2e" rx="14" />
        <rect width="560" height="340" fill="url(#grid)" rx="14" />
        <path
          d="M18 84 C110 70 140 130 205 126 C280 122 310 60 390 78 C455 93 486 140 545 128"
          fill="none"
          stroke="#1d4ed8"
          strokeOpacity="0.5"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M18 84 C110 70 140 130 205 126 C280 122 310 60 390 78 C455 93 486 140 545 128"
          fill="none"
          stroke="#60a5fa"
          strokeOpacity="0.6"
          strokeWidth="2"
          strokeDasharray="5 6"
        />
        <path
          d="M265 112 C255 165 285 205 258 248 C240 278 252 305 270 332"
          fill="none"
          stroke="#1d4ed8"
          strokeOpacity="0.55"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <g className="map-roads" stroke="#334155" strokeWidth="3" strokeLinecap="round">
          <path d="M70 48 L500 304" />
          <path d="M55 292 L505 66" />
          <path d="M100 170 L470 172" />
        </g>
        <g className="map-labels" fill="#93a4bd" fontSize="10">
          <text x="28" y="66">Kota Bengkulu</text>
          <text x="330" y="105">Sungai Serut</text>
          <text x="430" y="324">Selebar</text>
          <text x="52" y="318">Muara Bangkahulu</text>
        </g>
        <g className="map-shelters">
          {["shelter-01", "shelter-03", "shelter-04", "shelter-06"].map((id, index) => {
            const coords = [
              { x: 300, y: 238 },
              { x: 430, y: 270 },
              { x: 220, y: 190 },
              { x: 390, y: 210 },
            ][index];
            return (
              <g key={id} transform={`translate(${coords.x} ${coords.y})`}>
                <rect x="-7" y="-7" width="14" height="14" rx="3" fill="#0f766e" stroke="#5eead4" />
                <text x="11" y="4" fill="#99f6e4" fontSize="9">
                  {id.replace("shelter-", "S")}
                </text>
              </g>
            );
          })}
        </g>
        {alerts.map((alert: Alert) => {
          const position = positions[alert.id];
          const active = selectedAlertId === alert.id;
          const colour =
            alert.severity === "awas"
              ? "#ef4444"
              : alert.severity === "siaga"
                ? "#f97316"
                : alert.severity === "waspada"
                  ? "#eab308"
                  : "#64748b";
          return (
            <g
              key={alert.id}
              transform={`translate(${position.x} ${position.y})`}
              className={active ? "map-marker map-marker-active" : "map-marker"}
              role="button"
              tabIndex={0}
              aria-label={`${severityLabels[alert.severity]}: ${alert.title}`}
              onClick={() => onSelectAlert(alert.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectAlert(alert.id);
                }
              }}
            >
              <title>{`${severityLabels[alert.severity]} — ${alert.title}`}</title>
              <circle r={active ? 15 : 11} fill={`${colour}33`} stroke={colour} strokeWidth="2" />
              <circle r="4" fill={colour} />
            </g>
          );
        })}
      </svg>
      <div className="map-legend" aria-label="Legenda tingkat bahaya">
        {(["awas", "siaga", "waspada", "normal"] as const).map((severity) => (
          <span key={severity}>
            <i className={`legend-dot legend-${severity}`} />
            {severityLabels[severity]}
          </span>
        ))}
        <span>
          <i className="legend-square" /> Shelter
        </span>
      </div>
    </div>
  );
}
