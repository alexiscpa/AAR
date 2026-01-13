import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'oklch(0.92 0.004 286.32)',
        input: 'oklch(0.92 0.004 286.32)',
        ring: 'oklch(0.623 0.214 259.815)',
        background: 'oklch(0.98 0.001 286.375)',
        foreground: 'oklch(0.235 0.015 65)',
        primary: {
          DEFAULT: 'oklch(0.623 0.214 259.815)',
          foreground: 'oklch(1 0 0)',
        },
        secondary: {
          DEFAULT: 'oklch(0.65 0.2 280)',
          foreground: 'oklch(1 0 0)',
        },
        accent: {
          DEFAULT: 'oklch(0.8 0.15 45)',
          foreground: 'oklch(0.235 0.015 65)',
        },
        destructive: {
          DEFAULT: 'oklch(0.55 0.2 25)',
          foreground: 'oklch(1 0 0)',
        },
        muted: {
          DEFAULT: 'oklch(0.95 0.005 286)',
          foreground: 'oklch(0.552 0.016 285.938)',
        },
        card: {
          DEFAULT: 'oklch(1 0 0)',
          foreground: 'oklch(0.235 0.015 65)',
        },
        popover: {
          DEFAULT: 'oklch(1 0 0)',
          foreground: 'oklch(0.235 0.015 65)',
        },
        // 優先級顏色
        priority: {
          high: 'oklch(0.55 0.2 25)',
          medium: 'oklch(0.75 0.18 85)',
          low: 'oklch(0.623 0.214 259.815)',
        },
        // 狀態顏色
        status: {
          completed: 'oklch(0.6 0.18 145)',
          'in-progress': 'oklch(0.623 0.214 259.815)',
          'not-started': 'oklch(0.552 0.016 285.938)',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Lato', 'sans-serif'],
      },
      letterSpacing: {
        display: '-0.02em',
      },
      boxShadow: {
        elegant: '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 16px -4px rgba(0, 0, 0, 0.04)',
        'elegant-lg': '0 4px 16px -4px rgba(0, 0, 0, 0.1), 0 8px 32px -8px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
