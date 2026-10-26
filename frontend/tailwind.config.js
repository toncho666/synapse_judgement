/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1d1d1f',
        sub: '#6e6e73',
        faint: '#a1a1a6',
        line: '#e8e8ed',
        paper: '#f5f5f7',
        card: '#fbfbfd',
        accent: '#007aff',
        violet: '#5856d6',
        mint: '#34c759',
        flame: '#ff3b30',
        amber: '#ff9500',
      },
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'SF Pro Text', 'system-ui', 'sans-serif'],
        display: ['Unbounded', 'Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'monospace'],
      },
      boxShadow: {
        soft: '0 8px 40px rgba(29, 29, 31, 0.07)',
        lift: '0 24px 64px rgba(29, 29, 31, 0.14)',
        bar: '0 18px 50px rgba(29, 29, 31, 0.18)',
      },
      animation: {
        'dash-flow': 'dashFlow 1.4s linear infinite',
        'spin-slow': 'spinSlow 48s linear infinite',
        'marquee': 'marqueeX 46s linear infinite',
        'drift1': 'drift1 18s ease-in-out infinite',
        'drift2': 'drift2 22s ease-in-out infinite',
        'halo': 'pulseHalo 2.2s cubic-bezier(0.4, 0, 0.4, 1) infinite',
        'halo-white': 'pulseHaloWhite 2.4s cubic-bezier(0.4, 0, 0.4, 1) infinite',
        'verdict': 'verdictIn 0.9s cubic-bezier(0.22, 0.61, 0.2, 1) both',
        'shake': 'shakeX 0.45s ease both',
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.22, 0.61, 0.2, 1) both',
      },
    },
  },
  plugins: [],
}
