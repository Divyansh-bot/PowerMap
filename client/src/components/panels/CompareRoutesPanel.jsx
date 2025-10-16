// client/src/components/panels/CompareRoutesPanel.jsx
import React, { useState } from "react";
import { fetchRoutesAndRankByEnergy } from "../../clientHelpers";

export default function CompareRoutesPanel({ auxState, onAuxChange, onSelectRoute }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  const computeAuxKw = () => {
    return (auxState.ac ? 1.5 : 0) + (auxState.headlights ? 0.2 : 0) + (auxState.fog ? 0.1 : 0) + (auxState.speakers ? 0.05 : 0) + (auxState.mobile ? 0.05 : 0);
  };

  async function analyze() {
    if (!from || !to) return alert("Enter both From and To");
    setLoading(true);
    try {
      const auxKw = computeAuxKw();
      const res = await fetchRoutesAndRankByEnergy(from, to, auxKw);
      setRoutes(res);
    } catch (e) {
      alert("Analyze failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition((p) => {
      setFrom(`${p.coords.latitude}, ${p.coords.longitude}`);
    }, (err) => alert(err.message), { enableHighAccuracy: true });
  }

  return (
    <div style={{width:360, background:"#fff", borderRadius:12, padding:12, boxShadow:"0 8px 24px rgba(2,6,23,0.12)"}}>
      <h3>Find & Compare Routes</h3>

      <input placeholder="From (address or coords)" value={from} onChange={(e)=>setFrom(e.target.value)} style={{padding:8,borderRadius:8,border:"1px solid #ddd", width:"100%"}} />
      <input placeholder="To (address or place)" value={to} onChange={(e)=>setTo(e.target.value)} style={{padding:8,borderRadius:8,border:"1px solid #ddd", width:"100%", marginTop:8}} />

      <div style={{display:"flex", gap:8, marginTop:8}}>
        <button className="primary" onClick={analyze} disabled={loading}>{loading ? "Analyzing..." : "Analyze"}</button>
        <button className="ghost" onClick={useMyLocation}>Use my location</button>
      </div>

      <div style={{marginTop:10}}>
        <div style={{fontWeight:600}}>Aux loads</div>
        <div style={{display:"flex", gap:8, marginTop:6, flexWrap:"wrap"}}>
          <label style={{display:"flex", alignItems:"center", gap:6}}><input type="checkbox" checked={auxState.ac} onChange={() => onAuxChange({...auxState, ac: !auxState.ac})} />AC</label>
          <label style={{display:"flex", alignItems:"center", gap:6}}><input type="checkbox" checked={auxState.headlights} onChange={() => onAuxChange({...auxState, headlights: !auxState.headlights})} />Headlights</label>
          <label style={{display:"flex", alignItems:"center", gap:6}}><input type="checkbox" checked={auxState.fog} onChange={() => onAuxChange({...auxState, fog: !auxState.fog})} />Fog</label>
          <label style={{display:"flex", alignItems:"center", gap:6}}><input type="checkbox" checked={auxState.speakers} onChange={() => onAuxChange({...auxState, speakers: !auxState.speakers})} />Speakers</label>
          <label style={{display:"flex", alignItems:"center", gap:6}}><input type="checkbox" checked={auxState.mobile} onChange={() => onAuxChange({...auxState, mobile: !auxState.mobile})} />Mobile</label>
        </div>
      </div>

      <div style={{marginTop:12, maxHeight:300, overflow:"auto"}}>
        {routes.length === 0 && <div className="small">No routes — click Analyze</div>}
        {routes.map((r, i) => (
          <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, padding:8, borderRadius:8, background: i===0?"#eef8ff":"#f9fbff", marginBottom:8}}>
            <div>
              <div style={{fontWeight:700}}>Option {i+1}{i===0 && <span style={{color:"#0b6aa6", marginLeft:8}}> (most efficient)</span>}</div>
              <div style={{fontSize:13, color:"#333"}}>{r.distanceKm.toFixed(1)} km • {(r.durationHr*60).toFixed(0)} min • {Math.round(r.avgSpeed)} km/h</div>
              <div style={{fontSize:12, color:"#666"}}>Energy: {r.totalKwh.toFixed(2)} kWh • Drive: {r.driveKwh.toFixed(2)} kWh • Aux: {r.auxKwh.toFixed(2)} kWh</div>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:6}}>
              <button className="primary" onClick={() => onSelectRoute(r.feature)}>Select</button>
              <button className="ghost" onClick={() => onSelectRoute(r.feature)}>Preview</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
