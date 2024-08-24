/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-vercel-deployment-url.com', 'zenquotes.io'],
  },
};

module.exports = nextConfig;