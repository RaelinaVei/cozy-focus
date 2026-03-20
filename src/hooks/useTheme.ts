import { useState, useEffect } from "react";

import citySunset from "@/assets/themes/city-sunset.jpg";
import cozyRoom from "@/assets/themes/cozy-room.jpg";
import oceanDawn from "@/assets/themes/ocean-dawn.jpg";
import forest from "@/assets/themes/forest.jpg";
import aurora from "@/assets/themes/aurora.jpg";
import sakura from "@/assets/themes/sakura.jpg";

export interface ThemeOption {
  id: string;
  name: string;
  image: string;
}

export const themes: ThemeOption[] = [
  { id: "city-sunset", name: "City Sunset", image: citySunset },
  { id: "cozy-room", name: "Cozy Room", image: cozyRoom },
  { id: "ocean-dawn", name: "Ocean Dawn", image: oceanDawn },
  { id: "forest", name: "Forest", image: forest },
  { id: "aurora", name: "Aurora", image: aurora },
  { id: "sakura", name: "Sakura", image: sakura },
];

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem("pomodoro-theme") || "city-sunset";
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem("pomodoro-dark") === "true";
  });

  useEffect(() => {
    localStorage.setItem("pomodoro-theme", currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem("pomodoro-dark", String(isDark));
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const theme = themes.find((t) => t.id === currentTheme) || themes[0];

  return { theme, themes, setCurrentTheme, isDark, setIsDark };
}
