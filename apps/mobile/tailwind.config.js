/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/shared/components/**/*.{js,ts,tsx}',
    './src/app/**/*.{js,ts,tsx}',
    './src/features/*/{components,screens}/**/*.{js,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          active: 'hsl(var(--primary-active))',
          disabled: 'hsl(var(--primary-disabled))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        ink: 'hsl(var(--ink))',
        body: {
          DEFAULT: 'hsl(var(--body))',
          strong: 'hsl(var(--body-strong))',
        },
        'muted-soft': 'hsl(var(--muted-soft))',
        hairline: {
          DEFAULT: 'hsl(var(--hairline))',
          soft: 'hsl(var(--hairline-soft))',
        },
        canvas: 'hsl(var(--canvas))',
        surface: {
          soft: 'hsl(var(--surface-soft))',
          card: 'hsl(var(--surface-card))',
          strong: 'hsl(var(--surface-strong))',
          dark: 'hsl(var(--surface-dark))',
          'dark-elevated': 'hsl(var(--surface-dark-elevated))',
        },
        'on-primary': 'hsl(var(--on-primary))',
        'on-dark': {
          DEFAULT: 'hsl(var(--on-dark))',
          soft: 'hsl(var(--on-dark-soft))',
        },
        semantic: {
          up: 'hsl(var(--semantic-up))',
          down: 'hsl(var(--semantic-down))',
        },
        'accent-yellow': 'hsl(var(--accent-yellow))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      fontFamily: {
        sans: ['JetBrainsMono_400Regular', 'monospace'],
        'sans-medium': ['JetBrainsMono_500Medium', 'monospace'],
        'sans-bold': ['JetBrainsMono_700Bold', 'monospace'],
        heading: ['JetBrainsMono_700Bold', 'monospace'],
        mono: ['JetBrainsMono_400Regular', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};
