import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#284E4C',
          dark: '#10393C',
          light: '#CBD4D3',
        },
        text: {
          primary: '#0A0A0A',
          secondary: '#333333',
          muted: '#6B7280',
        },
        surface: {
          white: '#FFFFFF',
          gray: 'rgba(249, 250, 251, 0.5)',
          yellow: '#FFF9E9',
        },
        border: {
          gray: '#D1D5DB',
          subtle: 'rgba(0, 0, 0, 0.1)',
        },
        success: '#25D366',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        hero: ['72px', { lineHeight: '72px', fontWeight: '700' }],
        h2: ['26px', { fontWeight: '700' }],
        h3: ['14px', { fontWeight: '500' }],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        card: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
        button: '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
        elevated: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      spacing: {
        'container-mobile': '16px',
        'container-desktop': '48px',
      },
    },
  },
  plugins: [],
};

export default config;
