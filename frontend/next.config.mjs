const BASE_DOMAIN = 'example.com';
const FRONTEND_NEXT_INTERNAL_URL = `https://www.${BASE_DOMAIN}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 1000 * 60 * 5, // 5 minutes
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
      },
      {
        hostname: 'smolvideo.com',
      },
    ],
  },
  redirects: async () => {
    return [
      // General redirect rule
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>[^.]+)\\.(?<domain>.+)',
          },
        ],
        destination: `${FRONTEND_NEXT_INTERNAL_URL}/sd/:subdomain/:path*`,
        permanent: false,
        // Add a condition to exclude the destination domain
        missing: [
          {
            type: 'query',
            key: 'id',
          },
          {
            type: 'host',
            value: `www.${BASE_DOMAIN}`,
          },
          {
            type: 'host',
            value: BASE_DOMAIN,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
