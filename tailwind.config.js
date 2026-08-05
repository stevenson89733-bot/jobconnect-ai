module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        // Brand palette (landing-page redesign) — primary/accent were
        // already used site-wide (buttons, badges, premium-feature
        // accents), so these are a values realignment, not new tokens.
        // primaryDark/primarySoft/accentSoft/mint/mintSoft are net-new
        // additions, no prior usage anywhere to conflict with.
        primary: '#2E5CF6',
        primaryDark: '#1E3FCC',
        primarySoft: '#EAEFFF',
        accent: '#F0663A',
        accentSoft: '#FFEEE7',
        // Status/success only — not a general-purpose color, see Badge's
        // "success" variant and any real status indicator (e.g. remote-
        // friendly, offer received).
        mint: '#17A673',
        mintSoft: '#E4F7EE',
        // New landing-only body-copy tone — deliberately not retrofitted
        // onto the existing text-slate-600 used everywhere else in the
        // app (out of scope for this lot).
        body: '#55627A',
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2E5CF6',
          600: '#1E3FCC',
        }
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
