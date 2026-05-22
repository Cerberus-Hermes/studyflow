/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{vue,js,ts}',
    './app/**/**/*.{vue,js,ts}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sf: {
          bg: 'var(--bg-primary)',
          'bg-secondary': 'var(--bg-secondary)',
          'bg-tertiary': 'var(--bg-tertiary)',
          card: 'var(--bg-card)',
          glass: 'var(--bg-glass)',
          text: 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          warm: 'var(--accent-warm)',
          'warm-light': 'var(--accent-warm-light)',
          cool: 'var(--accent-cool)',
          'cool-light': 'var(--accent-cool-light)',
          purple: 'var(--accent-purple)',
          rose: 'var(--accent-rose)',
          border: 'var(--border-subtle)',
          'border-medium': 'var(--border-medium)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'sf-sm': '12px',
        'sf-md': '16px',
        'sf-lg': '24px',
        'sf-xl': '32px',
      },
      boxShadow: {
        'sf-card': 'var(--shadow-card)',
        'sf-elevated': 'var(--shadow-elevated)',
        'sf-glow': 'var(--shadow-glow)',
      },
      animation: {
        'slide-up': 'slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'float': 'float 4s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
