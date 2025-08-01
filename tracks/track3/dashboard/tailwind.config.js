/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        blood: {
          'A+': '#e74c3c',
          'A-': '#c0392b',
          'B+': '#3498db',
          'B-': '#2980b9',
          'AB+': '#9b59b6',
          'AB-': '#8e44ad',
          'O+': '#e67e22',
          'O-': '#d35400',
        },
        status: {
          critical: '#dc2626',
          low: '#f59e0b',
          adequate: '#10b981',
          optimal: '#059669',
          excess: '#6366f1',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
