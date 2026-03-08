/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#25e2f4',
                'background-light': '#f5f8f8',
                'background-dark': '#080c0d',
                glass: 'rgba(16, 33, 34, 0.7)',
                'neon-glow': 'rgba(37, 226, 244, 0.15)',
                border: 'rgba(37, 226, 244, 0.1)',
                input: 'rgba(37, 226, 244, 0.1)',
                ring: '#25e2f4',
                background: '#080c0d',
                foreground: '#e2e8f0',
                muted: {
                    DEFAULT: 'rgba(16, 33, 34, 0.7)',
                    foreground: '#64748b',
                },
                card: {
                    DEFAULT: 'rgba(16, 33, 34, 0.7)',
                    foreground: '#e2e8f0',
                },
                destructive: {
                    DEFAULT: '#ef4444',
                    foreground: '#fecaca',
                },
                accent: {
                    DEFAULT: 'rgba(37, 226, 244, 0.1)',
                    foreground: '#25e2f4',
                },
            },
            fontFamily: {
                display: ['Space Grotesk', 'system-ui', 'sans-serif'],
                sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            borderRadius: {
                DEFAULT: '1rem',
                lg: '2rem',
                xl: '3rem',
                full: '9999px',
                md: '0.75rem',
                sm: '0.5rem',
            },
            keyframes: {
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
            },
            animation: {
                'shimmer': 'shimmer 2s infinite linear',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
