module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        // Brand palette — aligned with the landing identity in
        // styles/landing.css (#315bea blue, #f97316 orange, #0c1830 navy)
        // so Tailwind utilities and the landing/nav CSS share one palette.
        primary: '#315bea',
        accent: '#f97316',
        // Status/success only — not a general-purpose color, see Badge's
        // "success" variant and any real status indicator (e.g. remote-
        // friendly, offer received).
        mint: '#17A673',
        mintSoft: '#E4F7EE',
        // New landing-only body-copy tone — deliberately not retrofitted
        // onto the existing text-slate-600 used everywhere else in the
        // app (out of scope for this lot).
        body: '#55627A',
      },
      fontFamily: {
        // Noto Sans Arabic as a fallback, not a swap — Inter has no Arabic
        // glyphs, so the browser transparently falls through to it per
        // character for Arabic text while every other script keeps using
        // Inter, with no per-locale className branching needed.
        sans: ['var(--font-inter)', 'var(--font-noto-arabic)', 'ui-sans-serif', 'system-ui'],
        // Sora for headings only — apply via font-display class.
        // Arabic headings fall back to Noto Sans Arabic (no Sora Arabic subset).
        display: ['var(--font-sora)', 'var(--font-inter)', 'ui-sans-serif', 'system-ui'],
      },
    }
  },
  plugins: []
}
