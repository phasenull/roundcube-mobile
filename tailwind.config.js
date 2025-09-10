/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0a7ea4",
        background: "#fff",
        text: "#11181C",
        icon: "#687076",
        tabIconDefault: "#687076",
        tabIconSelected: "#0a7ea4",
      },
      fontFamily: {
        'space-mono': ['SpaceMono-Regular'],
      },
    },
  },
  plugins: [],
}