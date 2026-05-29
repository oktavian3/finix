import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyber Brutalism Dark Theme
        'fx-blue': '#3B5BDB',
        'fx-blue-light': '#4F6EF7',
        'fx-blue-pale': '#C5D0FF',
        'fx-blue-border': '#1E293B',
        'fx-cyan': '#00FFCC',
        // Text
        'fx-text-primary': '#FFFFFF',
        'fx-text-secondary': '#C5D0FF',
        'fx-text-muted': '#9CA3AF',
        'fx-text-hint': '#6B7280',
        // Semantic
        'fx-green': '#15803D',
        'fx-red': '#B91C1C',
        'fx-amber': '#D97706',
        'fx-purple': '#6D28D9',
        'fx-orange': '#C2410C',
        // Backgrounds
        'fx-bg-page': '#0A0E1A',
        'fx-bg-card': '#111827',
        'fx-bg-sidebar': '#0A0E1A',
        'fx-bg-elevated': '#1E293B',
        'fx-border': '#1E293B',
        'fx-border-light': '#334155',
      },
      fontFamily: {
        mono: ['SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'monospace'],
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 1px)' },
          '40%': { transform: 'translate(2px, -1px)' },
          '60%': { transform: 'translate(-1px, -2px)' },
          '80%': { transform: 'translate(1px, 2px)' },
          '100%': { transform: 'translate(0)' },
        },
        'glitch-text': {
          '0%': { textShadow: '2px 0 #3B5BDB, -2px 0 #00FFCC' },
          '25%': { textShadow: '-2px 0 #3B5BDB, 2px 0 #00FFCC' },
          '50%': { textShadow: '2px -2px #3B5BDB, -2px 2px #00FFCC' },
          '75%': { textShadow: '-2px 2px #3B5BDB, 2px -2px #00FFCC' },
          '100%': { textShadow: '2px 0 #3B5BDB, -2px 0 #00FFCC' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 91, 219, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 91, 219, 0.6)' },
        },
        'scanline-move': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        glitch: 'glitch 0.3s ease-in-out',
        'glitch-text': 'glitch-text 0.4s ease-in-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scanline-move': 'scanline-move 8s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
