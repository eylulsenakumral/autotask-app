import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages deployment
  output: 'export',
  images: {
    unoptimized: true
  },
  // Subdirectory path for GitHub Pages
  basePath: '/autotask-app',
  assetPrefix: '/autotask-app',
  // Disable server features for static export
  trailingSlash: true,

  // Skip static generation for routes with dynamic params
  // We'll handle these client-side only
  experimental: {
    // Force static generation
    cpus: 1
  }
};

export default nextConfig;
