import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Archivist Design System — High Fantasy Edition ──
      colors: {
        bg:       '#090D14',
        surface:  '#0D1520',
        surface2: '#111E2E',
        surface3: '#162338',
        border:   '#1E2D42',
        border2:  '#2A3D58',
        // Gold — primary accent
        gold:     '#B68B4C',
        gold2:    '#D9B36A',
        // Accent aliases for backward compat
        accent:   '#B68B4C',
        accent2:  '#D9B36A',
        // Teal
        teal:     '#2E8C82',
        teal2:    '#3DADA2',
        // Violet
        purple:   '#6F5FA8',
        purple2:  '#8B78C8',
        // Ember
        red:      '#B6462F',
        red2:     '#D4563D',
        // Forest
        green:    '#2E7A5A',
        green2:   '#42A87A',
        // Sapphire
        blue:     '#3A6EA8',
        // Text
        text:     '#E8DFC8',
        muted:    '#6E7A8A',
        muted2:   '#8E9AAA',
      },
      fontFamily: {
        cinzel:   ['var(--font-cinzel)', 'serif'],
        inter:    ['var(--font-inter)', 'sans-serif'],
        lora:     ['var(--font-lora)', 'serif'],
        garamond: ['var(--font-garamond)', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      borderRadius: {
        toolkit: '12px',
        'toolkit-sm': '8px',
      },
      backgroundImage: {
        'hero-glow':   'radial-gradient(ellipse 120% 80% at 50% -20%, rgba(182,139,76,0.08) 0%, transparent 55%)',
        'gold-glow':   'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(182,139,76,0.12) 0%, transparent 70%)',
        'purple-glow': 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(111,95,168,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}

export default config
