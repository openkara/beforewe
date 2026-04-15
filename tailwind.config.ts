import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#071F14',
          50: '#0A2E1E',
          100: '#0D3D28',
          200: '#134D34',
          300: '#1A5E40',
          400: '#216F4C',
        },
        mint: {
          DEFAULT: '#12B87A',
          50: '#E8FBF2',
          100: '#B5F0D8',
          200: '#82E5BE',
          300: '#4FDAA4',
          400: '#12B87A',
          500: '#0E9563',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
