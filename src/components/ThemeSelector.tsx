import { useTheme, type ThemeName } from "@/contexts/ThemeContext";
import { Palette } from "lucide-react";
import { useState } from "react";

const THEME_COLORS = {
  ocean: {
    name: "Ocean",
    primary: "#0096FF",
    secondary: "#00D9FF",
    gradient: "from-blue-600 to-cyan-500",
    icon: "🌊",
  },
  forest: {
    name: "Forest",
    primary: "#22C55E",
    secondary: "#86EFAC",
    gradient: "from-green-600 to-lime-500",
    icon: "🌲",
  },
  sunset: {
    name: "Sunset",
    primary: "#FF6B35",
    secondary: "#FFD60A",
    gradient: "from-orange-600 to-yellow-500",
    icon: "🌅",
  },
  amethyst: {
    name: "Amethyst",
    primary: "#A855F7",
    secondary: "#D8B4FE",
    gradient: "from-purple-600 to-pink-500",
    icon: "💜",
  },
  gold: {
    name: "Gold",
    primary: "#FBBF24",
    secondary: "#FCD34D",
    gradient: "from-amber-600 to-yellow-400",
    icon: "✨",
  },
  sky: {
    name: "Sky",
    primary: "#3B82F6",
    secondary: "#E0F2FE",
    gradient: "from-sky-600 to-blue-400",
    icon: "☁️",
  },
  white: {
    name: "White",
    primary: "#3B82F6",
    secondary: "#7C3AED",
    gradient: "from-blue-500 to-purple-500",
    icon: "⚪",
  },
};

export const ThemeSelector = () => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 group"
        title="Change website theme"
      >
        <Palette className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 bg-card border border-white/20 rounded-xl shadow-2xl p-4 w-96 z-50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <Palette className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-foreground">Website Theme</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {themes.map((theme: ThemeName) => {
              const themeInfo = THEME_COLORS[theme];
              const isActive = currentTheme === theme;

              return (
                <button
                  key={theme}
                  onClick={() => {
                    setTheme(theme);
                    setIsOpen(false);
                  }}
                  className={`group relative overflow-hidden rounded-lg p-3 transition-all duration-300 ${
                    isActive
                      ? "ring-2 ring-offset-2 ring-offset-card ring-accent scale-105"
                      : "hover:scale-105"
                  }`}
                >
                  {/* Background gradient preview */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${themeInfo.gradient} opacity-80 group-hover:opacity-90 transition-opacity`}
                  />

                  {/* Content */}
                  <div className="relative flex flex-col items-center gap-2">
                    <span className="text-2xl">{themeInfo.icon}</span>
                    <span className="text-xs font-semibold text-white drop-shadow">
                      {themeInfo.name}
                    </span>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full shadow-lg" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Preview colors */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-muted-foreground mb-2">Current Theme</p>
            <div className="flex gap-2">
              <div
                className="w-6 h-6 rounded-lg border border-white/20"
                style={{
                  backgroundColor: THEME_COLORS[currentTheme].primary,
                }}
              />
              <div
                className="w-6 h-6 rounded-lg border border-white/20"
                style={{
                  backgroundColor: THEME_COLORS[currentTheme].secondary,
                }}
              />
              <span className="text-xs text-muted-foreground">
                {THEME_COLORS[currentTheme].name}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
