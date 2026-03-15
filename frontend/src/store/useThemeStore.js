import { create } from "zustand";
import { STORAGE_KEY, DEFAULT_THEME } from "../config/themes";

/**
 * useThemeStore
 * Manages global UI theme state with persistence and side-effects.
 */
export const useThemeStore = create((set) => ({
    // Initialize from storage or fallback to default
    theme: localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME,

    setTheme: (newTheme) => {
        // 1. Persistence
        localStorage.setItem(STORAGE_KEY, newTheme);

        // 2. DOM Application (Immediate side-effect for CSS variables)
        document.documentElement.setAttribute("data-theme", newTheme);

        // 3. State Update
        set({ theme: newTheme });
    },

    /**
     * Syncs the theme with the document on application load.
     * Prevents Flash of Unstyled Theme (FOUT).
     */
    initTheme: () => {
        const savedTheme = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
        document.documentElement.setAttribute("data-theme", savedTheme);
        set({ theme: savedTheme });
    }
}));