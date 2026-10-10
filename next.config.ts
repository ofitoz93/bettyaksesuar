import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    // middleware.ts varken istek gövdesi varsayılan olarak 10MB'ta kesiliyor;
    // fotoğraflı ürün formları için server action limitiyle aynı tutulur.
    proxyClientMaxBodySize: "50mb",
  },
  images: {
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
