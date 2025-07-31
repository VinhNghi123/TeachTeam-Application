/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [];
  },
  server: {
    port: 3001
  }
};

export default nextConfig;
