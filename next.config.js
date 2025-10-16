/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bfepfhqwdzfpirxtbwab.supabase.co',
        pathname: '/storage/v1/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    
    // Exclude Puppeteer from webpack bundling (serverless incompatible)
    if (isServer) {
      config.externals = [...(config.externals || []), 'puppeteer-core', '@sparticuz/chromium'];
    }
    
    return config;
  },
}

module.exports = nextConfig

