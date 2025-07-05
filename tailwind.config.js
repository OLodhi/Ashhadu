/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Islamic Art Color Palette
        luxury: {
          black: '#1a1a1a',
          gold: '#d4af37',
          'warm-gold': '#f4d03f',
          'dark-gold': '#b8860b',
          white: '#ffffff',
          gray: {
            50: '#f5f5f5',
            100: '#e1e1e1',
            600: '#666666',
          },
        },
        primary: {
          50: '#f4d03f',
          100: '#f1c232',
          500: '#d4af37',
          600: '#b8860b',
          700: '#996f00',
          900: '#1a1a1a',
        },
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'arabic': ['Amiri', 'serif'], // For Arabic text
      },
      fontSize: {
        'display': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'hero': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'section': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      boxShadow: {
        'luxury': '0 2px 10px rgba(0,0,0,0.1)',
        'luxury-hover': '0 5px 20px rgba(0,0,0,0.15)',
        'luxury-gold': '0 0 20px rgba(212,175,55,0.3)',
        'inner-luxury': 'inset 0 1px 3px rgba(0,0,0,0.1)',
      },
      backgroundImage: {
        'islamic-pattern': "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"islamic-pattern\" x=\"0\" y=\"0\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\"><path d=\"M10,2 L18,10 L10,18 L2,10 Z\" fill=\"none\" stroke=\"rgba(212,175,55,0.1)\" stroke-width=\"0.5\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23islamic-pattern)\"/></svg>')",
        'gold-gradient': 'linear-gradient(45deg, #d4af37, #f4d03f)',
        'gold-gradient-hover': 'linear-gradient(45deg, #b8860b, #d4af37)',
        'luxury-hero': 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      aspectRatio: {
        'product': '4/5',
        'hero': '16/9',
        'square': '1/1',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};