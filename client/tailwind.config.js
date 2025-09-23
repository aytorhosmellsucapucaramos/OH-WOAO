/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dog-orange': '#FF6B35',
        'dog-brown': '#8B4513',
        'dog-cream': '#F5DEB3',
        'dog-blue': '#4A90E2',
        'dog-green': '#7ED321',
      },
      fontFamily: {
        'dog': ['Comic Sans MS', 'cursive'],
      },
      animation: {
        'wag': 'wag 0.5s ease-in-out infinite alternate',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        wag: {
          '0%': { transform: 'rotate(-10deg)' },
          '100%': { transform: 'rotate(10deg)' },
        }
      }
    },
  },
  plugins: [],
}
