import { motion } from "framer-motion";
import type { TimerMode } from "@/hooks/usePomodoro";

interface Props {
  display: string;
  mode: TimerMode;
  isRunning: boolean;
  progress: number;
}

const modeLabels: Record<TimerMode, string> = {
  pomodoro: "Focus Time",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

export function TimerDisplay({ display, mode, isRunning, progress }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="timer-text text-sm font-body uppercase tracking-widest opacity-80">
        {modeLabels[mode]}
      </p>

      {/* Circular progress */}
      <div className="relative flex items-center justify-center">
        <svg className="w-64 h-64 sm:w-80 sm:h-80 -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="hsla(0,0%,100%,0.15)"
            strokeWidth="4"
          />
          <motion.circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="hsla(0,0%,100%,0.8)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={2 * Math.PI * 90 * (1 - progress)}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>

        <motion.span
          className="absolute timer-text font-display text-7xl sm:text-8xl font-light tracking-tight"
          key={display}
          initial={{ scale: 0.95, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {display}
        </motion.span>
      </div>

      {isRunning && (
        <motion.div
          className="w-2 h-2 rounded-full bg-foreground/60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ background: "hsla(0,0%,100%,0.6)" }}
        />
      )}
    </div>
  );
}
