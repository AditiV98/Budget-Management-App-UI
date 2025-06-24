import React, { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./theme";

const ThemeModeContext = createContext();

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(localStorage.getItem("themeMode") || "light");

  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
