/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./frontend/index.html', './frontend/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        zylo: {
          ink: '#101125',
          navy: '#080A1F',
          violet: '#6D28D9',
          purple: '#A855F7',
          pink: '#F43F8B',
          sky: '#0EA5E9',
          mint: '#2DD4BF',
          lime: '#A3E635',
          amber: '#F59E0B'
        }
      },
      boxShadow: {
        glow: '0 0 45px rgba(168, 85, 247, 0.34)',
        skyglow: '0 0 38px rgba(14, 165, 233, 0.28)',
        card: '0 24px 70px rgba(15, 23, 42, 0.14)'
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at 18% 12%, rgba(244, 63, 139, 0.2), transparent 26%), radial-gradient(circle at 80% 0%, rgba(14, 165, 233, 0.22), transparent 28%), linear-gradient(135deg, #fff 0%, #f5f3ff 42%, #ecfeff 100%)',
        darkmesh: 'radial-gradient(circle at 16% 10%, rgba(244, 63, 139, 0.18), transparent 24%), radial-gradient(circle at 82% 4%, rgba(14, 165, 233, 0.18), transparent 26%), linear-gradient(135deg, #07091c 0%, #11153a 48%, #071a2d 100%)',
        brand: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 44%, #f43f8b 100%)',
        aurora: 'linear-gradient(120deg, rgba(79, 70, 229, 0.95), rgba(14, 165, 233, 0.85), rgba(244, 63, 139, 0.9))'
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 22s linear infinite',
        pulseGlow: 'pulseGlow 2.8s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -14px, 0)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(168, 85, 247, 0)' },
          '50%': { boxShadow: '0 0 34px rgba(168, 85, 247, 0.34)' }
        }
      }
    }
  },
  plugins: []
};
