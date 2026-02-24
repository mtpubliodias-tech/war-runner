export interface RunRecord {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  distance: number; // meters
  duration: number; // seconds
  path: [number, number][];
}

const STORAGE_KEY = "warunner_runs";

export const saveRun = (run: RunRecord) => {
  const runs = getRuns();
  runs.push(run);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
};

export const getRuns = (): RunRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Haversine distance in meters
export const haversineDistance = (
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
): number => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
};

export const formatPace = (seconds: number, meters: number): string => {
  if (meters < 10) return "--:--";
  const paceSecsPerKm = seconds / (meters / 1000);
  const m = Math.floor(paceSecsPerKm / 60);
  const s = Math.floor(paceSecsPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")} /km`;
};
