/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', './src/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Dynamic class names that you want to keep
    'bg-purple-700',
    'bg-orange-700',
    'bg-green-700',
    'bg-pink-700',
    'bg-pink-200',
    'bg-slate-200',
    'bg-sky-200',
    'bg-amber-200',

    'border-purple-700',
    'border-orange-700',
    'border-green-700',
    'border-pink-700',

    'text-purple-700',
    'text-orange-700',
    'text-green-700',
    'text-pink-700',
    // Add more dynamic class names as needed
  ],
}

