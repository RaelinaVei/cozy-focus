import { Play, Pause, RotateCcw, Settings } from "lucide-react";

interface Props {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
}

export function TimerControls({ isRunning, onToggle, onReset, onOpenSettings }: Props) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onToggle}
        className="glass rounded-full px-8 py-3 timer-text font-display text-base font-medium flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
      >
        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {isRunning ? "pause" : "start"}
      </button>
      <button
        onClick={onReset}
        className="glass rounded-full p-3 timer-text hover:scale-110 transition-transform active:scale-95"
        title="Reset"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
      <button
        onClick={onOpenSettings}
        className="glass rounded-full p-3 timer-text hover:scale-110 transition-transform active:scale-95"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}
