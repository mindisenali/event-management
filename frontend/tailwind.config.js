/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A0A0F",
        card: "#12121A",
        accent: "#6C63FF",
        secondary: "#00D4FF",
        success: "#00E676",
        warning: "#FFD600",
        error: "#FF4444",
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        dm: ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
        input: "4px",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
