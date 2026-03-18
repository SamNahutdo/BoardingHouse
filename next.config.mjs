/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages is static hosting, so we must export HTML/JS into `out/`.
  output: 'export',
  // Your GitHub Pages URL is: https://<user>.github.io/<repo>/
  basePath: '/BoardingHouse',
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: '/BoardingHouse',
  },
};

export default nextConfig;

