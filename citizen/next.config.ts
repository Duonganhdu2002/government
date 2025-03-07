import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "http",
        hostname: "images.pexels.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
      },
      // Nếu cần dùng https cho localhost:
      {
        protocol: "https",
        hostname: "localhost",
        port: "8080",
      },
    ],
  },
};

export default nextConfig;
