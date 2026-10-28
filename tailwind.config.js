/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
        opensans: ["'Open Sans'", "system-ui", "sans-serif"],
        roboto: ["Roboto", "system-ui", "sans-serif"],
        poppins: ["Poppins", "system-ui", "sans-serif"],
        jakarta: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        mono: [
          "'JetBrains Mono'",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace"
        ]
      }
    }
  },
  plugins: []
}
