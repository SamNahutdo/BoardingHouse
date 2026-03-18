/** @type {import('next').NextConfig} */
const shouldStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages is static hosting, so we optionally export HTML/JS into `out/`.
  // For Vercel we keep the default Next.js server output.
  output: shouldStaticExport ? 'export' : undefined,
  basePath: shouldStaticExport ? process.env.NEXT_PUBLIC_BASE_PATH || undefined : undefined,
  trailingSlash: true,
};

export default nextConfig;

