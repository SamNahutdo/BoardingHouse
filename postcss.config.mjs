/**
 * PostCSS configuration for Next.js.
 *
 * Tailwind v4 needs the Tailwind PostCSS plugin when not using Vite.
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
