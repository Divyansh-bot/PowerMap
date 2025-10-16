// simple mock route data (geojson line + meta)
const demoRoute = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        distanceKm: 208,
        durationHr: 3.3,
        elevationGainM: 430,
        traffic: "moderate"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [80.3319, 26.4499], // Kanpur-ish
          [81.8463, 25.4358]  // Prayagraj-ish
        ]
      }
    }
  ]
};
export default demoRoute;
