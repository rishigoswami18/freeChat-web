import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
    const [appMode, setAppMode] = useState(() => {
        return localStorage.getItem("app_mode") || "fantasy";
    });
    const [isRebooting, setIsRebooting] = useState(false);

    const toggleMode = () => {
        if (isRebooting) return; // Guard against rapid toggling

        setIsRebooting(true);
        const newMode = appMode === "social" ? "fantasy" : "social";
        
        // Delay the actual state switch to allow the glitch animation to play
        setTimeout(() => {
            setAppMode(newMode);
            localStorage.setItem("app_mode", newMode);
            setIsRebooting(false);
        }, 600);
        
        // Haptic Feedback (Premium Feel)
        if (window.navigator.vibrate) {
            window.navigator.vibrate([30, 10, 30]);
        }

        // Play subtle whoosh sound
        try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
            audio.volume = 0.2;
            audio.play();
        } catch (e) {
            console.log("Audio play blocked");
        }
    };

    // --- SHAKE TO SWITCH ---
    const shakeRef = useRef({
        lastX: undefined,
        lastY: undefined,
        lastZ: undefined,
        lastShake: 0
    });

    useEffect(() => {
        let threshold = 40; // Increased shake sensitivity threshold

        const handleMotion = (e) => {
            const now = Date.now();
            if (now - shakeRef.current.lastShake < 2000) return; // 2s cooldown between shakes

            let acc = e.accelerationIncludingGravity;
            if (!acc) return;

            const { lastX, lastY, lastZ } = shakeRef.current;

            if (lastX !== undefined) {
                let deltaX = Math.abs(acc.x - lastX);
                let deltaY = Math.abs(acc.y - lastY);
                let deltaZ = Math.abs(acc.z - lastZ);

                if ((deltaX > threshold && deltaY > threshold) || 
                    (deltaX > threshold && deltaZ > threshold) || 
                    (deltaY > threshold && deltaZ > threshold)) {
                    shakeRef.current.lastShake = now;
                    toggleMode();
                }
            }

            shakeRef.current.lastX = acc.x;
            shakeRef.current.lastY = acc.y;
            shakeRef.current.lastZ = acc.z;
        };

        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', handleMotion);
        }
        return () => window.removeEventListener('devicemotion', handleMotion);
    }, [toggleMode]); // Only depends on toggleMode

    // --- THEME INJECTION ---
    useEffect(() => {
        const root = document.documentElement;
        document.body.setAttribute("data-mode", appMode);

        if (appMode === 'fantasy') {
            // Neon / High-Octane Themes
            root.style.setProperty('--mode-primary', '#F97316'); // Orange
            root.style.setProperty('--mode-secondary', '#7C3AED'); // Violet
            root.style.setProperty('--mode-bg', '#0F172A'); // Dark Blue Slate
            root.style.setProperty('--mode-glow', 'rgba(249, 115, 22, 0.4)');
            root.style.setProperty('--mode-card', 'rgba(30, 41, 59, 0.7)');
        } else {
            // Clean / Minimalist Social Themes
            root.style.setProperty('--mode-primary', '#6366F1'); // Indigo
            root.style.setProperty('--mode-secondary', '#EC4899'); // Pink
            root.style.setProperty('--mode-bg', '#000000'); // Pure Black (Glassmorphism pop)
            root.style.setProperty('--mode-glow', 'rgba(99, 102, 241, 0.4)');
            root.style.setProperty('--mode-card', 'rgba(255, 255, 255, 0.05)');
        }
    }, [appMode]);

    return (
        <ModeContext.Provider value={{ appMode, toggleMode, isRebooting }}>
            {children}
        </ModeContext.Provider>
    );
};

export const useAppMode = () => {
    const context = useContext(ModeContext);
    if (!context) {
        throw new Error("useAppMode must be used within a ModeProvider");
    }
    return context;
};
