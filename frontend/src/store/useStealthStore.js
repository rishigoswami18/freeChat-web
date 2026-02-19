import { create } from "zustand";

export const useStealthStore = create((set) => ({
    isStealthMode: false,
    panicShortcut: "Escape", // Default shortcut
    isPanicRedirect: false,
    safeUrl: "https://www.google.com",

    toggleStealthMode: () => set((state) => ({ isStealthMode: !state.isStealthMode })),
    setStealthMode: (value) => set({ isStealthMode: value }),
    setPanicShortcut: (shortcut) => set({ panicShortcut: shortcut }),
    setPanicRedirect: (value) => set({ isPanicRedirect: value }),
}));
