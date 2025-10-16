// client/src/components/panels/PowerControlsPanel.jsx
import React from "react";

export default function PowerControlsPanel({ auxState, setAuxState }) {
  return (
    <div>
      <h3>Power Controls</h3>
      <label><input type="checkbox" checked={auxState.ac} onChange={() => setAuxState(s => ({...s, ac: !s.ac}))}/> AC / Heater</label>
      <label><input type="checkbox" checked={auxState.headlights} onChange={() => setAuxState(s => ({...s, headlights: !s.headlights}))}/> Headlights</label>
      <label><input type="checkbox" checked={auxState.fog} onChange={() => setAuxState(s => ({...s, fog: !s.fog}))}/> Fog</label>
      <label><input type="checkbox" checked={auxState.speakers} onChange={() => setAuxState(s => ({...s, speakers: !s.speakers}))}/> Speakers</label>
      <label><input type="checkbox" checked={auxState.mobile} onChange={() => setAuxState(s => ({...s, mobile: !s.mobile}))}/> Mobile Charge</label>
    </div>
  );
}
