/** @type {import('tailwindcss').Config} */

// Every color reads from a CSS variable defined in src/theme.css.
// The variables change under the .dark class, so components do not need dark: variants.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: token('page'),
        surface: token('surface'),
        sunken: token('sunken'),
        line: token('line'),
        ink: token('ink'),
        muted: token('muted'),
        route: token('route'),
        corridor: token('corridor'),
        brand: {
          DEFAULT: token('brand'),
          strong: token('brand-strong'),
          soft: token('brand-soft'),
          on: token('brand-on')
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Barlow Semi Condensed"', 'Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

