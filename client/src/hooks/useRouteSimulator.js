// client/src/hooks/useRouteSimulator.js
import { useState, useRef, useEffect } from "react";
import { estimateEnergyUsage } from "../utils/energyCalc";

/* small haversine helper */
function haversine(a,b) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(b[0]-a[0]); const dLon = toRad(b[1]-a[1]);
  const lat1 = toRad(a[0]), lat2 = toRad(b[0]);
  const aa = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
}

function buildDistances(coordsLatLon) {
  const cum = [0]; let total=0;
  for (let i=1;i<coordsLatLon.length;i++){
    const seg = haversine(coordsLatLon[i-1], coordsLatLon[i]);
    total += seg; cum.push(total);
  }
  return { cumulativeKm: cum, totalKm: total };
}

export default function useRouteSimulator({ route, batteryState, setBatteryState, auxState }) {
  const [progress, setProgress] = useState(0);
  const [movingPosition, setMovingPosition] = useState(null);
  const [distanceRemaining, setDistanceRemaining] = useState(undefined);
  const [etaRemaining, setEtaRemaining] = useState("—");
  const simRef = useRef(null);
  const watchIdRef = useRef(null);

  function getCoordsLatLon(feature) {
    if (!feature) return [];
    return (feature.features[0].geometry.coordinates || []).map(c => [c[1], c[0]]);
  }

  function findNearestFraction(coordsLatLon, pos) {
    if (!coordsLatLon || coordsLatLon.length < 2) return 0;
    const { cumulativeKm, totalKm } = buildDistances(coordsLatLon);
    let bestDist = Infinity, bestIndex = 0, bestT = 0;
    for (let i=1;i<coordsLatLon.length;i++) {
      const a = coordsLatLon[i-1], b = coordsLatLon[i];
      const vx = b[1]-a[1], vy = b[0]-a[0];
      const wx = pos[1]-a[1], wy = pos[0]-a[0];
      const denom = vx*vx + vy*vy || 1e-9;
      let t = (vx*wx + vy*wy) / denom;
      t = Math.max(0, Math.min(1, t));
      const projLat = a[0] + (b[0]-a[0])*t;
      const projLon = a[1] + (b[1]-a[1])*t;
      const d = haversine([projLat, projLon], pos);
      if (d < bestDist) { bestDist = d; bestIndex = i; bestT = t; }
    }
    const prevKm = cumulativeKm[bestIndex-1];
    const segKm = cumulativeKm[bestIndex] - prevKm || 1e-6;
    const fracKm = prevKm + segKm * bestT;
    return Math.max(0, Math.min(1, fracKm / totalKm));
  }

  function start(usingGps=false) {
    if (!route || !route.features || route.features.length===0) return alert("Select a route first");
    stop(false);
    const coordsLatLon = getCoordsLatLon(route);
    if (coordsLatLon.length < 2) return alert("Route too short");

    const { cumulativeKm, totalKm } = buildDistances(coordsLatLon);
    const realHours = route.features[0].properties.durationHr || Math.max(totalKm/50, 1);
    const realSeconds = Math.max(realHours * 3600, 30);
    const steps = Math.ceil((realSeconds * 1000) / 500);

    // helper to compute energy and live SOC given fraction t
    const computeLive = (t, initialSoc) => {
      const props = route.features[0].properties;
      const auxKw = (auxState.ac ? 1.5 : 0) + (auxState.headlights ? 0.2 : 0) + (auxState.fog ? 0.1 : 0) + (auxState.speakers ? 0.05 : 0) + (auxState.mobile ? 0.05 : 0);
      const energy = estimateEnergyUsage({ distanceKm: props.distanceKm, elevationGainM: props.elevationGainM || 0, traffic: props.traffic || 'moderate' }, auxKw, 25);
      const usedKwhSoFar = energy.totalKwh * t;
      // socNow represents current SOC (initialSoc - usedSoFarPercent)
      const socNow = Math.max(initialSoc - (usedKwhSoFar / batteryState.capacityKWh) * 100, 0);
      const neededKwhRemaining = Math.max(0, energy.totalKwh * (1 - t));
      const projectedRemainingSoc = Math.max(0, socNow - (neededKwhRemaining / batteryState.capacityKWh) * 100);
      return { socNow, energy, neededKwhRemaining, projectedRemainingSoc };
    };

    if (!usingGps) {
      let step = 0;
      const initialSoc = batteryState.socPercent;
      simRef.current = setInterval(() => {
        step++;
        const t = Math.min(1, step/steps);
        setProgress(t);
        const targetKm = totalKm * t;
        let i = 0; while (i < cumulativeKm.length && cumulativeKm[i] < targetKm) i++;
        if (i === 0) i = 1;
        const prevKm = cumulativeKm[i-1];
        const segKm = (cumulativeKm[i] - prevKm) || 1e-6;
        const localT = (targetKm - prevKm) / segKm;
        const a = coordsLatLon[i-1], b = coordsLatLon[Math.min(i, coordsLatLon.length-1)];
        const lat = a[0] + (b[0]-a[0])*localT;
        const lon = a[1] + (b[1]-a[1])*localT;
        const pos = [lat, lon];
        setMovingPosition(pos);

        // compute live SOC and projections
        const { socNow, energy, neededKwhRemaining, projectedRemainingSoc } = computeLive(t, initialSoc);

        // update battery state live (so UI reflects decreasing SOC)
        setBatteryState(prev => ({ ...prev, socPercent: socNow }));

        // update distance remaining & ETA
        setDistanceRemaining(Math.max(0, route.features[0].properties.distanceKm * (1-t)));
        const etaHours = (route.features[0].properties.distanceKm * (1-t)) / (energy.avgSpeed || 40);
        setEtaRemaining(isFinite(etaHours) ? (etaHours*60 < 60 ? `${Math.round(etaHours*60)} min` : `${Math.floor(etaHours)}h ${Math.round((etaHours%1)*60)}m`) : "—");

        // update DOM displays
        const fill = document.getElementById("battery-fill"); if (fill) fill.style.width = `${socNow.toFixed(1)}%`;
        const cur = document.getElementById("current-soc"); if (cur) cur.innerText = `${socNow.toFixed(1)}%`;
        const mpEl = document.getElementById("motor-power"); if (mpEl) mpEl.innerText = `${energy.motorPowerKw.toFixed(2)} kW`;
        const neededEl = document.getElementById("projected-needed"); if (neededEl) neededEl.innerText = `${neededKwhRemaining.toFixed(2)} kWh`;
        const projEl = document.getElementById("projected-remaining"); if (projEl) projEl.innerText = `${projectedRemainingSoc.toFixed(1)}%`;

        if (t >= 1) {
          stop(true);
        }
      }, 500);
    } else {
      // GPS mode: watchPosition
      if (!navigator.geolocation) return alert("Geolocation not available");
      const initialSoc = batteryState.socPercent;
      watchIdRef.current = navigator.geolocation.watchPosition((p) => {
        const pos = [p.coords.latitude, p.coords.longitude];
        setMovingPosition(pos);
        const frac = findNearestFraction(coordsLatLon, pos);
        setProgress(frac);

        const { socNow, energy, neededKwhRemaining, projectedRemainingSoc } = computeLive(frac, initialSoc);
        setBatteryState(prev => ({ ...prev, socPercent: socNow }));

        setDistanceRemaining(Math.max(0, route.features[0].properties.distanceKm * (1-frac)));
        const etaHours = (route.features[0].properties.distanceKm * (1-frac)) / (energy.avgSpeed || 40);
        setEtaRemaining(isFinite(etaHours) ? (etaHours*60 < 60 ? `${Math.round(etaHours*60)} min` : `${Math.floor(etaHours)}h ${Math.round((etaHours%1)*60)}m`) : "—");

        const fill = document.getElementById("battery-fill"); if (fill) fill.style.width = `${socNow.toFixed(1)}%`;
        const cur = document.getElementById("current-soc"); if (cur) cur.innerText = `${socNow.toFixed(1)}%`;
        const mpEl = document.getElementById("motor-power"); if (mpEl) mpEl.innerText = `${energy.motorPowerKw.toFixed(2)} kW`;
        const neededEl = document.getElementById("projected-needed"); if (neededEl) neededEl.innerText = `${neededKwhRemaining.toFixed(2)} kWh`;
        const projEl = document.getElementById("projected-remaining"); if (projEl) projEl.innerText = `${projectedRemainingSoc.toFixed(1)}%`;

        if ((route.features[0].properties.distanceKm * (1-frac)) < 0.05) {
          stop(true);
        }
      }, (err) => {
        console.warn("GPS watch error", err);
        alert("GPS error: " + err.message);
      }, { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 });
    }
  }

  function stop(commit=false) {
    if (simRef.current) { clearInterval(simRef.current); simRef.current = null; }
    if (watchIdRef.current && navigator.geolocation) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    if (commit && route) {
      // final commit already mostly applied during run; we can keep as-is
    }
    setProgress(0);
    setMovingPosition(null);
    setDistanceRemaining(undefined);
    setEtaRemaining("—");
    const mpEl = document.getElementById("motor-power");
    if (mpEl) mpEl.innerText = `— kW`;
    const neededEl = document.getElementById("projected-needed"); if (neededEl) neededEl.innerText = `— kWh`;
    const projEl = document.getElementById("projected-remaining"); if (projEl) projEl.innerText = `—%`;
  }

  useEffect(() => {
    return () => {
      if (simRef.current) clearInterval(simRef.current);
      if (watchIdRef.current && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  return { start, stop, progress, movingPosition, distanceRemaining, etaRemaining };
}
