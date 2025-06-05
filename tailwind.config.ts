import type { Config } from 'tailwindcss';
import { theme } from './src/styles/theme';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary,
        neutral: theme.colors.neutral,
        accent: theme.colors.accent,
        background: theme.colors.background,
        gray: theme.colors.gray,
        success: theme.colors.success,
        link: theme.colors.link,
      },
      fontFamily: {
        sans: [theme.fonts.primary],
        display: [theme.fonts.secondary],
      },
      container: {
        center: true,
        padding: theme.spacing.container.padding,
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
      },
      borderRadius: theme.borderRadius,
    },
  },
  plugins: [],
};

export default config; 