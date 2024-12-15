import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    theme: {
      extend: {
        colors: {
          background: '#F1F1F1',  // Off-white with a purple tint
          white: '#FFFFFF',       // Base white
          accent: '#8585FF',      // Soft purple for highlights
          primary: '#5D5DFF',     // Deep indigo for branding
          text: '#444054',        // Neutral text with a purple hint
          "base-100": "#F3F2EF",  // Lightest grey
          secondary: '#333366',
          "accent-light" : '#E6E3F0', // Slightly lighter version of accent color
        },
      },
    },
  },
}

