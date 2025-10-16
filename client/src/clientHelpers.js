// client/src/clientHelpers.js
import { estimateEnergyUsage } from "./utils/energyCalc";

/** Geocode with Nominatim */
export async function geocode(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' }});
  const data = await res.json();
  if (!data || data.length === 0) throw new Error("No geocode result");
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: data[0].display_name };
}

/** Fetch alternatives from OSRM and rank by energy using auxKw */
export async function fetchRoutesAndRankByEnergy(fromQ, toQ, auxKw = 0) {
  const from = await geocode(fromQ);
  const to = await geocode(toQ);
  const base = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}`;
  const url = `${base}?overview=full&alternatives=true&geometries=geojson&steps=false`;
  const res = await fetch(url);
  const j = await res.json();
  if (!j || !j.routes) return [];
  const results = await Promise.all(j.routes.map(async (r) => {
    const distanceKm = r.distance / 1000;
    const durationHr = r.duration / 3600;
    const avgSpeed = distanceKm / Math.max(durationHr, 1/60);
    const elevationGainM = 0; // best-effort: skip heavy elevation fetch
    const energy = estimateEnergyUsage({ distanceKm, elevationGainM, traffic: 'moderate' }, auxKw, 25);
    const feature = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: { distanceKm, durationHr, elevationGainM, traffic: 'moderate', avgSpeed },
        geometry: r.geometry
      }]
    };
    return {
      feature,
      distanceKm,
      durationHr,
      avgSpeed,
      totalKwh: energy.totalKwh,
      driveKwh: energy.driveEnergy,
      auxKwh: energy.auxEnergy
    };
  }));
  results.sort((a,b) => a.totalKwh - b.totalKwh);
  return results;
}
