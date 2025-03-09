import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**", // Cho phép tất cả các domain
      },
      {
        protocol: "https",
        hostname: "**", // Cho phép tất cả các domain
      },
    ],
    unoptimized: true // Tắt tối ưu hóa để tránh vấn đề với các domain
  },
};

export default nextConfig;
