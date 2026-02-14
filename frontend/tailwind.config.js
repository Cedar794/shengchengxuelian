/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A90D9',
          light: '#7BB3E8',
          lighter: '#E3F0FD',
          dark: '#3A7BC8',
        },
        success: '#52C41A',
        warning: '#FA8C16',
        error: '#F5222D',
        info: '#1890FF',
        gray: {
          50: '#FAFBFC',
          100: '#F5F7FA',
          200: '#E0E6ED',
          300: '#D9D9D9',
          600: '#5A6C7D',
          700: '#2C3E50',
          800: '#1F2937',
          900: '#8C8C8C',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 2px 8px rgba(0, 0, 0, 0.08)',
        lg: '0 4px 16px rgba(0, 0, 0, 0.12)',
        xl: '0 8px 24px rgba(0, 0, 0, 0.15)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}
