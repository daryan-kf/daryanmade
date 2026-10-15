import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: { qualities: [75, 85] },
  async redirects() {
    return [
      { source: "/da/projects/vela", destination: "/da/vela", permanent: true },
      { source: "/da/villa", destination: "/da/vela", permanent: true },
      { source: "/da/projects/iqra", destination: "/da/iqra", permanent: true },
      { source: "/projects/vela", destination: "/vela", permanent: true },
      { source: "/villa", destination: "/vela", permanent: true },
      { source: "/projects/iqra", destination: "/iqra", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
    ] }];
  }
};

export default nextConfig;
