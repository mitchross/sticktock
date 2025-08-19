/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 1000 * 60 * 5, // 5 minutes
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
      },
      {
        hostname: 'api.sticktock.staging.3nsoft.net',
      },
    ],
  },
  redirects: async () => {
    return [];
  },
};

export default nextConfig;
