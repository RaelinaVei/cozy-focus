import { motion } from "framer-motion";
import type { TimerMode } from "@/hooks/usePomodoro";

interface Props {
  mode: TimerMode;
  onSwitch: (mode: TimerMode) => void;
}

const modes: { key: TimerMode; label: string }[] = [
  { key: "pomodoro", label: "pomodoro" },
  { key: "shortBreak", label: "short break" },
  { key: "longBreak", label: "long break" },
];

export function ModeSelector({ mode, onSwitch }: Props) {
  return (
    <div className="flex gap-2">
      {modes.map((m) => (
        <button
          key={m.key}
          onClick={() => onSwitch(m.key)}
          className="relative px-5 py-2.5 rounded-full text-sm font-body font-medium transition-colors timer-text"
        >
          {mode === m.key && (
            <motion.div
              layoutId="mode-bg"
              className="absolute inset-0 rounded-full glass"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
