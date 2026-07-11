import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    // only proxy to localhost:8000 when developing locally
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          // The backend expects /api/v1/... because of the added prefix
          destination: 'http://localhost:8000/api/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
