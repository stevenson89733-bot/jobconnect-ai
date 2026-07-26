module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        primary: '#2563EB',
        accent: '#F97316',
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563EB',
          600: '#1d4ed8',
        }
      },
      fontFamily: {
        // Noto Sans Arabic as a fallback, not a swap — Inter has no Arabic
        // glyphs, so the browser transparently falls through to it per
        // character for Arabic text while every other script keeps using
        // Inter, with no per-locale className branching needed.
        sans: ['var(--font-inter)', 'var(--font-noto-arabic)', 'ui-sans-serif', 'system-ui'],
      },
    }
  },
  plugins: []
}
