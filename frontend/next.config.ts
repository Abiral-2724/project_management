/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Uncomment if you are using server actions, otherwise remove it
    // serverActions: {},
  },
  typescript: {
    ignoreBuildErrors: true,
    
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.asana.biz",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;
