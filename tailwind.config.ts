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
        // Primary
        'fx-blue': '#3B5BDB',
        'fx-blue-light': '#4F6EF7',
        'fx-blue-pale': '#EEF2FF',
        'fx-blue-border': '#C5D0FF',
        // Text
        'fx-text-primary': '#111827',
        'fx-text-secondary': '#374151',
        'fx-text-muted': '#6B7280',
        'fx-text-hint': '#9CA3AF',
        // Semantic
        'fx-green': '#15803D',
        'fx-red': '#B91C1C',
        'fx-amber': '#D97706',
        'fx-purple': '#6D28D9',
        'fx-orange': '#C2410C',
        // Backgrounds
        'fx-bg-page': '#EEF2FF',
        'fx-bg-card': '#FFFFFF',
        'fx-bg-sidebar': '#FFFFFF',
      },
      fontSize: {
        '2xs': '10px',
        'xs': '11px',
        'sm': '13px',
        'base': '15px',
        'md': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '48px',
      },
    },
  },
  plugins: [],
};
export default config;
