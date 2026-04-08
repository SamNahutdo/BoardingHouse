/** @type {import('next').NextConfig} */
const shouldStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

const basePath = shouldStaticExport ? process.env.NEXT_PUBLIC_BASE_PATH || undefined : undefined;

const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages is static hosting, so we optionally export HTML/JS into `out/`.
  // For Vercel we keep the default Next.js server output.
  output: shouldStaticExport ? 'export' : undefined,
  basePath,
  // Ensure all generated asset URLs (CSS/JS/images under `/_next/`) are rooted correctly on GitHub Pages.
  assetPrefix: basePath,
  trailingSlash: true,
};

module.exports = nextConfig;

