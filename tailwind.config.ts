import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── DM Toolkit Design System ──
      colors: {
        bg:       '#0a0a0f',
        surface:  '#12121c',
        surface2: '#1a1a2a',
        surface3: '#20203a',
        border:   '#2a2a40',
        border2:  '#3a3a55',
        accent:   '#c9872a',
        accent2:  '#e8a040',
        gold:     '#c9a84c',
        red:      '#c94040',
        red2:     '#e05555',
        purple:   '#7c5ce8',
        purple2:  '#9b80f0',
        green:    '#3dc98a',
        green2:   '#55e0a0',
        blue:     '#4a90d9',
        teal:     '#2abfbf',
        text:     '#e8e4d8',
        muted:    '#7a7a9a',
        muted2:   '#9a9ab8',
      },
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'serif'],
        inter:  ['var(--font-inter)', 'sans-serif'],
        lora:   ['var(--font-lora)', 'serif'],
      },
      borderRadius: {
        toolkit: '12px',
        'toolkit-sm': '8px',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 120% 80% at 50% -20%, #1a0e3a 0%, transparent 55%)',
        'purple-glow': 'radial-gradient(ellipse 60% 50% at 50% 0%, #2a1a5a 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}

export default config
