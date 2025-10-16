// client/src/components/panels/SimulationPanel.jsx
import React from "react";

export default function SimulationPanel({ routeSim }) {
  return (
    <div>
      <h3>Simulation</h3>
      <small>Animate the trip and update battery live.</small>
      <div style={{marginTop:8, display:"flex", gap:8}}>
        <button onClick={() => routeSim.start(false)} className="primary">Start Trip</button>
        <button onClick={() => routeSim.stop(false)} className="ghost">Stop</button>
        <button onClick={() => routeSim.start(true)} className="ghost">Start using GPS</button>
      </div>
    </div>
  );
}
