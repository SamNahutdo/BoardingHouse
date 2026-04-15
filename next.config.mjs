/** @type {import('next').NextConfig} */
import fs from 'fs';
import path from 'path';

const shouldStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

const basePath = shouldStaticExport ? process.env.NEXT_PUBLIC_BASE_PATH || undefined : undefined;

const nextConfig = {
  reactStrictMode: true,
  output: shouldStaticExport ? 'export' : undefined,
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack(config, { isServer }) {
    // Copy public folder contents into the static export output directory
    if (isServer && shouldStaticExport) {
      config.plugins.push({
        name: 'CopyPublicFilesPlugin',
        apply: function(compiler) {
          compiler.hooks.afterEmit.tap('CopyPublicFilesPlugin', () => {
            const outputPath = compiler.options.output.path;
            // outputPath is .next/server — we want to copy public into the export root (out/)
            const exportPath = path.join(process.cwd(), 'out');
            const publicPath = path.join(process.cwd(), 'public');

            function copyDir(src, dest) {
              if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
              }

              const files = fs.readdirSync(src);
              files.forEach(file => {
                const srcPath = path.join(src, file);
                const destPath = path.join(dest, file);
                const stat = fs.statSync(srcPath);

                if (stat.isDirectory()) {
                  copyDir(srcPath, destPath);
                } else {
                  fs.copyFileSync(srcPath, destPath);
                }
              });
            }

            if (fs.existsSync(publicPath) && fs.existsSync(exportPath)) {
              copyDir(publicPath, exportPath);
            }
          });
        },
      });
    }
    return config;
  },
};

export default nextConfig;

