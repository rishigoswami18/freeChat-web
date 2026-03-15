/**
 * THEMES CONFIGURATION
 * Centralized registry for all platform themes supported by DaisyUI.
 */
export const THEMES = [
    {
        name: "bondbeyond",
        label: "BondBeyond (Default)",
        colors: ["#5a67d8", "#8b5cf6", "#75d1f0", "#ffffff"],
        type: "light"
    },
    {
        name: "bondbeyonddark",
        label: "BondBeyond Dark",
        colors: ["#15172a", "#8b5cf6", "#ec4899", "#ffffff"],
        type: "dark"
    },
    {
        name: "dim",
        label: "Dim Mode",
        colors: ["#1c1c27", "#10b981", "#ff5a5f", "#0f172a"],
        type: "dark"
    },
    {
        name: "night",
        label: "Midnight",
        colors: ["#0f172a", "#38bdf8", "#818cf8", "#e2e8f0"],
        type: "dark"
    },
    {
        name: "synthwave",
        label: "Cyber Retro",
        colors: ["#2d1b69", "#e779c1", "#58c7f3", "#f8f8f2"],
        type: "dark"
    },
    {
        name: "valentine",
        label: "Sweetheart",
        colors: ["#f0d6e8", "#e96d7b", "#a991f7", "#37243c"],
        type: "light"
    },
    {
        name: "nord",
        label: "Artic Nord",
        colors: ["#eceff4", "#5e81ac", "#81a1c1", "#3b4252"],
        type: "light"
    },
    {
        name: "dracula",
        label: "Vampire",
        colors: ["#282a36", "#ff79c6", "#bd93f9", "#f8f8f2"],
        type: "dark"
    },
    {
        name: "luxury",
        label: "Gold & Black",
        colors: ["#171618", "#1e293b", "#94589c", "#d4a85a"],
        type: "dark"
    },
    {
        name: "winter",
        label: "Crisp Winter",
        colors: ["#ffffff", "#0284c7", "#d946ef", "#0f172a"],
        type: "light"
    },
    {
        name: "coffee",
        label: "Roasted",
        colors: ["#20161f", "#dd9866", "#497174", "#eeeeee"],
        type: "dark"
    }
];

export const DEFAULT_THEME = "bondbeyond";
export const STORAGE_KEY = "bondbeyond-theme";
