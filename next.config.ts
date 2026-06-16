import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    outputFileTracingIncludes: {
      "**": ["./dev.db"],
    },
  } as any,
};

export default nextConfig;
