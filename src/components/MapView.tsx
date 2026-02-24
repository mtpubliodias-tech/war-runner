import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const SAO_PAULO_CENTER: [number, number] = [-23.5505, -46.6333];

const MapView = () => {
  return (
    <div className="absolute inset-0">
      <MapContainer
        center={SAO_PAULO_CENTER}
        zoom={14}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
        style={{ background: "hsl(0 0% 5%)" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
      </MapContainer>
    </div>
  );
};

export default MapView;
