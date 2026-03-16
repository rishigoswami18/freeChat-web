import React, { createContext, useContext, useEffect, useCallback } from "react";
import { useThemeStore } from "../store/useThemeStore";

const ThemeContext = createContext();

/**
 * Team Theme Configuration
 * Map of IPL teams to their primary 'Antigravity' color palettes.
 */
const TEAM_THEMES = {
    CSK: { primary: "#F9CD05", secondary: "#0081E5", accent: "#F9CD05" },
    RCB: { primary: "#EC1C24", secondary: "#2B2A29", accent: "#EC1C24" },
    MI: { primary: "#004BA0", secondary: "#D1AB3E", accent: "#004BA0" },
    KKR: { primary: "#2E0854", secondary: "#B3A123", accent: "#2E0854" },
    GT: { primary: "#1B2133", secondary: "#F0DFAD", accent: "#1B2133" },
    LSG: { primary: "#3D38BA", secondary: "#E86FBD", accent: "#3D38BA" },
    RR: { primary: "#EA1A85", secondary: "#254AA5", accent: "#EA1A85" },
    DC: { primary: "#004C93", secondary: "#EF4123", accent: "#004C93" },
    PBKS: { primary: "#ED1B24", secondary: "#D1AB3E", accent: "#ED1B24" },
    SRH: { primary: "#F26522", secondary: "#000000", accent: "#F26522" },
    DEFAULT: { primary: "#6366f1", secondary: "#8b5cf6", accent: "#6366f1" }
};

export const ThemeProvider = ({ children }) => {
    const { theme, setTheme } = useThemeStore();

    const applyTeamTheme = useCallback((teamCode) => {
        const colors = TEAM_THEMES[teamCode] || TEAM_THEMES.DEFAULT;
        
        // Inject CSS Variables directly into Document Root for 'Antigravity' speed
        const root = document.documentElement;
        root.style.setProperty("--primary-color", colors.primary);
        root.style.setProperty("--secondary-color", colors.secondary);
        root.style.setProperty("--accent-color", colors.accent);
        
        // Also sync with the base UI theme if needed
        console.log(`📡 [Theme Engine] Team Theme Applied: ${teamCode}`);
    }, []);

    // Effect to apply theme on load or change
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, applyTeamTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useGlobalTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useGlobalTheme must be used within a ThemeProvider");
    }
    return context;
};
