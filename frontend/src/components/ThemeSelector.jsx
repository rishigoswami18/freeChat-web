import React, { useMemo, memo } from "react";
import { Palette, CheckCircle2 } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../config/themes";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ThemeItem — Memoized sub-component for performance.
 * Avoids re-rendering every item when the parent dropdown opens/closes.
 */
const ThemeItem = memo(({ option, isSelected, onSelect }) => {
    return (
        <button
            onClick={() => onSelect(option.name)}
            className={`
                w-full px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200 group
                ${isSelected 
                    ? "bg-primary text-primary-content shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "hover:bg-base-content/5 active:scale-95"
                }
            `}
            aria-label={`Switch to ${option.label} theme`}
        >
            <div className={`p-1.5 rounded-lg ${isSelected ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                <Palette className="size-4" />
            </div>

            <div className="flex flex-col items-start gap-0.5">
                <span className="text-[13px] font-semibold leading-none">{option.label}</span>
                <span className={`text-[10px] opacity-70 ${isSelected ? "text-white" : ""}`}>
                    {option.type.toUpperCase()}
                </span>
            </div>

            {/* THEME PREVIEW COLOR STACK */}
            <div className="ml-auto flex -space-x-1.5">
                {option.colors.map((color, i) => (
                    <span
                        key={i}
                        className="size-3.5 rounded-full border border-base-200 ring-1 ring-black/5 shadow-sm"
                        style={{ backgroundColor: color, zIndex: 10 - i }}
                    />
                ))}
            </div>

            {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="size-4 ml-1" />
                </motion.div>
            )}
        </button>
    );
});

/**
 * ThemeSelector — Scalable UI component for theme management.
 */
const ThemeSelector = ({ size = "btn-md" }) => {
    const { theme, setTheme } = useThemeStore();
    
    // Memoize static themes list
    const availableThemes = useMemo(() => THEMES, []);

    return (
        <div className="dropdown dropdown-end">
            {/* TRIGGER */}
            <label 
                tabIndex={0} 
                className={`btn btn-ghost btn-circle ${size} hover:bg-primary/10 transition-colors group`}
                role="button"
                aria-haspopup="listbox"
                aria-label="Toggle Theme Menu"
            >
                <Palette className="size-5 group-hover:rotate-12 transition-transform" />
            </label>

            {/* DROPDOWN MENU */}
            <div
                tabIndex={0}
                className="dropdown-content mt-3 p-2 shadow-2xl bg-base-100/90 backdrop-blur-xl rounded-2xl
                w-64 border border-base-content/10 max-h-[420px] overflow-y-auto scrollbar-hide z-[100]"
                role="listbox"
            >
                <div className="flex flex-col gap-1.5">
                    <div className="px-2 py-1.5 mb-1 border-b border-base-content/5">
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-50">Select Appearance</h3>
                    </div>

                    {availableThemes.map((themeOption) => (
                        <ThemeItem
                            key={themeOption.name}
                            option={themeOption}
                            isSelected={theme === themeOption.name}
                            onSelect={setTheme}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default memo(ThemeSelector);
