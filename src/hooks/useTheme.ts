import { useState, useEffect } from "react";

import citySunset from "@/assets/themes/city-sunset.jpg";
import cozyRoom from "@/assets/themes/cozy-room.jpg";
import oceanDawn from "@/assets/themes/ocean-dawn.jpg";
import forest from "@/assets/themes/forest.jpg";
import aurora from "@/assets/themes/aurora.jpg";
import sakura from "@/assets/themes/sakura.jpg";
import cafe from "@/assets/themes/cafe.jpg";
import library from "@/assets/themes/library.jpg";
import zen from "@/assets/themes/zen.jpg";
import rainyNight from "@/assets/themes/rainy-night.jpg";
import space from "@/assets/themes/space.jpg";
import lavender from "@/assets/themes/lavender.jpg";
import genshin from "@/assets/themes/genshin.jpg";
import residentEvil from "@/assets/themes/resident-evil.jpg";
import honkaiStarRail from "@/assets/themes/honkai-star-rail.jpg";
import zelda from "@/assets/themes/zelda.jpg";
import minecraft from "@/assets/themes/minecraft.jpg";
import finalFantasy from "@/assets/themes/final-fantasy.jpg";
import hollowKnight from "@/assets/themes/hollow-knight.jpg";
import eldenRing from "@/assets/themes/elden-ring.jpg";

export interface ThemeOption {
  id: string;
  name: string;
  image: string;
  category: "aesthetic" | "gaming";
}

export const themes: ThemeOption[] = [
  // Aesthetic
  { id: "city-sunset", name: "City Sunset", image: citySunset, category: "aesthetic" },
  { id: "cozy-room", name: "Cozy Room", image: cozyRoom, category: "aesthetic" },
  { id: "ocean-dawn", name: "Ocean Dawn", image: oceanDawn, category: "aesthetic" },
  { id: "forest", name: "Forest", image: forest, category: "aesthetic" },
  { id: "aurora", name: "Aurora", image: aurora, category: "aesthetic" },
  { id: "sakura", name: "Sakura", image: sakura, category: "aesthetic" },
  { id: "cafe", name: "Café", image: cafe, category: "aesthetic" },
  { id: "library", name: "Library", image: library, category: "aesthetic" },
  { id: "zen", name: "Zen Garden", image: zen, category: "aesthetic" },
  { id: "rainy-night", name: "Rainy Night", image: rainyNight, category: "aesthetic" },
  { id: "space", name: "Space", image: space, category: "aesthetic" },
  { id: "lavender", name: "Lavender", image: lavender, category: "aesthetic" },
  // Gaming
  { id: "genshin", name: "Genshin Impact", image: genshin, category: "gaming" },
  { id: "honkai-star-rail", name: "Honkai: Star Rail", image: honkaiStarRail, category: "gaming" },
  { id: "resident-evil", name: "Resident Evil", image: residentEvil, category: "gaming" },
  { id: "zelda", name: "Zelda: BotW", image: zelda, category: "gaming" },
  { id: "minecraft", name: "Minecraft", image: minecraft, category: "gaming" },
  { id: "final-fantasy", name: "Final Fantasy", image: finalFantasy, category: "gaming" },
  { id: "hollow-knight", name: "Hollow Knight", image: hollowKnight, category: "gaming" },
  { id: "elden-ring", name: "Elden Ring", image: eldenRing, category: "gaming" },
];

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem("pomodoro-theme") || "city-sunset";
  });

  const [customBg, setCustomBg] = useState<string | null>(() => {
    return localStorage.getItem("pomodoro-custom-bg");
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem("pomodoro-dark") === "true";
  });

  useEffect(() => {
    localStorage.setItem("pomodoro-theme", currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    if (customBg) {
      localStorage.setItem("pomodoro-custom-bg", customBg);
    } else {
      localStorage.removeItem("pomodoro-custom-bg");
    }
  }, [customBg]);

  useEffect(() => {
    localStorage.setItem("pomodoro-dark", String(isDark));
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const theme = themes.find((t) => t.id === currentTheme) || themes[0];

  const handleCustomUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCustomBg(dataUrl);
      setCurrentTheme("custom");
    };
    reader.readAsDataURL(file);
  };

  const clearCustomBg = () => {
    setCustomBg(null);
    if (currentTheme === "custom") setCurrentTheme("city-sunset");
  };

  const backgroundImage = currentTheme === "custom" && customBg ? customBg : theme.image;

  return {
    theme, themes, setCurrentTheme, isDark, setIsDark,
    customBg, handleCustomUpload, clearCustomBg, backgroundImage,
    currentTheme,
  };
}
