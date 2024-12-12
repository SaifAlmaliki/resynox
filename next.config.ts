import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The 'experimental' property is used for Next.js experimental features.
  // Here, we are configuring the maximum allowed body size for server actions.
  // Setting 'bodySizeLimit' to '4mb' means that server actions can handle up to 4 MB of request body data.
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },

  // The 'images' configuration specifies allowed domains and patterns for remote images.
  // This is necessary if you are serving images from a remote source.
  images: {
    // 'remotePatterns' allows you to define a list of remote image sources that are allowed by Next.js's Image component.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ycpy9sns92utpex7.public.blob.vercel-storage.com"
        // Here, images served from this specific hostname over HTTPS
        // are considered allowed and can be optimized by Next.js.
      }
    ]
  }
};

export default nextConfig;
