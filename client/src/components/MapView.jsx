// client/src/components/MapView.jsx
import React from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FitBounds({ latlngs }) {
  const map = useMap();
  React.useEffect(() => {
    if (!latlngs || latlngs.length === 0) return;
    map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
  }, [latlngs, map]);
  return null;
}

const toLatLng = (coords = []) => coords.map(c => [c[1], c[0]]);

export default function MapView({ route, movingPosition }) {
  const coords = route?.features?.[0]?.geometry?.coordinates || [];
  const latlngs = toLatLng(coords);
  const start = latlngs[0];
  const end = latlngs[latlngs.length - 1];

  const center = start || [25.45, 80.33];

  return (
    <MapContainer center={center} zoom={8} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
      {latlngs.length > 0 && <Polyline positions={latlngs} color="#007cc0" weight={5} />}
      {start && <Marker position={start}><Popup>Start</Popup></Marker>}
      {end && <Marker position={end}><Popup>Destination</Popup></Marker>}
      {movingPosition && <Marker position={movingPosition}><Popup>Car</Popup></Marker>}
      <FitBounds latlngs={latlngs} />
    </MapContainer>
  );
}
