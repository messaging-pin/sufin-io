/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF5E00',
          orangeLight: '#FF7724',
          orangeDark: '#E04800',
          orangeGlow: 'rgba(255, 94, 0, 0.35)',
        },
        dark: {
          bg: '#000000',
          card: '#161618',
          cardHover: '#1c1c20',
          cardActive: '#222226',
          input: '#1a1a1d',
          border: '#242428',
          textMuted: '#8e8e93',
          textSubtle: '#636366'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'orange-glow': '0 0 15px rgba(255, 94, 0, 0.45)',
        'orange-ring': '0 0 0 2.5px rgba(255, 94, 0, 0.95)',
        'ios-card': '0 4px 20px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        bounceShort: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'bounce-short': 'bounceShort 1s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
