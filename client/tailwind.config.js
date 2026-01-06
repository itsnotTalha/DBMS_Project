/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // <--- This line is crucial!
  ],
  theme: {
    extend: {
      fontFamily: {
        // Add this to use font-['Poppins'] in your code
        'poppins': ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}