// src/services/run.ts
export type LatLng = [number, number];

export interface RunPoint {
  lat: number;
  lng: number;
  ts: number;
  accuracy?: number;
  speed?: number | null;
}

export interface RunSummary {
  id: string;
  userId: string;
  startedAt: number;
  endedAt: number;
  durationSec: number;
  distanceM: number;
  points: LatLng[];
}

export interface RunLiveState {
  status: "idle" | "running";
  startedAt: number | null;
  elapsedSec: number;
  distanceM: number;
  paceSecPerKm: number | null;
  lastPoint?: RunPoint;
  path: LatLng[];
}

const STORAGE_PREFIX = "warunner:runs:";

const CFG = {
  maxAccuracyM: 30,
  minStepM: 5,
  minSpeedMps: 0.5,
  maxJumpM: 120,
  maxSpeedMps: 8.5,
};

function haversineMeters(a: RunPoint, b: RunPoint): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function calcPaceSecPerKm(distanceM: number, elapsedSec: number): number | null {
  if (distanceM < 50 || elapsedSec < 10) return null;
  const km = distanceM / 1000;
  if (km <= 0) return null;
  return elapsedSec / km;
}

function normalizePoint(pos: GeolocationPosition): RunPoint {
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    ts: pos.timestamp || Date.now(),
    accuracy: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : undefined,
    speed: pos.coords.speed ?? null,
  };
}

function shouldAccept(prev: RunPoint | undefined, curr: RunPoint) {
  if (curr.accuracy !== undefined && curr.accuracy > CFG.maxAccuracyM) return { ok: false, stepM: 0 };
  if (!prev) return { ok: true, stepM: 0 };

  const dt = (curr.ts - prev.ts) / 1000;
  if (dt <= 0.5) return { ok: false, stepM: 0 };

  const stepM = haversineMeters(prev, curr);
  if (stepM > CFG.maxJumpM) return { ok: false, stepM: 0 };
  if (stepM < CFG.minStepM) return { ok: false, stepM: 0 };

  const inferredSpeed = stepM / dt;
  const speed = curr.speed ?? inferredSpeed;

  if (speed < CFG.minSpeedMps) return { ok: false, stepM: 0 };
  if (speed > CFG.maxSpeedMps) return { ok: false, stepM: 0 };

  return { ok: true, stepM };
}

let watchId: number | null = null;
let timerId: number | null = null;

let live: RunLiveState = {
  status: "idle",
  startedAt: null,
  elapsedSec: 0,
  distanceM: 0,
  paceSecPerKm: null,
  path: [],
};

let lastAccepted: RunPoint | undefined;
let runId: string | null = null;
let userId: string | null = null;

export function getLiveState() {
  return live;
}

export function loadRuns(uid: string): RunSummary[] {
  const raw = localStorage.getItem(STORAGE_PREFIX + uid);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RunSummary[]) : [];
  } catch {
    return [];
  }
}

function saveRun(summary: RunSummary) {
  const key = STORAGE_PREFIX + summary.userId;
  const current = loadRuns(summary.userId);
  const next = [summary, ...current].slice(0, 200);
  localStorage.setItem(key, JSON.stringify(next));
}

export function startRunTracking(opts: {
  userId: string;
  onUpdate: (s: RunLiveState) => void;
  onError?: (msg: string) => void;
}) {
  if (!("geolocation" in navigator)) {
    opts.onError?.("Geolocalização não suportada no navegador.");
    return;
  }
  if (watchId !== null) return;

  userId = opts.userId;
  runId = crypto.randomUUID();
  lastAccepted = undefined;

  live = {
    status: "running",
    startedAt: Date.now(),
    elapsedSec: 0,
    distanceM: 0,
    paceSecPerKm: null,
    path: [],
  };
  opts.onUpdate(live);

  timerId = window.setInterval(() => {
    if (live.status !== "running" || !live.startedAt) return;
    const elapsedSec = Math.floor((Date.now() - live.startedAt) / 1000);
    live = {
      ...live,
      elapsedSec,
      paceSecPerKm: calcPaceSecPerKm(live.distanceM, elapsedSec),
    };
    opts.onUpdate(live);
  }, 1000);

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const curr = normalizePoint(pos);
      const d = shouldAccept(lastAccepted, curr);

      if (d.ok) {
        if (lastAccepted) live = { ...live, distanceM: live.distanceM + d.stepM };
        lastAccepted = curr;
        live = {
          ...live,
          lastPoint: curr,
          path: [...live.path, [curr.lat, curr.lng]],
          paceSecPerKm: calcPaceSecPerKm(live.distanceM, live.elapsedSec),
        };
      } else {
        live = { ...live, lastPoint: curr };
      }

      opts.onUpdate(live);
    },
    (err) => opts.onError?.(err.message || "Erro ao obter localização."),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
  );
}

export function stopRunTracking(opts?: { onUpdate?: (s: RunLiveState) => void }): RunSummary | null {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }

  if (live.status !== "running" || !live.startedAt || !runId || !userId) {
    live = { status: "idle", startedAt: null, elapsedSec: 0, distanceM: 0, paceSecPerKm: null, path: [] };
    opts?.onUpdate?.(live);
    return null;
  }

  const endedAt = Date.now();
  const durationSec = Math.max(0, Math.floor((endedAt - live.startedAt) / 1000));

  const summary: RunSummary = {
    id: runId,
    userId,
    startedAt: live.startedAt,
    endedAt,
    durationSec,
    distanceM: Math.round(live.distanceM),
    points: live.path,
  };

  saveRun(summary);

  // reset
  live = { status: "idle", startedAt: null, elapsedSec: 0, distanceM: 0, paceSecPerKm: null, path: [] };
  lastAccepted = undefined;
  runId = null;
  userId = null;

  opts?.onUpdate?.(live);
  return summary;
}