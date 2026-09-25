import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Routes with loading.tsx are fully prefetched and held in the client
  // router cache for staleTimes.static (default 300s) - that made new
  // content (demands, jobs, news…) invisible for ~5 min after publishing.
  experimental: {
    staleTimes: { dynamic: 0, static: 0 },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      // Backend-served media URLs (GCS private bucket redirects through the API).
      { protocol: 'https', hostname: 'hacama-api-370098605562.africa-south1.run.app' },
      { protocol: 'http', hostname: 'localhost', port: '4000' },
      { protocol: 'http', hostname: '127.0.0.1', port: '4000' },
    ],
  },
};

export default nextConfig;
