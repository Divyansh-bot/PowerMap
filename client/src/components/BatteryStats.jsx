// client/src/BatteryStats.jsx
import React, { useEffect } from "react";
import { estimateEnergyUsage } from "../utils/energyCalc";

export default function BatteryStats({ route, auxState, batteryState, setBatteryState, simProgress, distanceRemaining, etaRemaining }) {
  useEffect(() => {
    // compute when route or aux changes
    if (!route || !route.features || route.features.length === 0) {
      document.getElementById("route-info").innerText = `Distance: — km • Est energy: — kWh`;
      document.getElementById("stat-drive").innerText = `Drive: — kWh`;
      document.getElementById("stat-aux").innerText = `Aux: — kWh`;
      document.getElementById("stat-total").innerText = `Total: — kWh`;
      const neededEl = document.getElementById("projected-needed"); if (neededEl) neededEl.innerText = `— kWh`;
      const projEl = document.getElementById("projected-remaining"); if (projEl) projEl.innerText = `—%`;
      return;
    }
    const props = route.features[0].properties;
    const auxKw = (auxState.ac ? 1.5 : 0) + (auxState.headlights ? 0.2 : 0) + (auxState.fog ? 0.1 : 0) + (auxState.speakers ? 0.05 : 0) + (auxState.mobile ? 0.05 : 0);
    const energy = estimateEnergyUsage({ distanceKm: props.distanceKm, elevationGainM: props.elevationGainM || 0, traffic: props.traffic || 'moderate' }, auxKw, 25);

    // show basic numbers
    document.getElementById("route-info").innerText = `Distance: ${props.distanceKm.toFixed(1)} km • Est energy: ${energy.totalKwh.toFixed(2)} kWh`;
    document.getElementById("stat-drive").innerText = `Drive: ${energy.driveEnergy.toFixed(2)} kWh`;
    document.getElementById("stat-aux").innerText = `Aux: ${energy.auxEnergy.toFixed(2)} kWh`;
    document.getElementById("stat-total").innerText = `Total: ${energy.totalKwh.toFixed(2)} kWh`;

    // projected when not moving: needed is full energy, projected remaining uses current SOC
    const neededKwh = energy.totalKwh;
    const projectedRemaining = Math.max(0, batteryState.socPercent - (neededKwh / batteryState.capacityKWh) * 100);

    const neededEl = document.getElementById("projected-needed"); if (neededEl) neededEl.innerText = `${neededKwh.toFixed(2)} kWh`;
    const projEl = document.getElementById("projected-remaining"); if (projEl) projEl.innerText = `${projectedRemaining.toFixed(1)}%`;
  }, [route, auxState, batteryState]);

  useEffect(() => {
    // update dynamic soc, remaining, eta from props
    const cur = batteryState.socPercent;
    const curEl = document.getElementById("current-soc");
    if (curEl) curEl.innerText = `${cur.toFixed(1)}%`;
    const fill = document.getElementById("battery-fill");
    if (fill) fill.style.width = `${cur.toFixed(1)}%`;
    if (fill) fill.style.background = cur > 60 ? '#10B981' : cur > 30 ? '#F59E0B' : '#EF4444';

    if (typeof distanceRemaining !== "undefined") {
      const dr = document.getElementById("distance-remaining");
      if (dr) dr.innerText = `${distanceRemaining.toFixed(1)} km`;
    }
    const eta = document.getElementById("eta-remaining");
    if (eta) eta.innerText = etaRemaining || "—";
  }, [batteryState, simProgress, distanceRemaining, etaRemaining]);

  return null;
}
