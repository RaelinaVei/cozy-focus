import { useState, useEffect, useCallback, useRef } from "react";

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

export interface PomodoroSettings {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  sessionsBeforeLongBreak: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsBeforeLongBreak: 4,
};

export function usePomodoro() {
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const saved = localStorage.getItem("pomodoro-settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(settings.focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getTimeForMode = useCallback(
    (m: TimerMode) => {
      switch (m) {
        case "pomodoro": return settings.focusTime * 60;
        case "shortBreak": return settings.shortBreakTime * 60;
        case "longBreak": return settings.longBreakTime * 60;
      }
    },
    [settings]
  );

  useEffect(() => {
    localStorage.setItem("pomodoro-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Auto advance
            if (mode === "pomodoro") {
              const newCompleted = completedSessions + 1;
              setCompletedSessions(newCompleted);
              if (newCompleted % settings.sessionsBeforeLongBreak === 0) {
                setMode("longBreak");
                return settings.longBreakTime * 60;
              } else {
                setMode("shortBreak");
                return settings.shortBreakTime * 60;
              }
            } else {
              setMode("pomodoro");
              return settings.focusTime * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, completedSessions, settings]);

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      setMode(newMode);
      setTimeLeft(getTimeForMode(newMode));
      setIsRunning(false);
    },
    [getTimeForMode]
  );

  const toggleTimer = useCallback(() => setIsRunning((p) => !p), []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(getTimeForMode(mode));
  }, [getTimeForMode, mode]);

  const updateSettings = useCallback(
    (newSettings: PomodoroSettings) => {
      setSettings(newSettings);
      setIsRunning(false);
      // Reset time for current mode with new settings
      switch (mode) {
        case "pomodoro": setTimeLeft(newSettings.focusTime * 60); break;
        case "shortBreak": setTimeLeft(newSettings.shortBreakTime * 60); break;
        case "longBreak": setTimeLeft(newSettings.longBreakTime * 60); break;
      }
    },
    [mode]
  );

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return {
    mode, switchMode, display, isRunning, toggleTimer, resetTimer,
    settings, updateSettings, completedSessions, timeLeft,
    totalTime: getTimeForMode(mode),
  };
}
