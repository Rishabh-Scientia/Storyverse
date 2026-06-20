import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingIncludes: {
    "**": ["./dev.db"],
  },
};

export default nextConfig;
