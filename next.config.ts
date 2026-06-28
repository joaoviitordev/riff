import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/riff-favicon.svg",
      },
    ];
  },
};

export default nextConfig;
