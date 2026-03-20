import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sun, Moon, Palette } from "lucide-react";
import type { PomodoroSettings } from "@/hooks/usePomodoro";
import type { ThemeOption } from "@/hooks/useTheme";

interface Props {
  open: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
  onUpdateSettings: (s: PomodoroSettings) => void;
  themes: ThemeOption[];
  currentThemeId: string;
  onSelectTheme: (id: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function SettingsPanel({
  open, onClose, settings, onUpdateSettings,
  themes, currentThemeId, onSelectTheme, isDark, onToggleDark,
}: Props) {
  const [local, setLocal] = useState(settings);

  const handleSave = () => {
    onUpdateSettings(local);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 theme-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-x-4 bottom-4 sm:inset-auto sm:right-8 sm:bottom-8 sm:w-96 z-50 glass rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-foreground">Settings</h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-accent transition-colors">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Dark mode toggle */}
            <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-secondary">
              <div className="flex items-center gap-2 text-sm font-body text-foreground">
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {isDark ? "Dark Mode" : "Light Mode"}
              </div>
              <button
                onClick={onToggleDark}
                className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-primary-foreground"
                  animate={{ left: isDark ? "26px" : "2px" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Timer settings */}
            <div className="space-y-4 mb-6">
              <h4 className="text-xs font-display uppercase tracking-wider text-muted-foreground">Timer</h4>
              {([
                { label: "Focus (min)", key: "focusTime" as const, min: 1, max: 120 },
                { label: "Short Break (min)", key: "shortBreakTime" as const, min: 1, max: 30 },
                { label: "Long Break (min)", key: "longBreakTime" as const, min: 1, max: 60 },
                { label: "Sessions before long break", key: "sessionsBeforeLongBreak" as const, min: 1, max: 10 },
              ]).map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <label className="text-sm font-body text-foreground">{item.label}</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLocal((p) => ({ ...p, [item.key]: Math.max(item.min, p[item.key] - 1) }))}
                      className="w-8 h-8 rounded-lg bg-secondary text-foreground font-display text-lg flex items-center justify-center hover:bg-accent transition-colors"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-display text-foreground font-semibold">{local[item.key]}</span>
                    <button
                      onClick={() => setLocal((p) => ({ ...p, [item.key]: Math.min(item.max, p[item.key] + 1) }))}
                      className="w-8 h-8 rounded-lg bg-secondary text-foreground font-display text-lg flex items-center justify-center hover:bg-accent transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Themes */}
            <div className="mb-6">
              <h4 className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
                <Palette className="w-3 h-3" /> Themes
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTheme(t.id)}
                    className={`relative rounded-xl overflow-hidden aspect-video group transition-all ${
                      currentThemeId === t.id ? "ring-2 ring-primary scale-105" : "hover:scale-105"
                    }`}
                  >
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1.5">
                      <span className="text-[10px] font-body timer-text">{t.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Save Settings
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
