/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-color, #6366f1)",
      },
      animation: {
        "shimmer": "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-in-bottom": "slide-in-bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-bottom": {
          "0%": { transform: "translateY(1rem)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        zyro: {
          /* Premium Light: Minimalist & Clean */
          "primary": "#6366f1", /* Indigo */
          "secondary": "#0f172a", /* Slate 900 */
          "accent": "#f43f5e", /* Rose 500 */
          "neutral": "#64748b", /* Slate 500 */
          "base-100": "#ffffff",
          "base-200": "#f8fafc", /* Slate 50 */
          "base-300": "#f1f5f9", /* Slate 100 */
          "base-content": "#0f172a",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.75rem",
          "--rounded-badge": "1.5rem",
        },
        zyrodark: {
          /* Premium Deep Space: Sophisticated & High-Contrast */
          "primary": "#818cf8", /* Indigo 400 */
          "secondary": "#f8fafc", /* Slate 50 */
          "accent": "#fb7185", /* Rose 400 */
          "neutral": "#94a3b8", /* Slate 400 */
          "base-100": "#020617", /* Slate 950 */
          "base-200": "#0f172a", /* Slate 900 */
          "base-300": "#1e293b", /* Slate 800 */
          "base-content": "#f8fafc",
          "info": "#60a5fa",
          "success": "#34d399",
          "warning": "#fbbf24",
          "error": "#f87171",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.75rem",
          "--rounded-badge": "1.5rem",
        },
      },
      "light",
      "dark",
      "cupcake",
      "forest",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
    ],
  }, 
};