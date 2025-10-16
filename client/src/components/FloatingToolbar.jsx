// client/src/components/FloatingToolbar.jsx
import React, { useState } from "react";
import CompareRoutesPanel from "./panels/CompareRoutesPanel";
import SimulationPanel from "./panels/SimulationPanel";
import OfflineModePanel from "./panels/OfflineModePanel";
import PowerControlsPanel from "./panels/PowerControlsPanel";

export default function FloatingToolbar({ onSetRoute, selectedRoute, setSelectedRoute, routeSim, auxState, setAuxState }) {
  const [active, setActive] = useState(null);

  return (
    <>
      <div style={{ position: "fixed", right: 14, top: 90, zIndex: 10050, display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={() => setActive(active === "search" ? null : "search")} title="Search" className="tb-btn">🛣️</button>
        <button onClick={() => setActive(active === "sim" ? null : "sim")} title="Simulation" className="tb-btn">🏎️</button>
        <button onClick={() => setActive(active === "offline" ? null : "offline")} title="Offline" className="tb-btn">📡</button>
        <button onClick={() => setActive(active === "power" ? null : "power")} title="Power" className="tb-btn">⚙️</button>
      </div>

      {active === "search" && (
        <div className="panel" style={{ right: 70, top: 90 }}>
          <CompareRoutesPanel onSetRoute={onSetRoute} setSelectedRoute={setSelectedRoute} selectedRoute={selectedRoute} />
        </div>
      )}

      {active === "sim" && (
        <div className="panel" style={{ right: 70, top: 90 }}>
          <SimulationPanel routeSim={routeSim} />
        </div>
      )}

      {active === "offline" && (
        <div className="panel" style={{ right: 70, top: 90 }}>
          <OfflineModePanel />
        </div>
      )}

      {active === "power" && (
        <div className="panel" style={{ right: 70, top: 90 }}>
          <PowerControlsPanel auxState={auxState} setAuxState={setAuxState} />
        </div>
      )}
    </>
  );
}
