import { useState } from "react";
import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import { usePomodoro } from "@/hooks/usePomodoro";
import { useTheme } from "@/hooks/useTheme";
import { TimerDisplay } from "@/components/TimerDisplay";
import { ModeSelector } from "@/components/ModeSelector";
import { TimerControls } from "@/components/TimerControls";
import { SettingsPanel } from "@/components/SettingsPanel";
import { TodoTracker } from "@/components/TodoTracker";
import { SessionCounter } from "@/components/SessionCounter";

const Index = () => {
  const pomodoro = usePomodoro();
  const themeCtx = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const progress = pomodoro.totalTime > 0 ? 1 - pomodoro.timeLeft / pomodoro.totalTime : 0;

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <motion.img
        key={themeCtx.theme.id}
        src={themeCtx.theme.image}
        alt={themeCtx.theme.name}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 theme-overlay" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-6">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-xl font-light timer-text tracking-wider"
        >
          pomodoro
        </motion.h1>

        {/* Mode selector */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ModeSelector mode={pomodoro.mode} onSwitch={pomodoro.switchMode} />
        </motion.div>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <TimerDisplay
            display={pomodoro.display}
            mode={pomodoro.mode}
            isRunning={pomodoro.isRunning}
            progress={progress}
          />
        </motion.div>

        {/* Session dots */}
        <SessionCounter
          completed={pomodoro.completedSessions % pomodoro.settings.sessionsBeforeLongBreak}
          total={pomodoro.settings.sessionsBeforeLongBreak}
        />

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TimerControls
            isRunning={pomodoro.isRunning}
            onToggle={pomodoro.toggleTimer}
            onReset={pomodoro.resetTimer}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </motion.div>

        {/* Todo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TodoTracker />
        </motion.div>
      </div>

      {/* Fullscreen button */}
      <button
        onClick={handleFullscreen}
        className="fixed bottom-4 right-4 z-20 glass rounded-full p-3 timer-text hover:scale-110 transition-transform"
        title="Fullscreen"
      >
        <Maximize2 className="w-5 h-5" />
      </button>

      {/* Settings */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={pomodoro.settings}
        onUpdateSettings={pomodoro.updateSettings}
        themes={themeCtx.themes}
        currentThemeId={themeCtx.theme.id}
        onSelectTheme={themeCtx.setCurrentTheme}
        isDark={themeCtx.isDark}
        onToggleDark={() => themeCtx.setIsDark((p) => !p)}
      />
    </div>
  );
};

export default Index;
