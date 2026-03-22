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
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        zyro: {
          /* Zyro Light Theme: Neon Orange & Clean White */
          "primary": "oklch(65% 0.2 45)", /* Neon Orange */
          "secondary": "oklch(15% 0.04 250)", /* Deep Black */
          "accent": "oklch(70% 0.15 160)", 
          "neutral": "oklch(25% 0.02 250)", 
          "base-100": "oklch(100% 0 0)",
          "base-200": "oklch(97% 0.01 250)",
          "base-300": "oklch(94% 0.02 250)",
          "base-content": "oklch(15% 0.04 250)",
          "info": "oklch(60% 0.2 45)",
          "success": "oklch(70% 0.15 160)",
          "warning": "oklch(80% 0.15 70)",
          "error": "oklch(60% 0.2 25)",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1rem",
        },
        zyrodark: {
          /* Zyro Dark Theme: Deep Black & Neon Orange */
          "primary": "oklch(65% 0.2 45)", /* Neon Orange */
          "secondary": "oklch(90% 0.02 250)", /* Off-white for accents */
          "accent": "oklch(75% 0.15 160)", 
          "neutral": "oklch(18% 0.03 250)", 
          "base-100": "oklch(15% 0.04 250)", /* Deep Black Slate */
          "base-200": "oklch(12% 0.03 250)",
          "base-300": "oklch(10% 0.02 250)",
          "base-content": "oklch(95% 0.01 250)",
          "info": "oklch(70% 0.2 45)",
          "success": "oklch(75% 0.15 160)",
          "warning": "oklch(85% 0.15 70)",
          "error": "oklch(65% 0.2 25)",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1rem",
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