import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/sidepanel/index.html'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config