import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/login", destination: "/dang-nhap", permanent: false }];
  },
};

export default nextConfig;
