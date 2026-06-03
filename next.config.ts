import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  basePath: '/autotask-app',
  assetPrefix: '/autotask-app'
};

export default nextConfig;
