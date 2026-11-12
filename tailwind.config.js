/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        washi: {
          50: '#FDFBF7',
          100: '#F7F4EC',
          200: '#EFE9DC',
          300: '#E3DC Flora',
          400: '#D5CCB8',
          DEFAULT: '#F9F7F2',
        },
        sumi: {
          DEFAULT: '#1E2221',
          50: '#6A706C',
          100: '#484E4A',
          200: '#323734',
          300: '#232725',
          900: '#151817',
        },
        hinoki: {
          50: '#FDF8F2',
          100: '#F6E7D3',
          200: '#ECD2B0',
          300: '#E1B88B',
          DEFAULT: '#C9935B',
          dark: '#A6723C',
        },
        tatami: {
          DEFAULT: '#7E9169',
          light: '#A1B38C',
          pale: '#C6D4B6',
          dark: '#586946',
          border: '#37472E',
        },
        bamboo: {
          DEFAULT: '#889163',
          light: '#ADB786',
        },
        aizome: {
          DEFAULT: '#2C4058',
          light: '#4A6585',
          dark: '#1C2939',
        },
        bengala: {
          DEFAULT: '#A64B3B',
          light: '#C76A5A',
        },
        grid: '#E2DBD0',
        ruler: '#8C857B',
      },
      fontFamily: {
        sans: [
          '"Inter"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Hiragino Kaku Gothic ProN"',
          '"Yu Gothic"',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          'Menlo',
          'monospace',
        ],
        serif: [
          '"Hiragino Mincho ProN"',
          '"Yu Mincho"',
          'serif',
        ],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(30, 34, 33, 0.05), 0 1px 2px 0 rgba(30, 34, 33, 0.03)',
        card: '0 4px 6px -1px rgba(30, 34, 33, 0.05), 0 2px 4px -1px rgba(30, 34, 33, 0.03)',
        dropdown: '0 10px 15px -3px rgba(30, 34, 33, 0.08), 0 4px 6px -2px rgba(30, 34, 33, 0.04)',
      },
    },
  },
  plugins: [],
};

