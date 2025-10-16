import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SPARK Brand Colors (from logo)
        spark: {
          pink: {
            DEFAULT: '#E91E8C',
            50: '#FDF2F8',
            100: '#FCE7F3',
            200: '#FBCFE8',
            300: '#F9A8D4',
            400: '#F472B6',
            500: '#E91E8C',
            600: '#DB2777',
            700: '#BE185D',
            800: '#9F1239',
            900: '#831843',
          },
          purple: {
            DEFAULT: '#7C3AED',
            50: '#F5F3FF',
            100: '#EDE9FE',
            200: '#DDD6FE',
            300: '#C4B5FD',
            400: '#A78BFA',
            500: '#7C3AED',
            600: '#7C3AED',
            700: '#6D28D9',
            800: '#5B21B6',
            900: '#4C1D95',
          },
          cyan: {
            DEFAULT: '#06B6D4',
            50: '#ECFEFF',
            100: '#CFFAFE',
            200: '#A5F3FC',
            300: '#67E8F9',
            400: '#22D3EE',
            500: '#06B6D4',
            600: '#0891B2',
            700: '#0E7490',
            800: '#155E75',
            900: '#164E63',
          },
          yellow: {
            DEFAULT: '#FBBF24',
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
            800: '#92400E',
            900: '#78350F',
          },
          lime: {
            DEFAULT: '#84CC16',
            50: '#F7FEE7',
            100: '#ECFCCB',
            200: '#D9F99D',
            300: '#BEF264',
            400: '#A3E635',
            500: '#84CC16',
            600: '#65A30D',
            700: '#4D7C0F',
            800: '#3F6212',
            900: '#365314',
          },
          orange: {
            DEFAULT: '#FB923C',
            50: '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',
            500: '#F97316',
            600: '#EA580C',
            700: '#C2410C',
            800: '#9A3412',
            900: '#7C2D12',
          },
        },
        // SPARK Dimension Colors (EXACT brand colors)
        dimension: {
          S: '#e91e8c', // Self-direction - Pink
          P: '#7f3ae7', // Purpose - Purple  
          A: '#00b6d7', // Awareness - Cyan
          R: '#83cc0c', // Resilience - Lime
          K: '#fdbe21', // Knowledge - Yellow
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'spark-gradient': 'linear-gradient(135deg, #e91e8c 0%, #7f3ae7 100%)',
        'dimension-s': 'linear-gradient(135deg, #e91e8c 0%, #f472b6 100%)',
        'dimension-p': 'linear-gradient(135deg, #7f3ae7 0%, #a78bfa 100%)',
        'dimension-a': 'linear-gradient(135deg, #00b6d7 0%, #22d3ee 100%)',
        'dimension-r': 'linear-gradient(135deg, #83cc0c 0%, #a3e635 100%)',
        'dimension-k': 'linear-gradient(135deg, #fdbe21 0%, #fcd34d 100%)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-gentle': 'pulseGentle 3s infinite',
        'confetti': 'confetti 3s ease-out forwards',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'spark': '0 10px 40px -10px rgba(233, 30, 140, 0.4)',
        'dimension': '0 4px 20px -4px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
export default config

