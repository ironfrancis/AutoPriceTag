/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E88E5',
          blue: '#1E88E5',
        },
        secondary: {
          DEFAULT: '#FF9800',
          orange: '#FF9800',
        },
        success: '#4CAF50',
        warning: '#F44336',
        info: '#2196F3',
        neutral: '#F5F7FA',
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // 明确禁用暗黑模式
  darkMode: 'class', // 使用 class 策略但不提供切换功能
}
