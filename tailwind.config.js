/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff5e6", // very light orange
          100: "#ffe6cc", // light pastel orange
          200: "#ffd1a3", // soft peach
          300: "#ffb266", // light orange
          400: "#ff944d", // mid orange
          500: "#fd7014", // primary orange
          600: "#e6600f", // darker orange
          700: "#cc520a", // burnt orange
          800: "#b34707", // deep orange
          900: "#993d05", // darkest tone
        },
        secondary: {
          50: "#fef2f2", // very light red / pinkish
          100: "#fee2e2", // light pastel red
          500: "#ef4444", // vibrant red (main secondary)
          600: "#dc2626", // bold red
          700: "#b91c1c", // deep red
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "bounce-slow": "bounce 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
