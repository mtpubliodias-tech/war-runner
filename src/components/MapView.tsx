import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SAO_PAULO_CENTER: [number, number] = [-23.5505, -46.6333];

interface MapViewProps {
  onMapReady?: (map: L.Map) => void;
}

const MapView = ({ onMapReady }: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onMapReadyRef = useRef(onMapReady);
  onMapReadyRef.current = onMapReady;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: SAO_PAULO_CENTER,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png").addTo(map);

    mapRef.current = map;
    setTimeout(() => {
      map.invalidateSize();
      onMapReadyRef.current?.(map);
    }, 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ background: "hsl(0 0% 5%)" }}
    />
  );
};

export default MapView;
