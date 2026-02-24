import { formatDuration, formatDistance, formatPace } from "@/services/run";

interface RunSummaryProps {
  elapsed: number;
  distance: number;
  onClose: () => void;
}

const RunSummary = ({ elapsed, distance, onClose }: RunSummaryProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6">
    <div className="glass rounded-3xl p-6 w-full max-w-sm space-y-5">
      <h2 className="text-xl font-bold font-display text-primary neon-text text-center">
        Corrida Finalizada 🏁
      </h2>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Tempo" value={formatDuration(elapsed)} />
        <Stat label="Distância" value={formatDistance(distance)} />
        <Stat label="Pace" value={formatPace(elapsed, distance)} />
      </div>

      <button
        onClick={onClose}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base uppercase tracking-wide neon-glow"
      >
        Fechar
      </button>
    </div>
  </div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{label}</p>
    <p className="text-lg font-bold font-mono text-foreground tabular-nums">{value}</p>
  </div>
);

export default RunSummary;
