// client/src/utils/energyCalc.js
export function estimateEnergyUsage({ distanceKm = 0, elevationGainM = 0, traffic = "low" }, auxPowerKw = 0, tempC = 25) {
  const baseKwhPerKm = 0.18;
  const slopePenalty = (elevationGainM / Math.max(distanceKm,1)) * 0.0015;
  const trafficPenalty = traffic === 'heavy' ? 0.03 : (traffic === 'moderate' ? 0.015 : 0);
  const tempPenalty = (tempC < 10 || tempC > 35) ? 0.02 : 0;
  const consumptionPerKm = baseKwhPerKm + slopePenalty + trafficPenalty + tempPenalty;
  const driveEnergy = consumptionPerKm * distanceKm;
  const avgSpeed = Math.max(distanceKm / 3, 40);
  const tripHours = distanceKm / avgSpeed;
  const auxEnergy = auxPowerKw * tripHours;
  const total = driveEnergy + auxEnergy;
  return { totalKwh: total, driveEnergy, auxEnergy, consumptionPerKm, avgSpeed, tripHours };
}
