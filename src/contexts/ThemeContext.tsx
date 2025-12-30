import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeName = "ocean" | "forest" | "sunset" | "amethyst" | "gold" | "sky" | "white";

interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  "destructive-foreground": string;
  border: string;
  input: string;
  ring: string;
  muted: string;
  "muted-foreground": string;
}

const THEMES: Record<ThemeName, ThemeColors> = {
  ocean: {
    background: "240 20% 8%",
    foreground: "210 40% 98%",
    card: "240 16% 12%",
    "card-foreground": "210 40% 98%",
    "popover-foreground": "210 40% 98%",
    primary: "200 100% 50%",
    "primary-foreground": "240 20% 8%",
    secondary: "180 60% 50%",
    "secondary-foreground": "210 40% 98%",
    accent: "190 100% 55%",
    "accent-foreground": "240 20% 8%",
    destructive: "0 72% 51%",
    "destructive-foreground": "210 40% 98%",
    border: "240 12% 20%",
    input: "240 12% 20%",
    ring: "200 100% 50%",
    muted: "240 12% 16%",
    "muted-foreground": "215 20% 65%",
  },
  forest: {
    background: "120 20% 8%",
    foreground: "120 40% 98%",
    card: "120 16% 12%",
    "card-foreground": "120 40% 98%",
    "popover-foreground": "120 40% 98%",
    primary: "140 70% 50%",
    "primary-foreground": "120 20% 8%",
    secondary: "100 60% 45%",
    "secondary-foreground": "120 40% 98%",
    accent: "80 80% 50%",
    "accent-foreground": "120 20% 8%",
    destructive: "0 72% 51%",
    "destructive-foreground": "120 40% 98%",
    border: "120 12% 20%",
    input: "120 12% 20%",
    ring: "140 70% 50%",
    muted: "120 12% 16%",
    "muted-foreground": "115 20% 65%",
  },
  sunset: {
    background: "20 20% 8%",
    foreground: "20 40% 98%",
    card: "20 16% 12%",
    "card-foreground": "20 40% 98%",
    "popover-foreground": "20 40% 98%",
    primary: "30 100% 55%",
    "primary-foreground": "20 20% 8%",
    secondary: "10 90% 55%",
    "secondary-foreground": "20 40% 98%",
    accent: "45 100% 60%",
    "accent-foreground": "20 20% 8%",
    destructive: "0 72% 51%",
    "destructive-foreground": "20 40% 98%",
    border: "20 12% 20%",
    input: "20 12% 20%",
    ring: "30 100% 55%",
    muted: "20 12% 16%",
    "muted-foreground": "15 20% 65%",
  },
  amethyst: {
    background: "260 20% 8%",
    foreground: "260 40% 98%",
    card: "260 16% 12%",
    "card-foreground": "260 40% 98%",
    "popover-foreground": "260 40% 98%",
    primary: "270 80% 60%",
    "primary-foreground": "260 20% 8%",
    secondary: "250 70% 55%",
    "secondary-foreground": "260 40% 98%",
    accent: "290 100% 65%",
    "accent-foreground": "260 20% 8%",
    destructive: "0 72% 51%",
    "destructive-foreground": "260 40% 98%",
    border: "260 12% 20%",
    input: "260 12% 20%",
    ring: "270 80% 60%",
    muted: "260 12% 16%",
    "muted-foreground": "255 20% 65%",
  },
  gold: {
    background: "35 25% 10%",
    foreground: "35 40% 98%",
    card: "35 18% 14%",
    "card-foreground": "35 40% 98%",
    "popover-foreground": "35 40% 98%",
    primary: "45 100% 60%",
    "primary-foreground": "35 25% 10%",
    secondary: "30 100% 50%",
    "secondary-foreground": "35 40% 98%",
    accent: "50 100% 70%",
    "accent-foreground": "35 25% 10%",
    destructive: "0 72% 51%",
    "destructive-foreground": "35 40% 98%",
    border: "35 15% 22%",
    input: "35 15% 22%",
    ring: "45 100% 60%",
    muted: "35 12% 18%",
    "muted-foreground": "30 20% 65%",
  },
  sky: {
    background: "200 30% 12%",
    foreground: "200 40% 98%",
    card: "200 25% 18%",
    "card-foreground": "200 40% 98%",
    "popover-foreground": "200 40% 98%",
    primary: "210 100% 60%",
    "primary-foreground": "200 30% 12%",
    secondary: "190 80% 55%",
    "secondary-foreground": "200 40% 98%",
    accent: "230 100% 70%",
    "accent-foreground": "200 30% 12%",
    destructive: "0 72% 51%",
    "destructive-foreground": "200 40% 98%",
    border: "200 20% 25%",
    input: "200 20% 25%",
    ring: "210 100% 60%",
    muted: "200 15% 22%",
    "muted-foreground": "195 20% 65%",
  },
  white: {
    background: "0 0% 95%",
    foreground: "0 0% 8%",
    card: "0 0% 100%",
    "card-foreground": "0 0% 8%",
    "popover-foreground": "0 0% 8%",
    primary: "220 90% 50%",
    "primary-foreground": "0 0% 100%",
    secondary: "280 85% 40%",
    "secondary-foreground": "0 0% 100%",
    accent: "30 100% 50%",
    "accent-foreground": "0 0% 100%",
    destructive: "0 84% 60%",
    "destructive-foreground": "0 0% 100%",
    border: "0 0% 85%",
    input: "0 0% 92%",
    ring: "220 90% 50%",
    muted: "0 0% 90%",
    "muted-foreground": "0 0% 45%",
  },
};

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: ThemeName[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("app-theme");
    return (saved as ThemeName) || "ocean";
  });

  useEffect(() => {
    const theme = THEMES[currentTheme];
    const root = document.documentElement;

    Object.entries(theme).forEach(([key, value]) => {
      // Keys already have hyphens, just add -- prefix
      const cssVar = `--${key}`;
      // HSL values are stored as space-separated, not comma-separated
      root.style.setProperty(cssVar, value);
    });

    localStorage.setItem("app-theme", currentTheme);
  }, [currentTheme]);

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes: Object.keys(THEMES) as ThemeName[] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
