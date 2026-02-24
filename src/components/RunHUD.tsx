import { formatDuration, formatDistance, formatPace } from "@/services/run";

interface RunHUDProps {
  elapsed: number;
  distance: number;
}

const RunHUD = ({ elapsed, distance }: RunHUDProps) => (
  <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between gap-2">
    <HUDItem label="Tempo" value={formatDuration(elapsed)} />
    <div className="w-px h-8 bg-border" />
    <HUDItem label="Distância" value={formatDistance(distance)} />
    <div className="w-px h-8 bg-border" />
    <HUDItem label="Pace" value={formatPace(elapsed, distance)} />
  </div>
);

const HUDItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center min-w-0">
    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
      {label}
    </span>
    <span className="text-base font-bold font-mono text-foreground tabular-nums">{value}</span>
  </div>
);

export default RunHUD;
