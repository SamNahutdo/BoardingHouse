/** @type {import('next').NextConfig} */
import fs from 'fs';
import path from 'path';

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
  webpack(config, { isServer }) {
    if (isServer) {
      config.plugins.push({
        name: 'CopyServerChunksPlugin',
        apply: function(compiler) {
          compiler.hooks.afterEmit.tap('CopyServerChunksPlugin', () => {
            const outputPath = compiler.options.output.path;
            const chunksPath = path.join(outputPath, 'chunks');
            if (!fs.existsSync(chunksPath)) {
              return;
            }
            for (const file of fs.readdirSync(chunksPath)) {
              if (file.endsWith('.js')) {
                const src = path.join(chunksPath, file);
                const dest = path.join(outputPath, file);
                fs.copyFileSync(src, dest);
              }
            }
          });
        },
      });
    }
    return config;
  },
};

export default nextConfig;

