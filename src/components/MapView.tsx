import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SAO_PAULO_CENTER: [number, number] = [-23.5505, -46.6333];

type LatLng = [number, number];

interface MapViewProps {
  path?: LatLng[];
  current?: LatLng | null;
}

const MapView = ({ path = [], current = null }: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const polyRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);

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
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // polyline
    if (!polyRef.current) {
      polyRef.current = L.polyline([], { weight: 4, opacity: 0.9, color: "#C9FF47" }).addTo(map);
    }
    polyRef.current.setLatLngs(path as any);

    // marker
    if (current) {
      if (!markerRef.current) {
        markerRef.current = L.circleMarker(current, { radius: 7, weight: 2, color: "#C9FF47", fillOpacity: 0.8 }).addTo(map);
      } else {
        markerRef.current.setLatLng(current as any);
      }
    }

    // optional: keep view near current
    // if (current) map.panTo(current as any, { animate: true });
  }, [path, current]);

  return <div ref={containerRef} className="absolute inset-0 z-0" style={{ background: "hsl(0 0% 5%)" }} />;
};

export default MapView;