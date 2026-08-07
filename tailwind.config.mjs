/** @type {import('tailwindcss').Config} */

export const tokens = {
  colors: {
    primary: '#2563EB',
    'neutral-bg': '#F8F9FA',
    'text-main': '#0A192F',
    'card-bg': '#FFFFFF',
  },
  typography: {
    serif: "'Cormorant Garamond', Georgia, serif",
    sans: "'Outfit', Inter, sans-serif",
  },
  rounded: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    full: '9999px',
  },
  spacing: {
    sm: '8px',
    md: '16px',
    lg: '32px',
  },
  shadows: {
    ambient: '0 4px 20px rgba(10, 25, 47, 0.05)',
  },
};

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        'neutral-bg': tokens.colors['neutral-bg'],
        'text-main': tokens.colors['text-main'],
        'card-bg': tokens.colors['card-bg'],
        // Semantic Token Custom Property Mappings (AD-04 & TASK-TOK-002)
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'bg-card': 'var(--bg-card)',
        'bg-surface-dark': 'var(--bg-surface-dark)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-accent': 'var(--text-accent)',
        'text-on-accent': 'var(--text-on-accent)',
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        'border-accent': 'var(--border-accent)',
        // Backwards compatibility mappings
        'primary-bg': 'var(--color-primary-bg)',
        'accent-primary': 'var(--color-accent-primary)',
        'accent-highlight': 'var(--color-accent-highlight)',
        'accent-light': 'var(--color-accent-light)',
        'hero-accent': 'var(--color-hero-accent)',
        'hero-accent-highlight': 'var(--color-hero-accent-highlight)',
        'hero-ice-blue': 'var(--color-hero-ice-blue)',
        'hero-ice-blue-hover': 'var(--color-hero-ice-blue-hover)',
        'hero-surface': 'var(--color-hero-surface)',
        'hero-glow': 'var(--color-hero-glow)',
        'hero-card': 'var(--color-hero-card)',
        'success-primary': 'var(--color-success-primary)',
        'success-hover': 'var(--color-success-hover)',
        'success-bg': 'var(--color-success-bg)',
        'success-border': 'var(--color-success-border)',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Outfit', 'Inter', 'sans-serif'],
        arabic: ['Cairo', 'system-ui', 'sans-serif'],
        latin: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: tokens.rounded,
      spacing: tokens.spacing,
      boxShadow: {
        ambient: tokens.shadows.ambient,
      },
    },
  },
  plugins: [],
};
