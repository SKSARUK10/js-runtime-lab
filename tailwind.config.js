/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', 'Consolas', 'monospace'],
      },
      colors: {
        panel: {
          bg: '#0d0f14',
          surface: '#141821',
          border: '#1e2433',
          hover: '#1a1f2b',
        },
        accent: {
          blue: '#3b82f6',
          green: '#22c55e',
          amber: '#f59e0b',
          red: '#ef4444',
          cyan: '#06b6d4',
          violet: '#8b5cf6',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 1.5s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 16px rgba(59, 130, 246, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
