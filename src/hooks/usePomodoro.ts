import { useState, useEffect, useCallback, useRef } from "react";

const playNotificationSound = (type: "focus" | "break") => {
  try {
    const ctx = new AudioContext();

    const playTone = (freq: number, start: number, duration: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(vol, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    if (type === "break") {
      // Pleasant ascending chime — loud & clear
      playTone(523.25, 0, 0.4, 0.8);    // C5
      playTone(659.25, 0.2, 0.4, 0.8);  // E5
      playTone(783.99, 0.4, 0.5, 0.9);  // G5
      playTone(1046.5, 0.6, 0.6, 0.7);  // C6
    } else {
      // Energetic descending chime — attention-grabbing
      playTone(1046.5, 0, 0.4, 0.9);    // C6
      playTone(783.99, 0.2, 0.4, 0.8);  // G5
      playTone(659.25, 0.4, 0.4, 0.8);  // E5
      playTone(523.25, 0.6, 0.5, 0.7);  // C5
    }
  } catch (e) {
    // Audio not available
  }
};

const showNotification = (title: string, body: string) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  } else if ("Notification" in window && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
};

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

export function usePomodoro(onSessionComplete?: (focusMinutes: number) => void) {
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const saved = localStorage.getItem("pomodoro-settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(settings.focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onSessionCompleteRef = useRef(onSessionComplete);
  onSessionCompleteRef.current = onSessionComplete;

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
            if (mode === "pomodoro") {
              const newCompleted = completedSessions + 1;
              setCompletedSessions(newCompleted);
              onSessionCompleteRef.current?.(settings.focusTime);
              playNotificationSound("break");
              if (newCompleted % settings.sessionsBeforeLongBreak === 0) {
                showNotification("🎉 Time for a long break!", `Great job! You completed ${newCompleted} sessions. Take a ${settings.longBreakTime} min break.`);
                setMode("longBreak");
                return settings.longBreakTime * 60;
              } else {
                showNotification("☕ Break time!", `Session complete! Take a ${settings.shortBreakTime} min break.`);
                setMode("shortBreak");
                return settings.shortBreakTime * 60;
              }
            } else {
              playNotificationSound("focus");
              showNotification("📚 Focus time!", "Break's over — let's get back to work!");
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
