/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'your-supabase-project.supabase.co', // Supabase storage
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

