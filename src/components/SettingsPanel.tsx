import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sun, Moon, Palette, Upload, Trash2, Image, Gamepad2, Sparkles } from "lucide-react";
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
  customBg: string | null;
  onCustomUpload: (file: File) => void;
  onClearCustomBg: () => void;
}

export function SettingsPanel({
  open, onClose, settings, onUpdateSettings,
  themes, currentThemeId, onSelectTheme, isDark, onToggleDark,
  customBg, onCustomUpload, onClearCustomBg,
}: Props) {
  const [local, setLocal] = useState(settings);
  const [themeTab, setThemeTab] = useState<"aesthetic" | "gaming">("aesthetic");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdateSettings(local);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onCustomUpload(file);
  };

  const filteredThemes = themes.filter((t) => t.category === themeTab);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-x-4 bottom-4 sm:inset-auto sm:right-8 sm:bottom-8 sm:w-[440px] z-50 rounded-2xl p-6 max-h-[85vh] overflow-y-auto bg-card border border-border shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-card-foreground">Settings</h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-accent transition-colors">
                <X className="w-5 h-5 text-card-foreground" />
              </button>
            </div>

            {/* Dark mode toggle */}
            <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-secondary">
              <div className="flex items-center gap-2 text-sm font-body text-secondary-foreground">
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {isDark ? "Dark Mode" : "Light Mode"}
              </div>
              <button
                onClick={onToggleDark}
                className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-card"
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
                  <label className="text-sm font-body text-card-foreground">{item.label}</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLocal((p) => ({ ...p, [item.key]: Math.max(item.min, p[item.key] - 1) }))}
                      className="w-8 h-8 rounded-lg bg-secondary text-secondary-foreground font-display text-lg flex items-center justify-center hover:bg-accent transition-colors"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-display text-card-foreground font-semibold">{local[item.key]}</span>
                    <button
                      onClick={() => setLocal((p) => ({ ...p, [item.key]: Math.min(item.max, p[item.key] + 1) }))}
                      className="w-8 h-8 rounded-lg bg-secondary text-secondary-foreground font-display text-lg flex items-center justify-center hover:bg-accent transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Themes with category tabs */}
            <div className="mb-6">
              <h4 className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
                <Palette className="w-3 h-3" /> Themes
              </h4>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setThemeTab("aesthetic")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${
                    themeTab === "aesthetic" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  <Sparkles className="w-3 h-3" /> Aesthetic
                </button>
                <button
                  onClick={() => setThemeTab("gaming")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${
                    themeTab === "gaming" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  <Gamepad2 className="w-3 h-3" /> Gaming
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {filteredThemes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTheme(t.id)}
                    className={`relative rounded-xl overflow-hidden aspect-video group transition-all ${
                      currentThemeId === t.id ? "ring-2 ring-primary scale-105" : "hover:scale-105"
                    }`}
                  >
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1">
                      <span className="text-[8px] font-body text-white leading-tight">{t.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom background upload */}
            <div className="mb-6">
              <h4 className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
                <Image className="w-3 h-3" /> Custom Background
              </h4>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {customBg ? (
                <div className="flex gap-2">
                  <div className="relative flex-1 rounded-xl overflow-hidden aspect-video">
                    <img src={customBg} alt="Custom" className="w-full h-full object-cover" />
                    {currentThemeId === "custom" && (
                      <div className="absolute inset-0 ring-2 ring-primary rounded-xl" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onSelectTheme("custom")}
                      className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-body hover:bg-accent transition-colors"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => {
                        onClearCustomBg();
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-body hover:bg-destructive/20 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-border hover:border-muted-foreground/50 transition-colors flex flex-col items-center gap-2 text-muted-foreground"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs font-body">Upload your own image</span>
                </button>
              )}
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
