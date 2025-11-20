/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@volcabulary/types'],
  experimental: {
    typedRoutes: true,
  },
}

module.exports = nextConfig
