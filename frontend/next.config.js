/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from common avatar/asset CDNs
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
  // Proxy API calls to backend in dev (avoids CORS in local dev)
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/backend/:path*",
            destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
          },
        ]
      : [];
  },
};

module.exports = nextConfig;
