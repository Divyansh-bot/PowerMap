// client/src/App.jsx
import React, { useState } from "react";
import MapView from "./components/MapView";
import CompareRoutesPanel from "./components/panels/CompareRoutesPanel";
import BatteryStats from "./components/BatteryStats";
import useRouteSimulator from "./hooks/useRouteSimulator";
import "./styles/globals.css";

export default function App() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [auxState, setAuxState] = useState({
    ac: true, headlights: false, fog: false, speakers: false, mobile: false
  });
  const [batteryState, setBatteryState] = useState({ capacityKWh: 60, socPercent: 100 });

  const routeSim = useRouteSimulator({
    route: selectedRoute,
    batteryState,
    setBatteryState,
    auxState
  });

  return (
    <div style={{height:"100vh", width:"100vw", position:"relative"}}>
      <div className="topbar">
        <div className="brand" style={{paddingLeft:12}}>PowerMap — Real-time Demo</div>
        <div style={{marginLeft:"auto", paddingRight:12, color:"#fff", fontSize:13}}>Search → Select route → Start (Sim or GPS)</div>
      </div>

      <MapView route={selectedRoute} movingPosition={routeSim.movingPosition} />

      {/* Right: Compare/Search panel */}
      <div style={{position:"fixed", right:14, top:90, zIndex:10050}}>
        <CompareRoutesPanel
          auxState={auxState}
          onAuxChange={setAuxState}
          onSelectRoute={(f) => {
            setSelectedRoute(f);
            routeSim.stop(false);
          }}
        />
      </div>

      {/* Left: Controls */}
      <div style={{position:"fixed", left:14, top:90, zIndex:10050, display:"flex", flexDirection:"column", gap:8}}>
        <button className="tb-btn" onClick={() => routeSim.start(false)} disabled={!selectedRoute}>Start Simulation</button>
        <button className="tb-btn" onClick={() => routeSim.stop(false)}>Stop</button>
        <button className="tb-btn" onClick={() => {
          if (!selectedRoute) return alert("Select a route first");
          const ok = confirm("Start real-time GPS tracking (your device will share location)?");
          if (ok) routeSim.start(true); // GPS mode
        }} disabled={!selectedRoute}>Start GPS Mode</button>
      </div>

      {/* Battery card (keeps same DOM ids used by BatteryStats) */}
      <div className="battery-card" style={{zIndex:10060}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:700}}>Battery</div>
            <div id="route-info" style={{fontSize:13,color:"#555"}}>Distance: — km • Est energy: — kWh</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div id="current-soc" style={{fontSize:18,fontWeight:700}}>{batteryState.socPercent}%</div>
            <div style={{fontSize:12,color:"#777"}}>Motor: <span id="motor-power">— kW</span></div>
          </div>
        </div>

        <div className="battery-bar" style={{marginTop:8}}>
          <div id="battery-fill" className="battery-fill" style={{width: `${batteryState.socPercent}%`}}></div>
        </div>

        <div style={{display:"flex", justifyContent:"space-between", marginTop:8}}>
          <div>Distance remaining: <strong id="distance-remaining">— km</strong></div>
          <div>ETA: <strong id="eta-remaining">—</strong></div>
        </div>

        <div style={{display:"flex", gap:8, marginTop:10}}>
          <div className="stat" id="stat-drive">Drive: — kWh</div>
          <div className="stat" id="stat-aux">Aux: — kWh</div>
          <div className="stat" id="stat-total">Total: — kWh</div>
        </div>

        <div style={{display:"flex", justifyContent:"space-between", marginTop:10, fontSize:13}}>
          <div>Needed to destination: <strong id="projected-needed">— kWh</strong></div>
          <div>Projected remaining: <strong id="projected-remaining">—%</strong></div>
        </div>
      </div>

      {/* BatteryStats react component keeps values updated */}
      <BatteryStats
        route={selectedRoute}
        auxState={auxState}
        batteryState={batteryState}
        setBatteryState={setBatteryState}
        simProgress={routeSim.progress}
        distanceRemaining={routeSim.distanceRemaining}
        etaRemaining={routeSim.etaRemaining}
      />
    </div>
  );
}
