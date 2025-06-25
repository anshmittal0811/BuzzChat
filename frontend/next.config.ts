import { withNextVideo } from "next-video/process";
import type { NextConfig } from "next";
import type { NextConfigComplete } from "next/dist/server/config-shared";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['res.cloudinary.com'],
  },

  async rewrites() {
    return [
      {
        source: "/api/auth/:path*", // your internal route
        destination: "http://localhost:5000/auth/:path*", // external API URL
      },
      {
        source: "/users", // your internal route
        destination: "/chat", // external API URL
      },
    ];
  },
} as NextConfigComplete;

export default withNextVideo(nextConfig);