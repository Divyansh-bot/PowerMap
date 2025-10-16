// client/src/demo/demoRoute.js
export default {
  type: "FeatureCollection",
  features: [{
    type: "Feature",
    properties: {
      distanceKm: 208,
      durationHr: 1.1,
      elevationGainM: 430,
      traffic: "moderate"
    },
    geometry: {
      type: "LineString",
      coordinates: [
        [80.3319,26.4499],
        [80.5,26.25],
        [81.0,26.0],
        [81.4,25.8],
        [81.8463,25.4358]
      ]
    }
  }]
};
