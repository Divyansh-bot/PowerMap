// client/src/components/panels/OfflineModePanel.jsx
import React from "react";

export default function OfflineModePanel() {
  return (
    <div>
      <h3>Offline Mode</h3>
      <small>Use cached route from localStorage if available.</small>
      <div style={{marginTop:8}}>
        <button onClick={() => { localStorage.removeItem('powerMap_cached_route_v1'); alert('cache cleared'); }} className="ghost">Clear cache</button>
      </div>
    </div>
  );
}
