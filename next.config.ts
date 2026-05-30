import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repoBasePath = '/camera-selector';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isGitHubPages ? repoBasePath : undefined,
  assetPrefix: isGitHubPages ? repoBasePath : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
