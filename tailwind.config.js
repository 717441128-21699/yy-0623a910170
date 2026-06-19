/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        dark: {
          bg: "#0f0f1a",
          card: "#1a1f2e",
          border: "rgba(255,255,255,0.1)",
        },
        amber: {
          gold: "#d4a44c",
        },
      },
      fontFamily: {
        display: ['"ZCOOL QingKe HuangYou"', '"Noto Sans SC"', "sans-serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
      },
      animation: {
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "bounce-in": "bounce-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
