import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import MapView from "@/components/MapView";
import RunButton from "@/components/RunButton";
import RunHUD from "@/components/RunHUD";
import RunSummary from "@/components/RunSummary";
import { LogOut, User, Square } from "lucide-react";
import { logout, getStoredUser } from "@/services/auth";
import { haversineDistance, saveRun, type RunRecord } from "@/services/run";

const NEON_GREEN = "#C9FF47";

const HomeScreen = () => {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const mapInstanceRef = useRef<L.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const pathRef = useRef<[number, number][]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const summaryDataRef = useRef({ elapsed: 0, distance: 0 });

  // Protect route
  useEffect(() => {
    if (!getStoredUser()) navigate("/", { replace: true });
  }, [navigate]);

  const handleMapReady = useCallback((map: L.Map) => {
    mapInstanceRef.current = map;
  }, []);

  const handleStartRun = () => {
    if (!navigator.geolocation) {
      alert("Geolocation não suportada neste navegador.");
      return;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    pathRef.current = [];
    setDistance(0);
    setElapsed(0);
    setRunning(true);
    startTimeRef.current = Date.now();

    // Timer
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Polyline
    polylineRef.current = L.polyline([], {
      color: NEON_GREEN,
      weight: 4,
      opacity: 0.9,
    }).addTo(map);

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        const path = pathRef.current;

        if (path.length > 0) {
          const d = haversineDistance(path[path.length - 1], latlng);
          if (d > 2) {
            // ignore noise < 2m
            setDistance((prev) => prev + d);
          }
        }

        path.push(latlng);
        polylineRef.current?.addLatLng(latlng);
        map.panTo(latlng);

        // Update marker
        if (markerRef.current) {
          markerRef.current.setLatLng(latlng);
        } else {
          markerRef.current = L.circleMarker(latlng, {
            radius: 8,
            color: NEON_GREEN,
            fillColor: NEON_GREEN,
            fillOpacity: 1,
            weight: 2,
          }).addTo(map);
        }
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
  };

  const handleStopRun = () => {
    // Stop watching
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const finalElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setElapsed(finalElapsed);
    setRunning(false);

    summaryDataRef.current = { elapsed: finalElapsed, distance };
    setShowSummary(true);

    // Save run
    const user = getStoredUser();
    if (user) {
      const record: RunRecord = {
        id: crypto.randomUUID(),
        userId: user.id,
        startTime: new Date(startTimeRef.current).toISOString(),
        endTime: new Date().toISOString(),
        distance,
        duration: finalElapsed,
        path: [...pathRef.current],
      };
      saveRun(record);
    }
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    // Clean map overlays
    polylineRef.current?.remove();
    polylineRef.current = null;
    markerRef.current?.remove();
    markerRef.current = null;
    setDistance(0);
    setElapsed(0);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="relative flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
        <h2 className="text-xl font-bold font-display tracking-tight text-primary neon-text">
          WA<span className="text-foreground">Runner</span>
        </h2>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full bg-secondary text-foreground">
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* HUD */}
      {running && (
        <div className="relative z-10 px-5 pb-2">
          <RunHUD elapsed={elapsed} distance={distance} />
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        <MapView onMapReady={handleMapReady} />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
      </div>

      {/* Bottom action */}
      <div className="relative z-10 px-5 pb-8 pt-2">
        {running ? (
          <button
            onClick={handleStopRun}
            className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-destructive text-destructive-foreground font-display font-bold text-lg tracking-wide uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Square className="w-6 h-6 fill-current" />
            Encerrar Corrida
          </button>
        ) : (
          <RunButton onStart={handleStartRun} />
        )}
      </div>

      {/* Summary modal */}
      {showSummary && (
        <RunSummary
          elapsed={summaryDataRef.current.elapsed}
          distance={summaryDataRef.current.distance}
          onClose={handleCloseSummary}
        />
      )}
    </div>
  );
};

export default HomeScreen;
