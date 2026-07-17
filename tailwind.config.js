/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand Colors
        'tech-blue': '#02027F',
        'energetic-green': '#00D959',
        'void-navy': '#0B1120',
        'industrial-gray': '#64748B',
        'surface-ice': '#FBFEF9',
        // Surface
        'surface': '#f7fafd',
        'surface-dim': '#d7dadd',
        'surface-bright': '#f7fafd',
        'surface-variant': '#e0e3e6',
        'surface-tint': '#4c53bb',
        'surface-container': '#ebeef1',
        'surface-container-low': '#f1f4f7',
        'surface-container-high': '#e5e8eb',
        'surface-container-highest': '#e0e3e6',
        'surface-container-lowest': '#ffffff',
        // On-Surface
        'on-surface': '#181c1e',
        'on-surface-variant': '#464652',
        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eef1f4',
        // Outline
        'outline': '#767684',
        'outline-variant': '#c6c5d5',
        // Primary
        'primary': '#00003e',
        'on-primary': '#ffffff',
        'primary-container': '#02027f',
        'on-primary-container': '#787fea',
        'primary-fixed': '#e0e0ff',
        'primary-fixed-dim': '#bfc2ff',
        'on-primary-fixed': '#00006e',
        'on-primary-fixed-variant': '#3339a2',
        'inverse-primary': '#bfc2ff',
        // Secondary
        'secondary': '#006e29',
        'on-secondary': '#ffffff',
        'secondary-container': '#4dff79',
        'on-secondary-container': '#00732b',
        'secondary-fixed': '#6aff86',
        'secondary-fixed-dim': '#24e462',
        'on-secondary-fixed': '#002107',
        'on-secondary-fixed-variant': '#00531d',
        // Tertiary
        'tertiary': '#060c1a',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#1c2232',
        'on-tertiary-container': '#83899d',
        'tertiary-fixed': '#dde2f8',
        'tertiary-fixed-dim': '#c1c6db',
        'on-tertiary-fixed': '#151b2b',
        'on-tertiary-fixed-variant': '#414658',
        // Error
        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        // Background
        'background': '#f7fafd',
        'on-background': '#181c1e',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        'headline': ['Hanken Grotesk', 'sans-serif'],
        'mono-label': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.05em' }],
        'action-md': ['14px', { lineHeight: '20px', fontWeight: '600' }],
      },
      spacing: {
        'base': '8px',
        'gutter': '24px',
        'margin-mobile': '16px',
        'margin-desktop': '48px',
        'container-max': '1280px',
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        'full': '9999px',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s infinite',
      },
      keyframes: {
        pulseDot: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(0, 217, 89, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 6px rgba(0, 217, 89, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(0, 217, 89, 0)' },
        },
      },
      boxShadow: {
        'bms-hover': '0px 4px 20px rgba(2, 2, 127, 0.05)',
        'login': '0 4px 40px rgba(2, 2, 127, 0.06)',
      },
    },
  },
  plugins: [],
};
