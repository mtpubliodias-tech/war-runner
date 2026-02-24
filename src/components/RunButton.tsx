import { Play } from "lucide-react";

interface RunButtonProps {
  onStart: () => void;
}

const RunButton = ({ onStart }: RunButtonProps) => {
  return (
    <button
      onClick={onStart}
      className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-lg tracking-wide uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-pulse-neon"
    >
      <Play className="w-6 h-6 fill-current" />
      Iniciar Corrida
    </button>
  );
};

export default RunButton;
