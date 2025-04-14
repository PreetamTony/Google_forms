/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn1.iconfinder.com', 'cdn4.iconfinder.com', 'i.pinimg.com'],
  },
  // Disable tracing to avoid permission issues
  output: 'standalone',
  // Simplified experimental options
  experimental: {
    // Empty for now
  },
}

module.exports = nextConfig