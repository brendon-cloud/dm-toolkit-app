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
        bg:       '#0d0c0a',
        surface:  '#151310',
        surface2: '#1e1b16',
        surface3: '#272318',
        border:   '#302b20',
        border2:  '#403c2c',
        amber:    '#c07828',
        amber2:   '#d89040',
        gold:     '#c9a840',
        gold2:    '#e0c060',
        crimson:  '#9a1f1f',
        crimson2: '#c02828',
        red:      '#b83535',
        red2:     '#d84848',
        forest:   '#2d7a50',
        forest2:  '#40a068',
        purple:   '#5c3e9e',
        purple2:  '#7c5ec8',
        blue:     '#3d6ea0',
        teal:     '#258888',
        text:     '#ede8d5',
        muted:    '#7a7262',
        muted2:   '#9a9080',
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
        'hero-glow':   'radial-gradient(ellipse 120% 80% at 50% -20%, #1e1408 0%, transparent 55%)',
        'amber-glow':  'radial-gradient(ellipse 60% 50% at 50% 0%, #2a1c08 0%, transparent 70%)',
        'purple-glow': 'radial-gradient(ellipse 60% 50% at 50% 0%, #1a1030 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}

export default config
